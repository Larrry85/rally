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
    document.getElementById("lapLinerApp").style.display = "grid"; // Use grid display
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

  const header = document.createElement("h2");
  header.textContent = "Lap Tracker";
  lapLinerApp.appendChild(header);



  // Create buttons and place them in the grid
  carIds.forEach((carId, index) => {
    const button = document.createElement("button");
    button.textContent = `${carId}`;
    button.disabled = true; // Initially disable the buttons
    button.addEventListener("click", () => {
      addLap(carId);
    });

    // Calculate grid position for diagonal placement
    const row = 8 - index; // Adjust for bottom-to-top placement
    const col = index + 1; // Left-to-right placement
    button.style.gridRow = `${row}`;
    button.style.gridColumn = `${col}`;

    lapLinerApp.appendChild(button);
  });

  const returnButton = document.createElement("button");
  returnButton.textContent = "Return";
  returnButton.classList.add("red-button"); // Add CSS class to button
  returnButton.addEventListener("click", () => {
    // Reset the lapLinerApp to its default state
    lapLinerApp.innerHTML = `
      <h2>Lap Tracker</h2>
    `;
  });
  lapLinerApp.appendChild(returnButton);
});

// Enable buttons when the race starts
socket.on("raceStarted", () => {
  const buttons = document.querySelectorAll("#lapLinerApp button");
  buttons.forEach(button => button.disabled = false);

  // Automatically disable buttons after 10 minutes
  setTimeout(() => {
    buttons.forEach(button => button.disabled = true);
  }, 10 * 60 * 1000); // 10 minutes in milliseconds
});

// Disable buttons when the race finishes
socket.on("raceFinished", () => {
  const buttons = document.querySelectorAll("#lapLinerApp button");
  buttons.forEach(button => button.disabled = true);
});

function addLap(carId) {
  if (!raceData.laps[carId]) {
    raceData.laps[carId] = 0;
  }
  raceData.laps[carId]++;
  const lapTime = new Date().toLocaleTimeString();

  // Emit lap data to the server
  socket.emit("lapAdded", { carId, laps: raceData.laps[carId], lapTime });
}