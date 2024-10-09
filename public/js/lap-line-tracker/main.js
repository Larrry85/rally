// main.js
import {
  handleLogin,
  handleRaceStarted,
  handleRaceFinished,
} from "./handlers.js";
import {
  handleAuthentication,
  handleCarIds,
  handleCurrentRaceSession,
} from "./socketHandlers.js";

const socket = io();

document.addEventListener("DOMContentLoaded", () => {
  handleLogin(socket);

  socket.on("authenticated", (data) => handleAuthentication(data, socket));
  socket.on("startSession", () => socket.emit("getCurrentRaceSession"));
  socket.on("carIds", handleCarIds);
  socket.on("raceStarted", (currentSession) =>
    handleRaceStarted(currentSession, socket)
  );
  socket.on("raceFinished", handleRaceFinished);
  socket.on("currentRaceSession", (currentSession) =>
    handleCurrentRaceSession(currentSession, socket)
  );
});
