// socketHandlers.js
import { updateLeaderboard, updateRaceInfo } from "./handlers.js";
import { CONFIG } from "./config.js";

export function setupSocketHandlers(socket, raceData) {
  console.log("Setting up socket handlers with initial raceData:", raceData);

  socket.on("raceStarted", (data) => {
    console.log("Race started event received:", data);

    if (data.race) {
      // Handle the second emission
      Object.assign(raceData, {
        drivers: data.race.drivers || [],
        remainingTime: Math.floor(data.duration / 1000),
        raceMode: "Safe",
        isRaceActive: true,
        startTime: data.startTime,
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
    } else if (data.drivers) {
      // Handle the first emission
      Object.assign(raceData, {
        drivers: data.drivers,
        sessionId: data.sessionId,
        sessionName: data.sessionName,
        isNext: data.isNext,
        isCurrent: data.isCurrent,
        isRaceActive: data.isCurrent,
      });
    } else {
      console.error("Invalid race data received:", data);
      // Initialize with empty drivers array if we don't receive valid data
      raceData.drivers = [];
    }

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
    const { carId, laps, lapTime } = data;

    // If drivers array is empty, initialize it
    if (!Array.isArray(raceData.drivers) || raceData.drivers.length === 0) {
      raceData.drivers = [];
    }

    let driver = raceData.drivers.find((d) => d.carNumber === carId);
    if (!driver) {
      // If driver doesn't exist, create a new one
      driver = {
        carNumber: carId,
        driver: `Driver ${carId}`,
        currentLap: 0,
        lastLapTime: null,
        fastestLap: null,
      };
      raceData.drivers.push(driver);
    }

    driver.currentLap = laps;
    driver.lastLapTime = lapTime;

    if (!driver.fastestLap || lapTime < driver.fastestLap) {
      driver.fastestLap = lapTime;
    }

    updateLeaderboard(raceData);
  });
}
