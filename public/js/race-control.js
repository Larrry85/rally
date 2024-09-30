const socket = io(); // Initialize Socket.IO client

// Handle login
document.getElementById("loginButton").addEventListener("click", () => {
  const key = document.getElementById("accessKey").value; // Get the access key from input
  socket.emit("authenticate", key); // Emit authentication event with the access key
});

socket.on("authenticated", (data) => {
  const messageContainer = document.getElementById("loginMessage");
  if (data.success && data.role === "raceControl") {
    messageContainer.textContent = ""; // Clear any previous messages
    document.getElementById("login").style.display = "none"; // Hide login screen
    document.getElementById("raceControlApp").style.display = "block"; // Show race control interface
    socket.emit("getRaceSessions"); // Request current race sessions

    // Turn on the red light by default
    switchLight("red");
  } else {
    messageContainer.textContent = "Invalid access key"; // Show error message
    document.getElementById("accessKey").value = ""; // Clear the input field
  }
});

// Handle start session button click event
document.getElementById('startSessionButton').addEventListener('click', () => {
  socket.emit('startSession'); // Emit start session event
});

// Handle start session event from the server
socket.on('startSession', () => {
  document.getElementById("raceLights").style.display = "flex"; // Show race lights
  document.getElementById("buttons").style.display = "flex"; // Show control buttons
  document.getElementById("session").style.display = "flex"; // Show session information
});

// Listen for race sessions data and render it
socket.on("raceSessions", (sessions) => {
  const container = document.getElementById("raceSessionContainer");
  container.innerHTML = ""; // Clear the previous sessions

  // Filter to get only the next race session
  const nextSession = sessions.find((session) => session.isNext);

  if (nextSession) {
    const sessionElement = document.createElement("div");
    sessionElement.classList.add("race-session");

    const maxNameLength = Math.max(
      ...nextSession.drivers.map((driver) => driver.driver.length)
    );

    const formattedDrivers = nextSession.drivers
      .map((driver) => {
        const paddedName = driver.driver.padEnd(maxNameLength);
        return `<span style="display:inline-block; min-width: ${maxNameLength}ch;"><strong>${paddedName}</strong></span> (Car: ${driver.carNumber})`;
      })
      .join("<br>");

    sessionElement.innerHTML = `
          <h3>${nextSession.sessionName}</h3>
          <pre style="font-family: inherit;">${formattedDrivers}</pre>
      `;
    container.appendChild(sessionElement); // Add session element to the container
  } else {
    container.innerHTML = "<p>No upcoming race sessions.</p>"; // Show message if no upcoming sessions
  }
});

// Function to turn off all lights
function turnOffAllLights() {
  document.querySelector(".green").classList.remove("on"); // Turn off green light
  document.querySelector(".yellow").classList.remove("on"); // Turn off yellow light
  document.querySelector(".red").classList.remove("on"); // Turn off red light
  document.querySelector(".finish-image").classList.remove("on"); // Turn off finish light
}

// Function to switch on a specific light
function switchLight(light) {
  turnOffAllLights(); // Ensure all lights are off
  if (light === "green") {
    document.querySelector(".green").classList.add("on"); // Turn on green light
    socket.emit("updateFlags", "Safe"); // Emit safe flag
  } else if (light === "yellow") {
    document.querySelector(".yellow").classList.add("on"); // Turn on yellow light
    socket.emit("updateFlags", "Hazard"); // Emit hazard flag
  } else if (light === "red") {
    document.querySelector(".red").classList.add("on"); // Turn on red light
    socket.emit("updateFlags", "Danger"); // Emit danger flag
  } else if (light === "finish") {
    document.querySelector(".finish-image").classList.add("on"); // Turn on finish light
    socket.emit("updateFlags", "Finish"); // Emit finish flag
  }
}

// Button event listeners for lights
document.getElementById("green").addEventListener("click", () => {
  switchLight("green"); // Switch to green light
});

document.getElementById("yellow").addEventListener("click", () => {
  switchLight("yellow"); // Switch to yellow light
});

document.getElementById("red").addEventListener("click", () => {
  switchLight("red"); // Switch to red light
});

document.getElementById("finish").addEventListener("click", () => {
  switchLight("finish"); // Switch to finish light
});

// Emit event to start the race
document.getElementById("startRaceButton").addEventListener("click", () => {
  socket.emit("startRace"); // Emit start race event
  switchLight("green"); // Turn on green light when the race starts
});

// Notify when a race has started
socket.on("raceStarted", () => {
  const startMessage = document.getElementById("message");
  startMessage.innerHTML = "Race is starting!"; // Show race starting message
  setTimeout(() => {
    startMessage.innerHTML = ""; // Clear message after 10 seconds
  }, 10000);
});

// Handle flag clicks
document.querySelectorAll(".flag").forEach((flagButton) => {
  flagButton.addEventListener("click", () => {
    const flag = flagButton.getAttribute("data-flag"); // Get flag type from data attribute
    socket.emit("updateFlags", flag); // Emit update flag event
  });
});

// Request race sessions
socket.emit("getRaceSessions"); // Emit event to request race sessions