// handlers.js
import { DOM } from "./dom.js";
import { CONFIG } from "./config.js";

let isTrafficLightSequence = false;

export function updateDisplay(state) {
  console.log("Updating display to:", state);
  DOM.animatedFlagEl.style.display = "none";
  DOM.trafficLightEl.style.display = "none";
  DOM.goMessageEl.style.display = "none";

  switch (state) {
    case "flag":
      DOM.animatedFlagEl.style.display = "flex";
      break;
    case "traffic-light":
      DOM.trafficLightEl.style.display = "flex";
      break;
    case "go":
      DOM.goMessageEl.style.display = "flex";
      break;
  }
}

export function updateAnimatedFlag(flag) {
  if (isTrafficLightSequence) {
    console.log("Skipping flag update during traffic light sequence");
    return;
  }

  console.log("Updating flag to:", flag);
  updateDisplay("flag");
  const flagUnits = DOM.getFlagUnits();

  if (flag === "Finish") {
    flagUnits.forEach((unit, index) => {
      const isEvenColumn = Math.floor(index / CONFIG.ROWS) % 2 === 0;
      const isEvenRow = (index % CONFIG.ROWS) % 2 === 0;
      unit.style.backgroundColor =
        isEvenColumn === isEvenRow ? "black" : "white";
    });
  } else {
    const color = CONFIG.FLAG_COLORS[flag] || CONFIG.FLAG_COLORS.Danger;
    console.log("Setting flag color to:", color);
    flagUnits.forEach((unit) => (unit.style.backgroundColor = color));
  }
}

export function startTrafficLightSequence(socket) {
  console.log("Starting traffic light sequence");
  isTrafficLightSequence = true;
  updateDisplay("traffic-light");
  const lights = DOM.getLights();
  lights.forEach((light) => light.classList.remove("active"));

  let totalDelay = 0;
  CONFIG.TRAFFIC_LIGHT_SEQUENCE.forEach(
    ({ duration, light, display }, index) => {
      setTimeout(() => {
        if (light !== undefined) {
          console.log(`${["Red", "Yellow", "Green"][light]} light`);
          if (index > 0) lights[index - 1].classList.remove("active");
          lights[light].classList.add("active");
        }
        if (display) {
          console.log(`Showing ${display} message`);
          updateDisplay(display);
          socket.emit("startRace");
        }
        if (index === CONFIG.TRAFFIC_LIGHT_SEQUENCE.length - 1) {
          setTimeout(() => {
            console.log("Switching back to green flag");
            isTrafficLightSequence = false;
            updateAnimatedFlag("Safe");
          }, duration);
        }
      }, totalDelay);
      totalDelay += duration;
    }
  );
}

export function toggleFullScreen(elementId) {
  const element = document.getElementById(elementId);
  if (!document.fullscreenElement) {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }
}
