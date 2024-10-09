// handlers.js
import { DOM } from "./dom.js";
import { CONFIG } from "./config.js";

export function updateCountdownDisplay(minutes, seconds) {
  DOM.countdownElement.textContent = `${String(minutes).padStart(
    2,
    "0"
  )} : ${String(seconds).padStart(2, "0")}`;
}

export function updateSVGProgress(remainingTime, totalTime) {
  const progress = remainingTime / totalTime;
  DOM.svgCircle.style.strokeDasharray = `${progress} 1`;
  DOM.svgCircle.style.stroke = `hsl(${progress * 120}, 100%, 50%)`;
}

export function resetCountdownDisplay(fullMinutes, fullSeconds) {
  updateCountdownDisplay(fullMinutes, fullSeconds);
}

export function resetSVGProgress() {
  DOM.svgCircle.style.strokeDasharray = `1 0`;
  DOM.svgCircle.style.stroke = `hsl(120, 100%, 50%)`;
}

export function startCountdown(duration, socket) {
  let remainingTime = duration;

  return setInterval(() => {
    if (remainingTime <= 0) {
      clearInterval(countdownInterval);
      DOM.countdownElement.textContent = "End of race!";
      socket.emit("endRace");
      setTimeout(() => {
        DOM.countdownElement.textContent = CONFIG.DEFAULT_DISPLAY;
      }, CONFIG.END_RACE_MESSAGE_DURATION);
    } else {
      const minutes = Math.floor((remainingTime % (60 * 60)) / 60);
      const seconds = Math.floor(remainingTime % 60);

      updateCountdownDisplay(minutes, seconds);
      updateSVGProgress(remainingTime, duration);

      remainingTime--;
    }
  }, CONFIG.COUNTDOWN_INTERVAL);
}
