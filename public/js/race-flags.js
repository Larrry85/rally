// Socket.io integration
const socket = io();

const animatedFlagEl = document.getElementById("animated-flags");
const rows = 25;
const columns = 38;

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

// // Update race flags in real-time
socket.on("updateFlags", (flag) => {
  updateAnimatedFlag(flag);
});

function updateAnimatedFlag(flag) {
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

  // Set all flag units to the same color for non-Finish flags
  flagUnits.forEach((unit) => {
    unit.style.backgroundColor = color;
  });
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
