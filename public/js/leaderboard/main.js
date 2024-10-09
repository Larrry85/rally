// main.js
import { CONFIG } from "./config.js";
import { DOM } from "./dom.js";
import { updateLeaderboard, updateRaceInfo } from "./handlers.js";
import { setupSocketHandlers } from "./socketHandlers.js";
import { endRace } from "./raceControl.js";

const socket = io();

const raceData = {
  drivers: [],
  remainingTime: CONFIG.INITIAL_REMAINING_TIME,
  raceMode: CONFIG.INITIAL_RACE_MODE,
  isRaceActive: false,
  countdownInterval: null,
};

document.addEventListener("DOMContentLoaded", () => {
  updateLeaderboard(raceData);
  updateRaceInfo(raceData);
  socket.emit("getRaceSessions");
});

setupSocketHandlers(socket, raceData);

socket.emit("requestRaceData");

DOM.finishButton.addEventListener("click", () => endRace(socket, raceData));
