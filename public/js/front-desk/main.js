// front-desk/main.js
import { DOM } from "./dom.js";
import { handleLogin, handleAddDriver, handleAddSession } from "./handlers.js";
import {
  handleAuthentication,
  handleRaceSessions,
  handleRaceStart,
} from "./socketHandlers.js";
import { createDriverEntry } from "./utils.js";

const socket = io();

document.addEventListener("DOMContentLoaded", () => {
  handleLogin(socket);

  DOM.addDriverButton.addEventListener("click", handleAddDriver);
  DOM.addSessionButton.addEventListener("click", () =>
    handleAddSession(socket)
  );

  socket.on("authenticated", (data) => handleAuthentication(data, socket));
  socket.on("raceSessions", (sessions) => handleRaceSessions(sessions, socket));
  socket.on("raceStarted", (currentRace) => handleRaceStart(currentRace));

  DOM.driversListContainer.appendChild(createDriverEntry());
});
