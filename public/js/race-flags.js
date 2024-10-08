// Socket.io integration
const socket = io(); // Initialize Socket.IO client

// Get DOM elements
const animatedFlagEl = document.getElementById("animated-flags"); // Element for animated flags
const trafficLightEl = document.getElementById("traffic-light"); // Element for traffic light
const goMessageEl = document.getElementById("go-message"); // Element for "GO!" message
const rows = 25; // Number of rows for flag units
const columns = 38; // Number of columns for flag units

let isTrafficLightSequence = false; // Flag to check if traffic light sequence is active

// Create animated flag structure
for (let i = 0; i < columns; i++) {
  const column = document.createElement("div"); // Create a column div
  column.classList.add("column"); // Add class to column
  column.id = `column-${i}`; // Set column id
  animatedFlagEl.appendChild(column); // Append column to animatedFlagEl

  for (let j = 0; j < rows; j++) {
    const flagUnit = document.createElement("div"); // Create a flag unit div
    flagUnit.classList.add("flag-unit"); // Add class to flag unit
    flagUnit.style.setProperty("animation-delay", `${i * 20}ms`); // Set animation delay
    flagUnit.style.setProperty("--displacement", `${i / 3}px`); // Set displacement
    column.appendChild(flagUnit); // Append flag unit to column
  }
}

// Listen for the 'startSession' event from the server
socket.on('startSession', () => {
  updateAnimatedFlag("Danger"); // Set flag to red (Danger)
});

// Request current race flags
socket.emit("getRaceFlags"); // Emit event to request current race flags

// Display race flags
socket.on("raceFlags", (flag) => {
  updateAnimatedFlag(flag); // Update animated flag with received flag
});

// Update race flags in real-time
socket.on("updateFlags", (flag) => {
  if (!isTrafficLightSequence) { // Check if traffic light sequence is not active
    updateAnimatedFlag(flag); // Update animated flag with received flag
  }
});

// Handle start race event
socket.on("startRace", () => {
  console.log("Start race event received"); // Log start race event
  startTrafficLightSequence(); // Start traffic light sequence
});

// Handle end race event
socket.on("raceFinished", () => {
  console.log("End race event received");
  updateAnimatedFlag("Finish");
  setTimeout(() => {
    updateDisplay("flag");
  }, 3000); // Show "race ended" message for 3 seconds
});

// Function to update the display based on state
function updateDisplay(state) {
  console.log("Updating display to:", state); // Log display update

  // Ensure all displays are hidden first
  animatedFlagEl.style.display = "none"; // Hide animated flags
  trafficLightEl.style.display = "none"; // Hide traffic light
  goMessageEl.style.display = "none"; // Hide "GO!" message

  // Then activate the correct one based on state
  switch (state) {
    case "flag":
      animatedFlagEl.style.display = "flex"; // Show animated flags
      break;
    case "traffic-light":
      trafficLightEl.style.display = "flex"; // Show traffic light
      break;
    case "go":
      goMessageEl.style.display = "flex"; // Show "GO!" message
      break;
  }
}

// Function to update the animated flag
function updateAnimatedFlag(flag) {
  if (isTrafficLightSequence) { // Check if traffic light sequence is active
    console.log("Skipping flag update during traffic light sequence"); // Log skipping flag update
    return; // Exit function
  }

  console.log("Updating flag to:", flag); // Log flag update

  updateDisplay("flag"); // Update display to show flags
  const flagUnits = document.querySelectorAll(".flag-unit"); // Get all flag units

  let color;
  switch (flag) {
    case "Safe":
      color = "green"; // Set color to green for Safe flag
      break;
    case "Hazard":
      color = "yellow"; // Set color to yellow for Hazard flag
      break;
    case "Danger":
      color = "red"; // Set color to red for Danger flag
      break;
    case "Finish":
      // For Finish flag, we'll keep the checkered pattern
      flagUnits.forEach((unit, index) => {
        const isEvenColumn = Math.floor(index / rows) % 2 === 0; // Check if column is even
        const isEvenRow = (index % rows) % 2 === 0; // Check if row is even
        unit.style.backgroundColor =
          isEvenColumn === isEvenRow ? "black" : "white"; // Set color to black or white for checkered pattern
      });
      return; // Exit the function early as we've already set the colors
    default:
      color = "red"; // Default to red
  }

  console.log("Setting flag color to:", color); // Log setting flag color
  // Set all flag units to the same color for non-Finish flags
  flagUnits.forEach((unit) => {
    unit.style.backgroundColor = color; // Set background color of flag unit
  });
}

