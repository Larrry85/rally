const socket = io(); // Initialize Socket.IO client

document.addEventListener("DOMContentLoaded", () => {
  const skipLogin = window.SKIP_LOGIN === "true";

  if (skipLogin) {
    socket.emit("authenticate", "0001"); // Automatically authenticate with default key
  } else {
    // Handle login button click event for manual login
    document.getElementById("loginButton").addEventListener("click", () => {
      const key = document.getElementById("accessKey").value;
      socket.emit("authenticate", key);
    });
  }
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

// Function to reset the panel
function resetPanel(hasSession) {
  document.getElementById("startSessionButton").style.display = hasSession
    ? "block"
    : "none";
  document.getElementById("session").style.display = "none";
  document.getElementById("raceLights").style.display = "none";
  document.getElementById("buttons").style.display = "none";

  if (!hasSession) {
    document.getElementById("raceSessionContainer").innerHTML =
      "<p>No upcoming race sessions.</p>";
  }
}

// Handle start session button click event
document.getElementById("startSessionButton").addEventListener("click", () => {
  socket.emit("startSession"); // Emit start session event
});

// Handle start session event from the server
socket.on("startSession", () => {
  document.getElementById("startSessionButton").style.display = "none";
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
    resetPanel(true);
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
    resetPanel(false);
    // container.innerHTML = "<p>No upcoming race sessions.</p>"; // Show message if no upcoming sessions
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
  socket.emit("finishRace"); // Emit finish race event
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
  updateRaceSessionDisplay(currentSession); // Update race session display
});

socket.on("raceFinished", () => {
  const finishMessage = document.getElementById("message");
  finishMessage.innerHTML = "Race finished! Transitioning to next session...";
  setTimeout(() => {
    finishMessage.innerHTML = "";
    socket.emit("getNextRaceSession"); // Request the next race session
  }, 5000); // Wait 5 seconds before transitioning
});

// Listen for next race session data
socket.on("nextRaceSession", (session) => {
  if (session) {
    updateRaceSessionDisplay(session);
    resetPanel(true);
    // document.getElementById("startSessionButton").style.display = "flex";
    // document.getElementById("raceLights").style.display = "flex";
    // document.getElementById("buttons").style.display = "flex";
    // document.getElementById("session").style.display = "flex";
  } else {
    resetPanel(false);
    const noSessionMessage = document.getElementById("message");
    noSessionMessage.innerHTML = "No more race sessions available.";
  }
});

// Function to update race session display
function updateRaceSessionDisplay(session) {
  const container = document.getElementById("raceSessionContainer");
  container.innerHTML = "";

  const sessionElement = document.createElement("div");
  sessionElement.classList.add("race-session");

  const maxNameLength = Math.max(
    ...session.drivers.map((driver) => driver.driver.length)
  );

  const formattedDrivers = session.drivers
    .map((driver) => {
      const paddedName = driver.driver.padEnd(maxNameLength);
      return `<span style="display:inline-block; min-width: ${maxNameLength}ch;"><strong>${paddedName}</strong></span> (Car: ${driver.carNumber})`;
    })
    .join("<br>");

  sessionElement.innerHTML = `
    <h3>${session.sessionName}</h3>
    <pre style="font-family: inherit;">${formattedDrivers}</pre>
  `;
  container.appendChild(sessionElement);
}

// Handle flag clicks
document.querySelectorAll(".flag").forEach((flagButton) => {
  flagButton.addEventListener("click", () => {
    const flag = flagButton.getAttribute("data-flag"); // Get flag type from data attribute
    socket.emit("updateFlags", flag); // Emit update flag event
  });
});

// Request race sessions
socket.emit("getRaceSessions"); // Emit event to request race sessions
