const socket = io(); // Initialize Socket.IO client

let raceData = {
  drivers: [], // Array to store driver information
  laps: {}, // Object to store lap counts for each car
  carIds: [] // Array to store car IDs temporarily
};

document.addEventListener("DOMContentLoaded", () => {
  const skipLogin = window.SKIP_LOGIN === "true"; // Check if login should be skipped

  if (skipLogin) {
    socket.emit("authenticate", "0002"); // Automatically authenticate with default key
  } else {
    // Handle login button click event for manual login
    document.getElementById("loginButton").addEventListener("click", () => {
      const key = document.getElementById("accessKey").value; // Get the access key from input
      socket.emit("authenticate", key); // Emit authentication event with the key
    });
  }
});

// Handle authentication response from the server
socket.on("authenticated", (data) => {
  const messageContainer = document.getElementById("loginMessage"); // Get the login message container
  if (data.success && data.role === "lapLineTracker") {
    messageContainer.textContent = ""; // Clear any previous messages
    document.getElementById("login").style.display = "none"; // Hide login screen
    document.getElementById("lapLinerApp").style.display = "block"; // Show lap tracker interface
    socket.emit("getCurrentRaceSession"); // Request current race session from the server
  } else {
    messageContainer.textContent = "Invalid access key"; // Show error message
    document.getElementById("accessKey").value = ""; // Clear the input field
  }
});

// Listen for start session event from the server
socket.on("startSession", () => {
  socket.emit("getCurrentRaceSession"); // Request current race session
});

// Listen for car IDs received from the server
socket.on("carIds", (carIds) => {
  console.log("Received car list:", carIds); // Debugging log
  raceData.carIds = carIds; // Store car IDs temporarily
});

// Enable buttons and display car IDs when the race starts
socket.on("raceStarted", (currentSession) => {
  if (currentSession) {
    raceData.carIds = currentSession.drivers.map(driver => driver.carNumber); // Update car IDs for the current session
    const lapLinerApp = document.getElementById("lapLinerApp"); // Get the lap tracker interface element
    lapLinerApp.innerHTML = ""; // Clear existing buttons

    const header = document.createElement("h2"); // Create a header element
    header.textContent = "Lap Tracker"; // Set header text
    lapLinerApp.appendChild(header); // Add header to the lap tracker interface

    // Create buttons for each car ID and place them in the grid
    raceData.carIds.forEach((carId, index) => {
      const button = document.createElement("button"); // Create a button element
      button.textContent = `${carId}`; // Set button text to car ID
      button.disabled = false; // Enable the buttons
      button.addEventListener("click", () => {
        addLap(carId); // Add lap when button is clicked
      });

      // Calculate grid position for diagonal placement
      const row = 8 - index; // Adjust for bottom-to-top placement
      const col = index + 1; // Left-to-right placement
      button.style.gridRow = `${row}`; // Set grid row
      button.style.gridColumn = `${col}`; // Set grid column

      lapLinerApp.appendChild(button); // Add button to the lap tracker interface
    });
    raceData.laps = {}; // Reset laps after the race finishes
  }
});

// Remove buttons when the race finishes
socket.on("raceFinished", () => {
  const lapLinerApp = document.getElementById("lapLinerApp"); // Get the lap tracker interface element
  lapLinerApp.innerHTML = ""; // Clear all buttons

  const header = document.createElement("h2"); // Create a header element
  header.textContent = "Lap Tracker"; // Set header text
  lapLinerApp.appendChild(header); // Add header to the lap tracker interface
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

// Listen for current race session and update the interface
socket.on("currentRaceSession", (currentSession) => {
  if (currentSession) {
    raceData.carIds = currentSession.drivers.map(driver => driver.carNumber); // Update car IDs for the current session
    // Update the interface with the current session data
    const lapLinerApp = document.getElementById("lapLinerApp");
    lapLinerApp.innerHTML = ""; // Clear existing buttons

    const header = document.createElement("h2");
    header.textContent = "Lap Tracker";
    lapLinerApp.appendChild(header);

    currentSession.carIds.forEach((carId, index) => {
      const button = document.createElement("button");
      button.textContent = `${carId}`;
      button.disabled = false;
      button.addEventListener("click", () => {
        addLap(carId);
      });

      const row = 8 - index;
      const col = index + 1;
      button.style.gridRow = `${row}`;
      button.style.gridColumn = `${col}`;

      lapLinerApp.appendChild(button);
    });
  }
});