// handlers.js
import { DOM } from "./dom.js";
import { RACE_MODE_COLORS } from "./config.js";
import { formatTime, sortDrivers } from "./utils.js";

export function updateLeaderboard(raceData) {
  if (!DOM.leaderboardBody) {
    console.error("Leaderboard body element not found");
    return;
  }

  if (!Array.isArray(raceData.drivers) || raceData.drivers.length === 0) {
    DOM.leaderboardBody.innerHTML =
      '<tr><td colspan="6">Waiting for race data...</td></tr>';
    return;
  }

  DOM.leaderboardBody.innerHTML = "";

  const sortedDrivers = sortDrivers(raceData.drivers);

  sortedDrivers.forEach((driver, index) => {
    const row = `
      <tr>
        <td>${index + 1}</td>
        <td>${driver.carNumber}</td>
        <td>${driver.driver}</td>
        <td>${driver.fastestLap ? formatTime(driver.fastestLap) : "N/A"}</td>
        <td>${driver.lastLapTime ? formatTime(driver.lastLapTime) : "N/A"}</td>
        <td>${driver.currentLap || 0}</td>
      </tr>
    `;
    DOM.leaderboardBody.innerHTML += row;
  });
}

export function updateRaceInfo(raceData) {
  if (!DOM.remainingTimeElement || !DOM.raceModeElement) {
    console.error("Race info elements not found");
    return;
  }

  const minutes = Math.floor(raceData.remainingTime / 60);
  const seconds = raceData.remainingTime % 60;
  DOM.remainingTimeElement.textContent = `Time: ${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;

  DOM.raceModeElement.textContent = `Race Mode: ${raceData.raceMode}`;
  DOM.raceModeElement.style.backgroundColor =
    RACE_MODE_COLORS[raceData.raceMode] || RACE_MODE_COLORS.Danger;
}
