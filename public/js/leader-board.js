const socket = io();

let raceData = {
  drivers: [],
  remainingTime: 600, // 10 minutes in seconds
  raceMode: "Danger",
  isRaceActive: false,
};

let countdownInterval;

function updateLeaderboard() {
  const leaderboardBody = document.getElementById("leaderboardBody");
  if (!leaderboardBody) {
    console.error("Leaderboard body element not found");
    return;
  }

  if (raceData.drivers.length === 0) {
    leaderboardBody.innerHTML =
      '<tr><td colspan="5">Waiting for race data...</td></tr>';
    return;
  }

  leaderboardBody.innerHTML = "";

  // Sort drivers by fastest lap time
  raceData.drivers.sort((a, b) => a.fastestLap - b.fastestLap);

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
    leaderboardBody.innerHTML += row;
  });
}

function updateRaceInfo() {
  const remainingTimeElement = document.getElementById("remainingTime");
  const raceModeElement = document.getElementById("raceMode");

  if (!remainingTimeElement || !raceModeElement) {
    console.error("Race info elements not found");
    return;
  }

  // Update remaining time
  const minutes = Math.floor(raceData.remainingTime / 60);
  const seconds = raceData.remainingTime % 60;
  remainingTimeElement.textContent = `Time: ${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;

  // Update race mode
  raceModeElement.textContent = `Race Mode: ${raceData.raceMode}`;
  raceModeElement.style.backgroundColor = getRaceModeColor(raceData.raceMode);
}

function getRaceModeColor(mode) {
  switch (mode) {
    case "Safe":
      return "green";
    case "Hazard":
      return "yellow";
    case "Danger":
      return "red";
    case "Finish":
      return "gray";
    default:
      return "red";
  }
}

function endRace() {
  raceData.isRaceActive = false;
  clearInterval(countdownInterval);
  raceData.raceMode = "Finish";
  updateRaceInfo();
  socket.emit("endRace");
}

// Socket.IO event listeners
socket.on("raceUpdate", (data) => {
  raceData = { ...raceData, ...data };
  updateLeaderboard();
  updateRaceInfo();
});

socket.on("raceStarted", ({ race }) => {
  raceData = {
    ...raceData,
    drivers: race.drivers,
    remainingTime: 600, // Reset to 10 minutes
    raceMode: "Safe",
    isRaceActive: true,
  };

  if (countdownInterval) {
    clearInterval(countdownInterval);
  }

  countdownInterval = setInterval(() => {
    if (raceData.isRaceActive && raceData.remainingTime > 0) {
      raceData.remainingTime--;
      if (raceData.remainingTime <= 0) {
        endRace();
      }
      updateLeaderboard();
      updateRaceInfo();
    }
  }, 1000);

  updateLeaderboard();
  updateRaceInfo();
});

socket.on("raceFlags", (flag) => {
  raceData.raceMode = flag;
  updateRaceInfo();
  if (flag === "Finish") {
    endRace();
  }
});

// Initialize the leaderboard
document.addEventListener("DOMContentLoaded", () => {
  updateLeaderboard();
  updateRaceInfo();
  socket.emit("getRaceSessions");
});

// Request initial race data from server
socket.emit("requestRaceData");

// Handle finish button click (assuming it's in the race control page)
document.getElementById("finish").addEventListener("click", () => {
  endRace();
});
