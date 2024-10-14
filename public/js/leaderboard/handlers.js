// leaderboard/handlers.js
import { DOM } from "./dom.js";
import { RACE_MODE_COLORS } from "./config.js";
import { formatTime, sortDrivers } from "./utils.js";

export function updateLeaderboard(raceData) {
  if (!DOM.leaderboardBody) return;

  DOM.leaderboardBody.innerHTML =
    Array.isArray(raceData.drivers) && raceData.drivers.length
      ? sortDrivers(raceData.drivers)
          .map(
            (driver, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${driver.carNumber}</td>
        <td>${driver.driver}</td>
        <td>${driver.fastestLap ? formatTime(driver.fastestLap) : "N/A"}</td>
        <td>${formatTime(driver.currentLapTime || 0)}</td>
        <td>${driver.currentLap || 0}</td>
      </tr>
    `
          )
          .join("")
      : '<tr><td colspan="6">Waiting for race data...</td></tr>';
}

export function updateRaceInfo(raceData) {
  if (!DOM.remainingTimeElement || !DOM.raceModeElement) return;

  DOM.remainingTimeElement.textContent = `Time: ${Math.floor(
    raceData.remainingTime / 60
  )}:${(raceData.remainingTime % 60).toString().padStart(2, "0")}`;
  DOM.raceModeElement.textContent = `Race Mode: ${raceData.raceMode}`;
  DOM.raceModeElement.style.backgroundColor =
    RACE_MODE_COLORS[raceData.raceMode] || RACE_MODE_COLORS.Danger;
}

export function updateLapTimes(raceData) {
  const currentTime = Date.now();
  raceData.drivers.forEach((driver) => {
    if (driver.lapStartTime) {
      driver.currentLapTime = currentTime - driver.lapStartTime;
    }
  });
}
