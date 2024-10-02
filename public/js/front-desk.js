const socket = io(); // Initialize Socket.IO client

// Handle login button click event
document.getElementById("loginButton").addEventListener("click", () => {
  const key = document.getElementById("accessKey").value; // Get the access key from input
  socket.emit("authenticate", key); // Emit authentication event with the access key
});

// Handle authentication response from the server
socket.on("authenticated", (data) => {
  const messageContainer = document.getElementById("loginMessage");
  if (data.success && data.role === "frontDesk") {
    messageContainer.textContent = ""; // Clear any previous messages
    document.getElementById("login").style.display = "none"; // Hide login screen
    document.getElementById("frontDeskApp").style.display = "block"; // Show front desk interface
    socket.emit("getRaceSessions"); // Request current race sessions from the server
  } else {
    messageContainer.textContent = "Invalid access key"; // Show error message
    document.getElementById("accessKey").value = ""; // Clear the input field
  }
});

// Display race sessions
let currentSessionId = null; // Variable to track session being edited

// Handle race sessions received from the server
socket.on("raceSessions", (sessions) => {
  const sessionDiv = document.getElementById("sessions");
  sessionDiv.innerHTML = ""; // Clear existing sessions

  // Iterate over each session and create HTML elements
  sessions.forEach((session, index) => {
    const sessionElement = document.createElement("div");
    sessionElement.innerHTML = `
      <strong>${session.sessionName}</strong> ${session.isNext ? "(Next)" : ""}
      <ul>
        ${session.drivers
          .map(
            (driver) => `<li>${driver.driver} (Car: ${driver.carNumber})</li>`
          )
          .join("")}
      </ul>
      <button class="editSessionButton">Edit</button>
      <button class="removeSessionButton">Remove</button>
      ${index === 0 ? '<button class="setNextButton">Set as Next</button>' : ""}
    `;
    sessionDiv.appendChild(sessionElement);

    // Handle Remove Session button click event
    sessionElement
      .querySelector(".removeSessionButton")
      .addEventListener("click", () => {
        socket.emit("removeRaceSession", session.sessionId); // Emit remove session request
      });

    // Handle Edit Session button click event
    sessionElement
      .querySelector(".editSessionButton")
      .addEventListener("click", () => {
        document.getElementById("sessionName").value = session.sessionName; // Set session name in input
        const driversList = document.getElementById("driversList");
        driversList.innerHTML = ""; // Clear the current driver list

        // Populate the form with existing drivers
        session.drivers.forEach((driver) => {
          driversList.appendChild(createDriverEntry(driver.driver)); // Use function to create driver entry
        });

        currentSessionId = session.sessionId; // Track which session is being edited
      });

    // Add Set as Next button event listener
    const setNextButton = sessionElement.querySelector(".setNextButton");
    if (setNextButton) {
      setNextButton.addEventListener("click", () => {
        socket.emit("setNextRaceSession", session.sessionId);
      });
    }
  });
});

// Function to create a driver entry
function createDriverEntry(name = "") {
  const driverEntry = document.createElement("div");
  driverEntry.classList.add("driver-entry");
  driverEntry.innerHTML = `
        <input type="text" class="driverName" value="${name}" placeholder="Driver Name" required>
        <button class="removeDriverButton">Remove</button>
    `;
  driverEntry
    .querySelector(".removeDriverButton")
    .addEventListener("click", () => {
      driverEntry.remove(); // Remove driver entry on button click
    });
  return driverEntry; // Return the created driver entry element
}

// Add another driver input field (Max 8 drivers)
document
  .getElementById("addDriverFieldButton")
  .addEventListener("click", () => {
    const driversList = document.getElementById("driversList");
    const currentDrivers = document.querySelectorAll(".driver-entry").length;

    if (currentDrivers < 8) {
      // Enforce maximum of 8 drivers
      driversList.appendChild(createDriverEntry()); // Add new driver entry
    } else {
      const maxDrivers = document.getElementById("message");
      maxDrivers.innerHTML = "max 8 drivers!"; // Show message if max drivers reached
    }
  });

// Function to send car list to the server
function sendCarListToServer(drivers) {
  const carIds = drivers.map((driver) => driver.carNumber); // Extract car numbers from drivers
  console.log("Sending car list to server:", carIds); // Debugging log
  socket.emit("sendCarList", carIds); // Emit car list to the server
}

// Add a new or update race session with drivers (Max 8 drivers and unique names)
document.getElementById("addSessionButton").addEventListener("click", () => {
  const sessionName = document.getElementById("sessionName").value; // Get session name from input

  if (!sessionName) {
    const sessionName = document.getElementById("message2");
    sessionName.innerHTML = "Please add a session name."; // Show message if session name is empty
    return;
  }

  // Collect all driver data
  const driverElements = document.querySelectorAll(".driver-entry");
  const drivers = [];
  const driverNamesSet = new Set(); // To check for unique driver names
  let hasDuplicate = false; // Flag to check for duplicates

  driverElements.forEach((driverElement, index) => {
    const driverName = driverElement.querySelector(".driverName").value.trim();
    if (driverName) {
      // Check if the driver name is already added
      if (driverNamesSet.has(driverName)) {
        const duplicateName = document.getElementById("message3");
        duplicateName.innerHTML = `The driver name "${driverName}" has already been added. Please use a unique name.`;

        hasDuplicate = true; // Set duplicate flag to true
      }
      driverNamesSet.add(driverName); // Add name to the set

      drivers.push({
        driver: driverName,
        carNumber: index + 1, // Assign car number sequentially (1 to 8)
      });
    }
  });

  // If duplicates were found, prevent the race session from being added
  if (hasDuplicate) {
    return; // Stop execution to allow the user to fix the issue
  }

  if (drivers.length === 0) {
    const minDrivers = document.getElementById("message1");
    minDrivers.innerHTML = "you need atleast 1 driver!"; // Show message if no drivers are added
    return;
  }

  // Check if we're editing an existing session or adding a new one
  if (currentSessionId) {
    // Update the session
    socket.emit("updateRaceSession", {
      sessionId: currentSessionId,
      sessionName: sessionName,
      drivers: drivers,
    });
    currentSessionId = null; // Reset the editing sessionId
  } else {
    // Add a new race session
    socket.emit("addRaceSession", {
      sessionName: sessionName,
      drivers: drivers,
    });
  }

  // Send car list to the server
  sendCarListToServer(drivers);

  // Clear inputs
  document.getElementById("sessionName").value = "";

  // Reset drivers list to only one input field
  const driversList = document.getElementById("driversList");
  driversList.innerHTML = ""; // Clear all drivers

  // Add a default driver input
  driversList.appendChild(createDriverEntry());
});

// Listen for race finished event
socket.on("raceFinished", () => {
  socket.emit("getRaceSessions"); // Refresh the race sessions list
});
