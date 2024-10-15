// race-control/main.js
import { CONFIG } from "./config.js";
import { DOM } from "./dom.js";
import { switchLight } from "./handlers.js";
import { setupSocketHandlers } from "./socketHandlers.js";

const socket = io();

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

  ["green", "yellow", "red", "finish"].forEach((color) => {
    document.getElementById(color).addEventListener("click", () => {
      switchLight(color, socket);
      if (color === "finish") socket.emit("finishRace");
    });
  });

  DOM.getAllFlagButtons().forEach((flagButton) => {
    flagButton.addEventListener("click", () => {
      socket.emit("updateFlags", flagButton.getAttribute("data-flag"));
    });
  });

  setupSocketHandlers(socket);
  socket.emit("getRaceSessions");
});

// Add a listener for the custom event that will be dispatched when a new race is added
window.addEventListener("newRaceAdded", () => {
  socket.emit("raceSessionsUpdated");
});
