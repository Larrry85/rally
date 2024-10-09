// socketHandlers.js
import { DOM } from "./dom.js";
import { CONFIG } from "./config.js";
import {
  resetCountdownDisplay,
  resetSVGProgress,
  startCountdown,
} from "./handlers.js";

export function setupSocketHandlers(socket) {
  let countdownInterval;

  socket.on("startSession", ({ fullMinutes, fullSeconds }) => {
    resetCountdownDisplay(fullMinutes, fullSeconds);
    resetSVGProgress();
  });

  socket.on("startRace", ({ duration }) => {
    DOM.countdownElement.textContent = "Race is starting.";

    setTimeout(() => {
      countdownInterval = startCountdown(duration / 1000, socket);
    }, CONFIG.RACE_START_DELAY);
  });

  socket.on("raceFinished", () => {
    clearInterval(countdownInterval);
    DOM.countdownElement.textContent = "End of race!";
    setTimeout(() => {
      DOM.countdownElement.textContent = CONFIG.DEFAULT_DISPLAY;
    }, CONFIG.END_RACE_MESSAGE_DURATION);
  });
}
