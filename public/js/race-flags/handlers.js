import { DOM } from "./dom.js";
import { CONFIG } from "./config.js";

let isTrafficLightSequence = false;

export function updateDisplay(state) {
  DOM.animatedFlagEl.style.display = state === "flag" ? "flex" : "none";
  DOM.trafficLightEl.style.display =
    state === "traffic-light" ? "flex" : "none";
  DOM.goMessageEl.style.display = state === "go" ? "flex" : "none";
}

export function updateAnimatedFlag(flag) {
  if (isTrafficLightSequence) return;

  updateDisplay("flag");
  const flagUnits = DOM.getFlagUnits();
  const color =
    flag === "Finish"
      ? null
      : CONFIG.FLAG_COLORS[flag] || CONFIG.FLAG_COLORS.Danger;

  flagUnits.forEach((unit, index) => {
    if (flag === "Finish") {
      const isEvenColumn = Math.floor(index / CONFIG.ROWS) % 2 === 0;
      const isEvenRow = (index % CONFIG.ROWS) % 2 === 0;
      unit.style.backgroundColor =
        isEvenColumn === isEvenRow ? "black" : "white";
    } else {
      unit.style.backgroundColor = color;
    }
  });
}

export function startTrafficLightSequence() {
  if (isTrafficLightSequence) return; // Prevent starting a new sequence if one is already in progress

  isTrafficLightSequence = true;
  updateDisplay("traffic-light");
  const lights = DOM.getLights();
  lights.forEach((light) => light.classList.remove("active"));

  let totalDelay = 0;
  CONFIG.TRAFFIC_LIGHT_SEQUENCE.forEach(
    ({ duration, light, display }, index) => {
      setTimeout(() => {
        if (light !== undefined) {
          if (index > 0) lights[index - 1].classList.remove("active");
          lights[light].classList.add("active");
        }
        if (display) updateDisplay(display);
        if (index === CONFIG.TRAFFIC_LIGHT_SEQUENCE.length - 1) {
          setTimeout(() => {
            isTrafficLightSequence = false;
            updateAnimatedFlag("Safe");
          }, duration);
        }
      }, totalDelay);
      totalDelay += duration;
    }
  );
}
