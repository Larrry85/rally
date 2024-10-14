// race-countdown/main.js
import { DOM } from "./dom.js";
import { CONFIG } from "./config.js";
import {
  resetCountdownDisplay,
  resetSVGProgress,
  updateCountdownDisplay,
  updateSVGProgress,
} from "./handlers.js";

const socket = io();

let raceDuration = CONFIG.DEFAULT_RACE_DURATION;

function setupSocketHandlers() {
  socket.on("startSession", ({ fullMinutes, fullSeconds }) => {
    raceDuration = (fullMinutes * 60 + fullSeconds) * 1000;
    resetCountdownDisplay(fullMinutes, fullSeconds);
    resetSVGProgress();
  });

  socket.on("raceStarted", ({ duration }) => {
    raceDuration = duration;
    DOM.countdownElement.textContent = "Race is starting...";
    setTimeout(() => {
      socket.emit("startRaceTimer");
    }, CONFIG.RACE_START_DELAY);
  });

  socket.on("raceTimerUpdate", (remainingTime) => {
    const minutes = Math.floor(remainingTime / 60000);
    const seconds = Math.floor((remainingTime % 60000) / 1000);

    updateCountdownDisplay(minutes, seconds);
    updateSVGProgress(remainingTime, raceDuration);
  });

  socket.on("raceFinished", () => {
    DOM.countdownElement.textContent = "End of race!";
    DOM.countdownElement.style.color = "white";
    setTimeout(() => {
      const fullMinutes = Math.floor(raceDuration / 60000);
      const fullSeconds = Math.floor((raceDuration % 60000) / 1000);
      resetCountdownDisplay(fullMinutes, fullSeconds);
      resetSVGProgress();
    }, CONFIG.END_RACE_MESSAGE_DURATION);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupSocketHandlers();
});
