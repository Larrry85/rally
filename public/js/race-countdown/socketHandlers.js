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
  let originalFullMinutes = 10;
  let originalFullSeconds = 0;

  socket.on("startSession", ({ fullMinutes, fullSeconds }) => {
    originalFullMinutes = fullMinutes;
    originalFullSeconds = fullSeconds;
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
    DOM.countdownElement.style.color = "white";
    setTimeout(() => {
      resetCountdownDisplay(originalFullMinutes, originalFullSeconds);
      resetSVGProgress();
    }, CONFIG.END_RACE_MESSAGE_DURATION);
  });
}
