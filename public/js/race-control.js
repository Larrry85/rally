const socket = io();

// Handle login
document.getElementById("loginButton").addEventListener("click", () => {
  const key = document.getElementById("accessKey").value;
  socket.emit("authenticate", key); // Emit authentication event
});

socket.on("authenticated", (data) => {
  const messageContainer = document.getElementById("loginMessage");
  if (data.success && data.role === "raceControl") {
    messageContainer.textContent = "";
    document.getElementById("login").style.display = "none";
    document.getElementById("raceControlApp").style.display = "block";
    document.getElementById("raceLights").style.display = "flex";
    document.getElementById("buttons").style.display = "flex";
    socket.emit("getRaceSessions"); // Request current race sessions

    // Turn on the red light by default
    switchLight("red");
  } else {
    messageContainer.textContent = "Invalid access key";
    document.getElementById("accessKey").value = ""; // Clear the input field
  }
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
    container.appendChild(sessionElement);
  } else {
    container.innerHTML = "<p>No upcoming race sessions.</p>";
  }
});

// Function to turn off all lights
function turnOffAllLights() {
  document.querySelector(".green").classList.remove("on");
  document.querySelector(".yellow").classList.remove("on");
  document.querySelector(".red").classList.remove("on");
  document.querySelector(".finish-image").classList.remove("on");
}

// Function to switch on a specific light
function switchLight(light) {
  turnOffAllLights(); // Ensure all lights are off
  if (light === "green") {
    document.querySelector(".green").classList.add("on");
    socket.emit("updateFlags", "Safe");
  } else if (light === "yellow") {
    document.querySelector(".yellow").classList.add("on");
    socket.emit("updateFlags", "Hazard");
  } else if (light === "red") {
    document.querySelector(".red").classList.add("on");
    socket.emit("updateFlags", "Danger");
  } else if (light === "finish") {
    document.querySelector(".finish-image").classList.add("on");
    socket.emit("updateFlags", "Finish");
  }
}

// Button event listeners
document.getElementById("green").addEventListener("click", () => {
  switchLight("green");
});

document.getElementById("yellow").addEventListener("click", () => {
  switchLight("yellow");
});

document.getElementById("red").addEventListener("click", () => {
  switchLight("red");
});

document.getElementById("finish").addEventListener("click", () => {
  switchLight("finish");
});

// Emit event to start the race
document.getElementById("startRaceButton").addEventListener("click", () => {
  socket.emit("startRace");
  switchLight("green"); // Turn on green light when the race starts
});

// Notify when a race has started
socket.on("raceStarted", () => {
  const startMessage = document.getElementById("message");
  startMessage.innerHTML = "Race is starting!";
});

// Handle flag clicks
document.querySelectorAll(".flag").forEach((flagButton) => {
  flagButton.addEventListener("click", () => {
    const flag = flagButton.getAttribute("data-flag");
    socket.emit("updateFlags", flag);
  });
});

// Request race sessions
socket.emit("getRaceSessions");