// Function to start the traffic light sequence
function startTrafficLightSequence() {
  console.log("Starting traffic light sequence"); // Log starting traffic light sequence
  isTrafficLightSequence = true; // Set traffic light sequence flag to true

  // Force display to traffic light
  updateDisplay("traffic-light"); // Update display to show traffic light

  const lights = trafficLightEl.querySelectorAll(".light"); // Get all light elements

  // Reset lights
  lights.forEach((light) => light.classList.remove("active")); // Remove active class from all lights

  // Red light (4 seconds)
  console.log("Red light"); // Log red light
  lights[0].classList.add("active"); // Activate red light

  setTimeout(() => {
      // Yellow light (3 seconds)
      console.log("Yellow light"); // Log yellow light
      lights[0].classList.remove("active"); // Deactivate red light
      lights[1].classList.add("active"); // Activate yellow light

      setTimeout(() => {
          // Green light (3 seconds)
          console.log("Green light"); // Log green light
          lights[1].classList.remove("active"); // Deactivate yellow light
          lights[2].classList.add("active"); // Activate green light

          setTimeout(() => {
              // Show GO! message
              console.log("Showing GO! message"); // Log showing GO! message
              updateDisplay("go"); // Update display to show GO! message

              // Emit startRace event to start the countdown timer
              socket.emit("startRace");

              // After 3 seconds, switch back to green flag
              setTimeout(() => {
                  console.log("Switching back to green flag"); // Log switching back to green flag
                  isTrafficLightSequence = false; // Set traffic light sequence flag to false
                  updateAnimatedFlag("Safe"); // Update animated flag to Safe
              }, 3000); // 3 seconds
          }, 3000); // 3 seconds
      }, 3000); // 3 seconds
  }, 4000); // 4 seconds
}

// Listen for the 'startTrafficLightSequence' event from the client
socket.on('startTrafficLightSequence', startTrafficLightSequence);

// Function to toggle full screen mode
function toggleFullScreen(elementId) {
  const element = document.getElementById(elementId); // Get the element by ID
  if (!document.fullscreenElement) { // Check if not in full screen
    if (element.requestFullscreen) {
      element.requestFullscreen(); // Request full screen
    } else if (element.mozRequestFullScreen) {
      // Firefox
      element.mozRequestFullScreen(); // Request full screen for Firefox
    } else if (element.webkitRequestFullscreen) {
      // Chrome, Safari and Opera
      element.webkitRequestFullscreen(); // Request full screen for Webkit browsers
    } else if (element.msRequestFullscreen) {
      // IE/Edge
      element.msRequestFullscreen(); // Request full screen for IE/Edge
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen(); // Exit full screen
    } else if (document.mozCancelFullScreen) {
      // Firefox
      document.mozCancelFullScreen(); // Exit full screen for Firefox
    } else if (document.webkitExitFullscreen) {
      // Chrome, Safari and Opera
      document.webkitExitFullscreen(); // Exit full screen for Webkit browsers
    } else if (document.msExitFullscreen) {
      // IE/Edge
      document.msExitFullscreen(); // Exit full screen for IE/Edge
    }
  }
}

// Initialize display on page load
document.addEventListener("DOMContentLoaded", () => {
  updateDisplay("flag"); // Set initial display to flags
});