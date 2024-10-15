// race-flags/main.js
import { CONFIG } from "./config.js";
import { createFlagStructure } from "./dom.js";
import { updateDisplay } from "./handlers.js";
import { setupSocketHandlers } from "./socketHandlers.js";

document.addEventListener("DOMContentLoaded", () => {
  createFlagStructure(
    CONFIG.ROWS,
    CONFIG.COLUMNS,
    CONFIG.ANIMATION_DELAY_FACTOR,
    CONFIG.DISPLACEMENT_FACTOR
  );
  updateDisplay("flag");
  const socket = io();
  setupSocketHandlers(socket);
  socket.emit("getRaceFlags");
});
