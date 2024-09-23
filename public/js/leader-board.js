const socket = io();

let raceData = {
  drivers: [],
  remainingTime: 600, // 10 minutes in seconds
  raceMode: "Safe",
};

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
                <td>${driver.fastestLap.toFixed(3)}s</td>
                <td>${driver.currentLap}</td>
            </tr>
        `;
    leaderboardBody.innerHTML += row;
  });
}

function updateRaceInfo() {
  const remainingTimeElement = document.getElementById("remainingTime");
  const raceModeElement = document.getElementById("raceMode");

  if (!remainingTimeElement) {
    console.error("Remaining time element not found");
    return;
  }
  if (!raceModeElement) {
    console.error("Race mode element not found");
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
      return "blue";
  }
}

// Socket.IO event listeners
socket.on("raceUpdate", (data) => {
  raceData = data;
  updateLeaderboard();
  updateRaceInfo();
});

socket.on("raceStart", (initialData) => {
  raceData = initialData;
  updateLeaderboard();
  updateRaceInfo();
});

socket.on("raceEnd", () => {
  // Handle race end (e.g., display final results, show a message)
  alert("Race has ended!");
});

// Wait for DOM to be fully loaded before initializing
document.addEventListener("DOMContentLoaded", () => {
  // Initial update
  updateLeaderboard();
  updateRaceInfo();

  // Request initial race data from server
  socket.emit("requestRaceData");
});
