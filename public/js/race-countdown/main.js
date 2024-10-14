// race-countdown/main.js
import { setupSocketHandlers } from "./socketHandlers.js";

const socket = io();

document.addEventListener("DOMContentLoaded", () => {
  setupSocketHandlers(socket);
});
