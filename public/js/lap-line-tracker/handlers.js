// lap-line-tracker/handlers.js
import { DOM } from "./dom.js";
import { CONFIG } from "./config.js";
import { raceData, addLap } from "./utils.js";

export function handleLogin(socket) {
  if (CONFIG.SKIP_LOGIN) {
    // if true, send authentication request with default key
    socket.emit("authenticate", CONFIG.DEFAULT_AUTH_KEY);
  } else {
    // otherwise user must click login button or press Enter
    const attemptLogin = () => {
      const accessKey = DOM.accessKeyInput.value;
      console.log("Login attempted, access key:", accessKey);
      socket.emit("authenticate", accessKey);
    };

    DOM.loginButton.addEventListener("click", attemptLogin);

    DOM.accessKeyInput.addEventListener("keyup", (event) => {
      if (event.key === "Enter") {
        attemptLogin();
      }
    });
  }
}

export function handleRaceStarted(currentSession, socket) {
  DOM.lapLinerMessage.style.display = "none"; // Hide waiting message
  DOM.lapLinerButtons.style.display = "block"; // Ensure buttons container is displayed

  if (currentSession?.race?.drivers?.length > 0) {
    raceData.carIds = currentSession.race.drivers.map(
      (driver) => driver.carNumber
    );
    raceData.carIds.forEach((carId, index) => {
      const button = document.createElement("button");
      button.textContent = carId;
      button.addEventListener("click", () => addLap(carId, socket));
      button.style.gridRow = `${8 - index}`;
      button.style.gridColumn = `${index + 1}`;
      DOM.lapLinerButtons.appendChild(button);
    });
    raceData.laps = {};
    console.log("Race started with car list:", raceData.carIds); // shows when start race
  } else {
    console.log("Waiting for driver data"); // shows if you log in too late
    raceData.carIds = [];
    raceData.laps = {};
  }
}

export function handleRaceFinished() {
  DOM.lapLinerButtons.innerHTML = ""; // Clear the buttons container
  DOM.lapLinerButtons.style.display = "none";
  DOM.lapLinerMessage.style.display = "block"; // Show waiting message
}
