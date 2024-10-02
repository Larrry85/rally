const socket = io(); // Initialize Socket.IO client

let raceData = {
  drivers: [], // Array to store driver information
  laps: {} // Object to store lap counts for each car
};

// Handle login button click event
document.getElementById("loginButton").addEventListener("click", () => {
  const key = document.getElementById("accessKey").value; // Get the access key from input
  socket.emit("authenticate", key); // Emit authentication event with the access key
});

// Handle authentication response from the server
socket.on("authenticated", (data) => {
  const messageContainer = document.getElementById("loginMessage");
  if (data.success && data.role === "lapLineTracker") {
    messageContainer.textContent = ""; // Clear any previous messages
    document.getElementById("login").style.display = "none"; // Hide login screen
    document.getElementById("lapLinerApp").style.display = "grid"; // Show lap tracker interface
    socket.emit("getRaceSessions"); // Request current race sessions from the server
  } else {
    messageContainer.textContent = "Invalid access key"; // Show error message
    document.getElementById("accessKey").value = ""; // Clear the input field
  }
});



// Handle car IDs received from the server
socket.on("carIds", (carIds) => {
  console.log("Received car list:", carIds); // Debugging log
  const lapLinerApp = document.getElementById("lapLinerApp");
  lapLinerApp.innerHTML = ""; // Clear existing buttons

  const header = document.createElement("h2");
  header.textContent = "Lap Tracker";
  lapLinerApp.appendChild(header); // Add header to the lap tracker interface

  // Create buttons for each car ID and place them in the grid
  carIds.forEach((carId, index) => {
    const button = document.createElement("button");
    button.textContent = `${carId}`;
    button.disabled = true; // Initially disable the buttons
    button.addEventListener("click", () => {
      addLap(carId); // Add lap when button is clicked
    });

    // Calculate grid position for diagonal placement
    const row = 8 - index; // Adjust for bottom-to-top placement
    const col = index + 1; // Left-to-right placement
    button.style.gridRow = `${row}`;
    button.style.gridColumn = `${col}`;

    lapLinerApp.appendChild(button); // Add button to the lap tracker interface
  });

  // Add the return button dynamically
  const returnButton = document.createElement("button");
  returnButton.textContent = "Return";
  returnButton.classList.add("red-button"); // Add CSS class to button
  returnButton.addEventListener("click", () => {
    // Reset the lapLinerApp to its default state
    lapLinerApp.innerHTML = `
      <h2>Lap Tracker</h2>
    `;
  });
  lapLinerApp.appendChild(returnButton); // Add return button to the lap tracker interface
});

// Enable buttons when the race starts
socket.on("raceStarted", () => {
  const buttons = document.querySelectorAll("#lapLinerApp button");
  buttons.forEach(button => button.disabled = false); // Enable all buttons

  // Automatically disable buttons after 10 minutes
  setTimeout(() => {
    buttons.forEach(button => button.disabled = true); // Disable all buttons
  }, 10 * 60 * 1000); // 10 minutes in milliseconds
});

// Disable buttons when the race finishes
socket.on("raceFinished", () => {
  const buttons = document.querySelectorAll("#lapLinerApp button");
  buttons.forEach(button => button.disabled = true); // Disable all buttons
});

// Function to add a lap for a specific car ID
function addLap(carId) {
  if (!raceData.laps[carId]) {
    raceData.laps[carId] = 0; // Initialize lap count if not already present
  }
  raceData.laps[carId]++; // Increment lap count
  const lapTime = new Date().toLocaleTimeString(); // Get current time

  // Emit lap data to the server
  socket.emit("lapAdded", { carId, laps: raceData.laps[carId], lapTime });
}