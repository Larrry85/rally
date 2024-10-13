// main.js
import { DOM } from "./dom.js";
import { CONFIG } from "./config.js";
import { setupSocketHandlers } from "./socketHandlers.js";

document.addEventListener("DOMContentLoaded", () => {
  const socket = io();

  DOM.driverListDiv.innerHTML = CONFIG.DEFAULT_MESSAGE;

  socket.emit("getRaceSessions");

  setupSocketHandlers(socket);
});