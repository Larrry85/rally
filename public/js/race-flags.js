// Socket.io integration
const socket = io();

const animatedFlagEl = document.getElementById("animated-flags");
const trafficLightEl = document.getElementById("traffic-light");
const goMessageEl = document.getElementById("go-message");
const rows = 25;
const columns = 38;

let isTrafficLightSequence = false;

// Create animated flag structure
for (let i = 0; i < columns; i++) {
  const column = document.createElement("div");
  column.classList.add("column");
  column.id = `column-${i}`;
  animatedFlagEl.appendChild(column);

  for (let j = 0; j < rows; j++) {
    const flagUnit = document.createElement("div");
    flagUnit.classList.add("flag-unit");
    flagUnit.style.setProperty("animation-delay", `${i * 20}ms`);
    flagUnit.style.setProperty("--displacement", `${i / 3}px`);
    column.appendChild(flagUnit);
  }
}

// Request current race flags
socket.emit("getRaceFlags");

// Display race flags
socket.on("raceFlags", (flag) => {
  updateAnimatedFlag(flag);
});

// Update race flags in real-time
socket.on("updateFlags", (flag) => {
  if (!isTrafficLightSequence) {
    updateAnimatedFlag(flag);
  }
});

// Handle start session event
socket.on("startSession", () => {
  console.log("Start session event received");
  updateAnimatedFlag("Safe");
});

// Handle start race event
socket.on("startRace", () => {
  console.log("Start race event received");
  startTrafficLightSequence();
});

function updateDisplay(state) {
  console.log("Updating display to:", state);

  // Ensure all displays are hidden first
  animatedFlagEl.style.display = "none";
  trafficLightEl.style.display = "none";
  goMessageEl.style.display = "none";

  // Then activate the correct one based on state
  switch (state) {
    case "flag":
      animatedFlagEl.style.display = "flex";
      break;
    case "traffic-light":
      trafficLightEl.style.display = "flex";
      break;
    case "go":
      goMessageEl.style.display = "flex";
      break;
  }
}

function updateAnimatedFlag(flag) {
  if (isTrafficLightSequence) {
    console.log("Skipping flag update during traffic light sequence");
    return;
  }

  console.log("Updating flag to:", flag);

  updateDisplay("flag");
  const flagUnits = document.querySelectorAll(".flag-unit");

  let color;
  switch (flag) {
    case "Safe":
      color = "green";
      break;
    case "Hazard":
      color = "yellow";
      break;
    case "Danger":
      color = "red";
      break;
    case "Finish":
      // For Finish flag, we'll keep the checkered pattern
      flagUnits.forEach((unit, index) => {
        const isEvenColumn = Math.floor(index / rows) % 2 === 0;
        const isEvenRow = (index % rows) % 2 === 0;
        unit.style.backgroundColor =
          isEvenColumn === isEvenRow ? "black" : "white";
      });
      return; // Exit the function early as we've already set the colors
    default:
      color = "red"; // Default to red
  }

  console.log("Setting flag color to:", color);
  // Set all flag units to the same color for non-Finish flags
  flagUnits.forEach((unit) => {
    unit.style.backgroundColor = color;
  });
}

function startTrafficLightSequence() {
  console.log("Starting traffic light sequence");
  isTrafficLightSequence = true;

  // Force display to traffic light
  updateDisplay("traffic-light");

  const lights = trafficLightEl.querySelectorAll(".light");

  // Reset lights
  lights.forEach((light) => light.classList.remove("active"));

  // Red light (4 seconds)
  console.log("Red light");
  lights[0].classList.add("active");

  setTimeout(() => {
    // Yellow light (3 seconds)
    console.log("Yellow light");
    lights[0].classList.remove("active");
    lights[1].classList.add("active");

    setTimeout(() => {
      // Green light (3 seconds)
      console.log("Green light");
      lights[1].classList.remove("active");
      lights[2].classList.add("active");

      setTimeout(() => {
        // Show GO! message
        console.log("Showing GO! message");
        updateDisplay("go");

        // After 1 second, switch back to green flag
        setTimeout(() => {
          console.log("Switching back to green flag");
          isTrafficLightSequence = false;
          updateAnimatedFlag("Safe");
        }, 3000);
      }, 300);
    }, 3000);
  }, 4000);
}

function toggleFullScreen(elementId) {
  const element = document.getElementById(elementId);
  if (!document.fullscreenElement) {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      // Firefox
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      // Chrome, Safari and Opera
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      // IE/Edge
      element.msRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      // Firefox
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      // Chrome, Safari and Opera
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      // IE/Edge
      document.msExitFullscreen();
    }
  }
}

// Initialize display on page load
document.addEventListener("DOMContentLoaded", () => {
  updateDisplay("flag");
});
