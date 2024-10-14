// lap-line-tracker/handlers.js
import { DOM } from "./dom.js";
import { CONFIG } from "./config.js";
import { raceData, addLap } from "./utils.js";

export function handleLogin(socket) {
  if (CONFIG.SKIP_LOGIN) {
    socket.emit("authenticate", CONFIG.DEFAULT_AUTH_KEY);
  } else {
    DOM.loginButton.addEventListener("click", () => {
      const key = DOM.accessKeyInput.value;
      socket.emit("authenticate", key);
    });
  }
}

export function handleRaceStarted(currentSession, socket) {
  DOM.lapLinerApp.innerHTML = "";

  const header = document.createElement("h2");
  header.textContent = "Lap Tracker";
  DOM.lapLinerApp.appendChild(header);

  if (
    currentSession &&
    currentSession.race &&
    Array.isArray(currentSession.race.drivers) &&
    currentSession.race.drivers.length > 0
  ) {
    raceData.carIds = currentSession.race.drivers.map(
      (driver) => driver.carNumber
    );

    raceData.carIds.forEach((carId, index) => {
      const button = document.createElement("button");
      button.textContent = `${carId}`;
      button.disabled = false;
      button.addEventListener("click", () => addLap(carId, socket));

      const row = 8 - index;
      const col = index + 1;
      button.style.gridRow = `${row}`;
      button.style.gridColumn = `${col}`;

      DOM.lapLinerApp.appendChild(button);
    });
    raceData.laps = {};
    console.log("Race started with car list:", raceData.carIds);
  } else {
    // If there's no valid session or no drivers, just leave the area empty except for the header
    console.log("No active race session or empty drivers list");
    raceData.carIds = [];
    raceData.laps = {};
  }
}

export function handleRaceFinished() {
  DOM.lapLinerApp.innerHTML = "";

  const header = document.createElement("h2");
  header.textContent = "Lap Tracker";
  DOM.lapLinerApp.appendChild(header);
}
