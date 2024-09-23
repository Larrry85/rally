const socket = io();

// Handle login
document.getElementById("loginButton").addEventListener("click", () => {
  const key = document.getElementById("accessKey").value;
  socket.emit("authenticate", key); // Emit authentication event
});

socket.on("authenticated", (data) => {
  const messageContainer = document.getElementById("loginMessage");
  if (data.success) {
    messageContainer.textContent = "";
    document.getElementById("login").style.display = "none";
    document.getElementById("raceControlApp").style.display = "block";
    document.getElementById("raceLights").style.display = "flex";
    document.getElementById("buttons").style.display = "flex";
    socket.emit("getRaceSessions"); // Request current race sessions
  } else {
    messageContainer.textContent = "Invalid access key";
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

document.getElementById('green').addEventListener('click', () => {
  const greenLight = document.querySelector('.green');
  greenLight.classList.toggle('on');  // Toggle the 'on' class on click
  
});

document.getElementById('yellow').addEventListener('click', () => {
  const yellowLight = document.querySelector('.yellow');
  yellowLight.classList.toggle('on');  // Toggle the 'on' class on click
  
});

document.getElementById('red').addEventListener('click', () => {
  const redLight = document.querySelector('.red');
  redLight.classList.toggle('on');  // Toggle the 'on' class on click
  
});

document.getElementById('finish').addEventListener('click', () => {
  const finishImage = document.querySelector('.finish-image');
  finishImage.classList.toggle('on');  // Toggle the 'on' class on click
});


// Emit event to start the race
document.getElementById("startRaceButton").addEventListener("click", () => {
  socket.emit("startRace");
});

// Notify when a race has started
socket.on("raceStarted", () => {
  alert("Race started");
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
