const socket = io();

let raceData = {
  drivers: [],
  laps: {}
};

// Handle login
document.getElementById("loginButton").addEventListener("click", () => {
  const key = document.getElementById("accessKey").value;
  socket.emit("authenticate", key); // Emit authentication event
});

socket.on("authenticated", (data) => {
  const messageContainer = document.getElementById("loginMessage");
  if (data.success && data.role === "lapLineTracker") {
    messageContainer.textContent = "";
    document.getElementById("login").style.display = "none";
    document.getElementById("lapLinerApp").style.display = "block";
    socket.emit("getRaceSessions"); // Request current race sessions
  } else {
    messageContainer.textContent = "Invalid access key";
    document.getElementById("accessKey").value = ""; // Clear the input field
  }
});

socket.on("carIds", (carIds) => {
  console.log("Received car list:", carIds); // Debugging log
  const lapLinerApp = document.getElementById("lapLinerApp");
  lapLinerApp.innerHTML = ""; // Clear existing buttons
  carIds.forEach((carId) => {
    const button = document.createElement("button");
    button.textContent = `Car ${carId}`;
    button.addEventListener("click", () => {
      addLap(carId);
    });
    lapLinerApp.appendChild(button);
  });
});

function addLap(carId) {
  if (!raceData.laps[carId]) {
    raceData.laps[carId] = 0;
  }
  raceData.laps[carId]++;
  const lapTime = new Date().toLocaleTimeString();
  updateLeaderboard(carId, raceData.laps[carId], lapTime);

  // Emit lap data to the server
  socket.emit("lapAdded", { carId, laps: raceData.laps[carId], lapTime });
}

function updateLeaderboard(carId, laps, lapTime) {
  const leaderboardBody = document.getElementById("leaderboardBody");
  let row = document.getElementById(`car-${carId}`);
  if (!row) {
    row = document.createElement("tr");
    row.id = `car-${carId}`;
    row.innerHTML = `
      <td>${carId}</td>
      <td>${laps}</td>
      <td>${lapTime}</td>
    `;
    leaderboardBody.appendChild(row);
  } else {
    row.cells[1].textContent = laps;
    row.cells[2].textContent = lapTime;
  }
}