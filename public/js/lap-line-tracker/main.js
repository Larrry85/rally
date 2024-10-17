// lap-line-tracker/main.js
import { handleLogin } from "./handlers.js";
import { setupSocketHandlers } from "./socketHandlers.js";

const socket = io();

document.addEventListener("DOMContentLoaded", () => {
  handleLogin(socket); // Set up login event listener
  setupSocketHandlers(socket); // Set up socket handlers for real-time updates
});