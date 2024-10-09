// socketHandlers.js
import { updateLeaderboard, updateRaceInfo } from "./handlers.js";
import { CONFIG } from "./config.js";

export function setupSocketHandlers(socket, raceData) {
  socket.on("raceUpdate", (data) => {
    Object.assign(raceData, data);
    updateLeaderboard(raceData);
    updateRaceInfo(raceData);
  });

  socket.on("raceStarted", ({ race, duration }) => {
    Object.assign(raceData, {
      drivers: race.drivers,
      remainingTime: Math.floor(duration / 1000),
      raceMode: "Safe",
      isRaceActive: true,
    });

    if (raceData.countdownInterval) {
      clearInterval(raceData.countdownInterval);
    }

    setTimeout(() => {
      raceData.countdownInterval = setInterval(() => {
        if (raceData.isRaceActive && raceData.remainingTime > 0) {
          raceData.remainingTime--;
          updateLeaderboard(raceData);
          updateRaceInfo(raceData);
        }
      }, CONFIG.UPDATE_INTERVAL);
    }, CONFIG.COUNTDOWN_DELAY);

    updateLeaderboard(raceData);
    updateRaceInfo(raceData);
  });

  socket.on("raceFlags", (flag) => {
    raceData.raceMode = flag;
    updateRaceInfo(raceData);
    if (flag === "Finish") {
      clearInterval(raceData.countdownInterval);
      raceData.isRaceActive = false;
    }
  });

  socket.on("lapUpdate", (data) => {
    console.log("Lap update received:", data);
    const { carId, laps, rawLapTime } = data;

    const driver = raceData.drivers.find(
      (driver) => driver.carNumber === carId
    );
    if (driver) {
      driver.currentLap = laps;
      driver.lastLapTime = rawLapTime;

      if (!driver.fastestLap || rawLapTime < driver.fastestLap) {
        driver.fastestLap = rawLapTime;
      }

      updateLeaderboard(raceData);
    }
  });
}
