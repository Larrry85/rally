// race-control/main.js
import { CONFIG } from "./config.js";
import { DOM } from "./dom.js";
import { switchLight } from "./handlers.js";
import { setupSocketHandlers } from "./socketHandlers.js";

const socket = io();

// Function to disable all flag buttons
function disableFlagButtons() {
  DOM.getAllFlagButtons().forEach((button) => {
    button.disabled = true;
  });
}

// Function to enable all flag buttons
function enableFlagButtons() {
  DOM.getAllFlagButtons().forEach((button) => {
    button.disabled = false;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (CONFIG.SKIP_LOGIN) {
    socket.emit("authenticate", CONFIG.DEFAULT_AUTH_KEY);
  } else {
    DOM.loginButton.addEventListener("click", () => {
      socket.emit("authenticate", DOM.accessKeyInput.value);
    });
  }

  DOM.startSessionButton.addEventListener("click", () => {
    socket.emit("startSession");
  });

  DOM.startRaceButton.addEventListener("click", () => {
    socket.emit("startRace");
    switchLight("green", socket);
  });

  // Disable flag buttons initially
  disableFlagButtons();

  ["green", "yellow", "red", "finish"].forEach((color) => {
    document.getElementById(color).addEventListener("click", () => {
      switchLight(color, socket);
      if (color === "finish") socket.emit("finishRace");
    });
  });

  setupSocketHandlers(socket);
  socket.emit("getRaceSessions");
});

window.addEventListener("newRaceAdded", () => {
  socket.emit("raceSessionsUpdated");
});

// Enable flag buttons when the race starts
socket.on("raceStarted", () => {
  enableFlagButtons();
});
