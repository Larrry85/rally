// handlers.js
import { DOM } from "./dom.js";
import { CONFIG } from "./config.js";

const ORIGINAL_CIRCLE_COLOR = "#00BFFF"; // Bright blue color
const ORIGINAL_TEXT_COLOR = "#00BFFF";

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
  DOM.countdownElement.style.color = ORIGINAL_TEXT_COLOR;
}

export function resetSVGProgress() {
  DOM.svgCircle.style.strokeDasharray = `1 0`;
  DOM.svgCircle.style.stroke = ORIGINAL_CIRCLE_COLOR;
}

export function startCountdown(duration, socket) {
  let remainingTime = duration;

  return setInterval(() => {
    if (remainingTime <= 0) {
      clearInterval(countdownInterval);
      DOM.countdownElement.textContent = "End of race!";
      DOM.countdownElement.style.color = "white"; // Set to white during "End of race!" display
      socket.emit("endRace");
    } else {
      const minutes = Math.floor((remainingTime % (60 * 60)) / 60);
      const seconds = Math.floor(remainingTime % 60);

      updateCountdownDisplay(minutes, seconds);
      updateSVGProgress(remainingTime, duration);

      remainingTime--;
    }
  }, CONFIG.COUNTDOWN_INTERVAL);
}
