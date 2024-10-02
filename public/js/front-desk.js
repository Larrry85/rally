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
  sessions.forEach((session) => {
    const sessionElement = document.createElement("div");
    sessionElement.innerHTML = `
            <strong>${session.sessionName}</strong>
            <ul>
                ${session.drivers
        .map(
          (driver) =>
            `<li>${driver.driver} (Car: ${driver.carNumber})</li>`
        )
        .join("")}
            </ul>
            <button class="editSessionButton">Edit</button>
            <button class="removeSessionButton">Remove</button>
        `;
    sessionDiv.appendChild(sessionElement); // Add session element to the DOM

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
  });
});

// Handle authentication response from the server
socket.on("authenticated", (data) => {
  const messageContainer = document.getElementById("loginMessage");
  if (data.success && data.role === "frontDesk") {
    messageContainer.textContent = ""; // Clear any previous messages
    document.getElementById("login").style.display = "none"; // Hide login screen
    document.getElementById("frontDeskApp").style.display = "block"; // Show front desk interface
    socket.emit("getRaceSessions"); // Request current race sessions from the server

    // Initialize the drivers list with a default driver entry
    const driversList = document.getElementById("driversList");
    driversList.innerHTML = ""; // Clear the list in case it contains old data
    driversList.appendChild(createDriverEntry()); // Add the first driver entry
  } else {
    messageContainer.textContent = "Invalid access key"; // Show error message
    document.getElementById("accessKey").value = ""; // Clear the input field
  }
});

// Function to create a driver entry with a car number dropdown
function createDriverEntry(name = "", selectedCarNumber = null) {
  const driverEntry = document.createElement("div");
  driverEntry.classList.add("driver-entry");

  // Create the car number dropdown
  const carNumberOptions = [1, 2, 3, 4, 5, 6, 7, 8]; // Available car numbers
  const carNumberDropdown = document.createElement("select");
  carNumberDropdown.classList.add("carNumberDropdown");

  // Add a default "Select Car Number" option
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Select Car Number";
  defaultOption.disabled = true;
  defaultOption.selected = !selectedCarNumber; // Select default if no car number is pre-selected
  carNumberDropdown.appendChild(defaultOption);

  // Add car number options
  carNumberOptions.forEach(num => {
    const option = document.createElement("option");
    option.value = num;
    option.textContent = `Car ${num}`;
    if (num === selectedCarNumber) {
      option.selected = true; // Pre-select if a car number is passed
    }
    carNumberDropdown.appendChild(option);
  });

  // Set up the driver input and car number dropdown
  driverEntry.innerHTML = `
    <input type="text" class="driverName" value="${name}" placeholder="Driver Name" required>
  `;
  driverEntry.appendChild(carNumberDropdown);

  const removeButton = document.createElement("button");
  removeButton.classList.add("removeDriverButton");
  removeButton.textContent = "Remove";
  removeButton.addEventListener("click", () => {
    driverEntry.remove(); // Remove driver entry on button click
  });
  driverEntry.appendChild(removeButton);

  return driverEntry; // Return the created driver entry element
}

// Add another driver input field (Max 8 drivers)
document.getElementById("addDriverFieldButton").addEventListener("click", () => {
  const driversList = document.getElementById("driversList");
  const currentDrivers = document.querySelectorAll(".driver-entry").length;

  if (currentDrivers < 8) {
    // Enforce maximum of 8 drivers
    driversList.appendChild(createDriverEntry()); // Add new driver entry
  } else {
    const maxDrivers = document.getElementById("message");
    maxDrivers.innerHTML = "max 8 drivers!"; // Show message if max drivers reached
    setTimeout(() => {
      maxDrivers.innerHTML = ""; // Clear message after 10 seconds
    }, 5000);
  }
});

// Add a new or update race session with drivers (Max 8 drivers and unique names and car numbers)
document.getElementById("addSessionButton").addEventListener("click", () => {
  const sessionName = document.getElementById("sessionName").value; // Get session name from input

  if (!sessionName) {
    const sessionName = document.getElementById("message2");
    sessionName.innerHTML = "Please add a session name."; // Show message if session name is empty
    setTimeout(() => {
      sessionName.innerHTML = ""; // Clear message after 5 seconds
    }, 5000);
    return;
  }

  // Collect all driver data
  const driverElements = document.querySelectorAll(".driver-entry");
  const drivers = [];
  const driverNamesSet = new Set(); // To check for unique driver names
  const carNumbersSet = new Set(); // To check for unique car numbers
  let hasDuplicateName = false; // Flag to check for duplicate names
  let hasDuplicateCarNumber = false; // Flag to check for duplicate car numbers
  let hasIncompleteData = false; // Flag to check for incomplete driver data

  driverElements.forEach((driverElement) => {
    const driverName = driverElement.querySelector(".driverName").value.trim();
    const carNumber = driverElement.querySelector(".carNumberDropdown").value;

    if (!driverName || !carNumber) {
      const minDrivers = document.getElementById("message1");
      minDrivers.innerHTML = "Each driver must have a name and car number."; // Show message if fields are incomplete
      hasIncompleteData = true; // Set the flag for incomplete data
      setTimeout(() => {
        minDrivers.innerHTML = ""; // Clear message after 5 seconds
      }, 5000);
      return;
    }


    // Check for duplicate driver names
    if (driverNamesSet.has(driverName)) {
      const duplicateNameMessage = document.getElementById('message3');
      duplicateNameMessage.innerHTML = `The driver name "${driverName}" has already been added. Please use a unique name.`;
      hasDuplicateName = true;
      setTimeout(() => {
        duplicateNameMessage.innerHTML = ""; // Clear message after 5 seconds
      }, 5000);
      return;
    }
    driverNamesSet.add(driverName);

    // Check for duplicate car numbers
    if (carNumbersSet.has(carNumber)) {
      const duplicateCarNumberMessage = document.getElementById('message4');
      duplicateCarNumberMessage.innerHTML = `The car number "${carNumber}" has already been selected. Please choose a different car number.`;
      hasDuplicateCarNumber = true;
      setTimeout(() => {
        duplicateCarNumberMessage.innerHTML = ""; // Clear message after 5 seconds
      }, 5000);
      return;
    }
    carNumbersSet.add(carNumber);

    // Add the driver and their selected car number
    drivers.push({
      driver: driverName,
      carNumber: carNumber,
    });
  });

    // If there is incomplete data or duplicates, prevent the race session from being added  <-- Added section
    if (hasIncompleteData || hasDuplicateName || hasDuplicateCarNumber) {
      return; // Exit without adding the session
    }

  // If duplicates were found, prevent the race session from being added
  if (hasDuplicateName || hasDuplicateCarNumber) {
    return;
  }

  if (drivers.length === 0) {
    const minDrivers = document.getElementById("message1");
    minDrivers.innerHTML = "you need at least 1 driver!"; // Show message if no drivers are added
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

// Function to send car list to the server
function sendCarListToServer(drivers) {
  const carIds = drivers.map(driver => driver.carNumber); // Extract car numbers from drivers
  console.log("Sending car list to server:", carIds); // Debugging log
  socket.emit("sendCarList", carIds); // Emit car list to the server
}

// Initialize with one driver entry when the page loads
window.addEventListener("DOMContentLoaded", () => {
  const driversList = document.getElementById("driversList");
  driversList.appendChild(createDriverEntry()); // Add a default driver input when the page loads
});
