const socket = io(); // Initialize Socket.IO client

let raceData = {
  drivers: [], // Array to store driver information
  remainingTime: 600, // 10 minutes in seconds
  raceMode: "Danger", // Initial race mode
  isRaceActive: false, // Flag to indicate if the race is active
};

let countdownInterval; // Variable to store the countdown interval

// Function to update the leaderboard
function updateLeaderboard() {
  const leaderboardBody = document.getElementById("leaderboardBody"); // Get the leaderboard body element
  if (!leaderboardBody) {
    console.error("Leaderboard body element not found"); // Log error if element is not found
    return;
  }

  if (raceData.drivers.length === 0) {
    leaderboardBody.innerHTML =
      '<tr><td colspan="5">Waiting for race data...</td></tr>'; // Display message if no drivers are present
    return;
  }

  leaderboardBody.innerHTML = ""; // Clear existing leaderboard content

  // Sort drivers by car ID first, then by fastest lap time
  raceData.drivers.sort((a, b) => {
    if (a.carNumber !== b.carNumber) {
      return a.carNumber - b.carNumber; // Sort by car number
    }
    if (a.fastestLap && b.fastestLap) {
      return a.fastestLap - b.fastestLap; // Sort by fastest lap time
    }
    return 0; // If car numbers and fastest lap times are equal, maintain order
  });

  // Iterate over each driver and create a row for the leaderboard
  raceData.drivers.forEach((driver, index) => {
    const row = `
            <tr>
                <td>${index + 1}</td>
                <td>${driver.carNumber}</td>
                <td>${driver.driver}</td>
                <td>${
                  driver.fastestLap ? driver.fastestLap.toFixed(3) : "N/A"
                }s</td>
                <td>${driver.currentLap || 0}</td>
            </tr>
        `;
    leaderboardBody.innerHTML += row; // Append the row to the leaderboard body
  });
}

// Function to update race information
function updateRaceInfo() {
  const remainingTimeElement = document.getElementById("remainingTime"); // Get the remaining time element
  const raceModeElement = document.getElementById("raceMode"); // Get the race mode element

  if (!remainingTimeElement || !raceModeElement) {
    console.error("Race info elements not found"); // Log error if elements are not found
    return;
  }

  // Update remaining time
  const minutes = Math.floor(raceData.remainingTime / 60); // Calculate minutes
  const seconds = raceData.remainingTime % 60; // Calculate seconds
  remainingTimeElement.textContent = `Time: ${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`; // Update the remaining time display

  // Update race mode
  raceModeElement.textContent = `Race Mode: ${raceData.raceMode}`; // Update the race mode display
  raceModeElement.style.backgroundColor = getRaceModeColor(raceData.raceMode); // Update the background color based on race mode
}

// Function to get the color for the race mode
function getRaceModeColor(mode) {
  switch (mode) {
    case "Safe":
      return "green"; // Safe mode color
    case "Hazard":
      return "yellow"; // Hazard mode color
    case "Danger":
      return "red"; // Danger mode color
    case "Finish":
      return "gray"; // Finish mode color
    default:
      return "red"; // Default color
  }
}

// Function to end the race
function endRace() {
  raceData.isRaceActive = false; // Set race active flag to false
  clearInterval(countdownInterval); // Clear the countdown interval
  raceData.raceMode = "Finish"; // Set race mode to Finish
  updateRaceInfo(); // Update race information
  socket.emit("endRace"); // Emit end race event to the server
}

// Socket.IO event listeners
socket.on("raceUpdate", (data) => {
  raceData = { ...raceData, ...data }; // Merge received data with existing race data
  updateLeaderboard(); // Update the leaderboard
  updateRaceInfo(); // Update race information
});

socket.on("raceStarted", ({ race }) => {
  raceData = {
    ...raceData,
    drivers: race.drivers, // Set drivers from received race data
    remainingTime: 600, // Reset to 10 minutes
    raceMode: "Safe", // Set race mode to Safe
    isRaceActive: true, // Set race active flag to true
  };

  if (countdownInterval) {
    clearInterval(countdownInterval); // Clear existing countdown interval if any
  }

  // Set a delay before starting the countdown
  setTimeout(() => {
    // Start the countdown interval
    countdownInterval = setInterval(() => {
      if (raceData.isRaceActive && raceData.remainingTime > 0) {
        raceData.remainingTime--; // Decrement remaining time
        if (raceData.remainingTime <= 0) {
          endRace(); // End the race if time runs out
        }
        updateLeaderboard(); // Update the leaderboard
        updateRaceInfo(); // Update race information
      }
    }, 1000); // Interval set to 1 second
  }, 11000); // Delay set to 6 seconds

  updateLeaderboard(); // Initial leaderboard update
  updateRaceInfo(); // Initial race information update
});

socket.on("raceFlags", (flag) => {
  raceData.raceMode = flag; // Update race mode
  updateRaceInfo(); // Update race information
  if (flag === "Finish") {
    endRace(); // End the race if the flag is Finish
  }
});

socket.on("lapUpdate", (data) => {
  console.log("Lap update received:", data); // Debugging log
  const { carId, laps, lapTime } = data;

  // Find the driver and update their lap count and lap time
  const driver = raceData.drivers.find(driver => driver.carNumber === carId);
  if (driver) {
    if (!driver.lapTimes) {
      driver.lapTimes = []; // Initialize lap times array if not present
    }
    driver.lapTimes.push(lapTime); // Add the new lap time
    driver.currentLap = laps; // Update current lap count
    driver.lastLapTime = lapTime; // Update last lap time
    driver.fastestLap = Math.min(...driver.lapTimes); // Update fastest lap time
  }

  updateLeaderboard(); // Update the leaderboard
});

// Initialize the leaderboard
document.addEventListener("DOMContentLoaded", () => {
  updateLeaderboard(); // Initial leaderboard update
  updateRaceInfo(); // Initial race information update
  socket.emit("getRaceSessions"); // Request race sessions from the server
});

// Request initial race data from server
socket.emit("requestRaceData");

// Handle finish button click (assuming it's in the race control page)
document.getElementById("finish").addEventListener("click", () => {
  endRace(); // End the race when the finish button is clicked
});