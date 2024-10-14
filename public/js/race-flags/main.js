// race-flags/main.js
import { CONFIG } from "./config.js";
import { DOM, createFlagStructure } from "./dom.js";
import { updateDisplay } from "./handlers.js";
import { setupSocketHandlers } from "./socketHandlers.js";

const socket = io();

document.addEventListener("DOMContentLoaded", () => {
  createFlagStructure(
    CONFIG.ROWS,
    CONFIG.COLUMNS,
    CONFIG.ANIMATION_DELAY_FACTOR,
    CONFIG.DISPLACEMENT_FACTOR
  );
  updateDisplay("flag");
  setupSocketHandlers(socket);
  socket.emit("getRaceFlags");
});
