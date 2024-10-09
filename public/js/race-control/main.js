// main.js
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
      const key = DOM.accessKeyInput.value;
      socket.emit("authenticate", key);
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
      if (color === "finish") {
        socket.emit("finishRace");
      }
    });
  });

  DOM.getAllFlagButtons().forEach((flagButton) => {
    flagButton.addEventListener("click", () => {
      const flag = flagButton.getAttribute("data-flag");
      socket.emit("updateFlags", flag);
    });
  });

  setupSocketHandlers(socket);

  socket.emit("getRaceSessions");
});
