// leaderboard/socketHandlers.js
import {
  updateLapTimes,
  updateLeaderboard,
  updateRaceInfo,
} from "./handlers.js";
import { CONFIG } from "./config.js";

export function setupSocketHandlers(socket, raceData) {
  let resetModeTimeout;

  function finishRace() {
    raceData.isRaceActive = false;
    raceData.raceMode = "Finish";
    updateRaceInfo(raceData);

    resetModeTimeout = setTimeout(() => {
      raceData.raceMode = CONFIG.INITIAL_RACE_MODE;
      updateRaceInfo(raceData);
    }, 3000);
  }

  socket.on("raceStarted", (data) => {
    if (data.race) {
      Object.assign(raceData, {
        drivers: data.race.drivers || [],
        remainingTime: Math.floor(data.duration / 1000),
        raceMode: "Safe",
        isRaceActive: true,
        startTime: data.startTime,
      });

      const raceStartTime = Date.now();
      raceData.drivers.forEach((driver) => {
        driver.lapStartTime = raceStartTime;
        driver.currentLapTime = 0;
        driver.fastestLap = null;
      });
    } else if (data.drivers) {
      Object.assign(raceData, {
        drivers: data.drivers.map((driver) => ({
          ...driver,
          fastestLap: null,
        })),
        sessionId: data.sessionId,
        sessionName: data.sessionName,
        isNext: data.isNext,
        isCurrent: data.isCurrent,
        isRaceActive: data.isCurrent,
        raceMode: CONFIG.INITIAL_RACE_MODE,
      });
    } else {
      raceData.drivers = [];
    }

    updateLapTimes(raceData);
    updateLeaderboard(raceData);
    updateRaceInfo(raceData);
  });

  socket.on("raceTimerUpdate", (remainingTime) => {
    raceData.remainingTime = Math.floor(remainingTime / 1000);
    updateLapTimes(raceData);
    updateLeaderboard(raceData);
    updateRaceInfo(raceData);

    if (raceData.remainingTime === 0) finishRace();
  });

  socket.on("raceFlags", (flag) => {
    if (resetModeTimeout) clearTimeout(resetModeTimeout);
    raceData.raceMode = flag;
    updateRaceInfo(raceData);
    if (flag === "Finish") finishRace();
  });

  socket.on("lapUpdate", (data) => {
    const { carId, laps } = data;

    if (!Array.isArray(raceData.drivers)) raceData.drivers = [];

    let driver = raceData.drivers.find((d) => d.carNumber === carId);
    if (!driver) {
      driver = {
        carNumber: carId,
        driver: `Driver ${carId}`,
        currentLap: 0,
        fastestLap: null,
        lapStartTime: Date.now(),
        currentLapTime: 0,
      };
      raceData.drivers.push(driver);
    }

    driver.currentLap = laps;

    if (laps > 0) {
      const completedLapTime = driver.currentLapTime;
      if (driver.fastestLap === null || completedLapTime < driver.fastestLap) {
        driver.fastestLap = completedLapTime;
      }
      driver.currentLapTime = 0;
      driver.lapStartTime = Date.now();
    }

    updateLeaderboard(raceData);
  });
}
