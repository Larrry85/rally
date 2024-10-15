// race-countdown/handlers.js
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
