// lap-line-tracker/handlers.js
import { DOM } from "./dom.js";
import { CONFIG } from "./config.js";
import { raceData, addLap } from "./utils.js";

export function handleLogin(socket) {
  if (CONFIG.SKIP_LOGIN) {
    socket.emit("authenticate", CONFIG.DEFAULT_AUTH_KEY);
  } else {
    DOM.loginButton.addEventListener("click", () => {
      socket.emit("authenticate", DOM.accessKeyInput.value);
    });
  }
}

export function handleRaceStarted(currentSession, socket) {
  DOM.lapLinerApp.innerHTML = "<h2>Lap Tracker</h2>";

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
      DOM.lapLinerApp.appendChild(button);
    });
    raceData.laps = {};
    console.log("Race started with car list:", raceData.carIds);
  } else {
    console.log("No active race session or empty drivers list");
    raceData.carIds = [];
    raceData.laps = {};
  }
}

export function handleRaceFinished() {
  DOM.lapLinerApp.innerHTML = "<h2>Lap Tracker</h2>";
}
