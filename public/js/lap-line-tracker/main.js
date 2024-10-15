// lap-line-tracker/main.js
import {
  handleLogin,
  handleRaceStarted,
  handleRaceFinished,
} from "./handlers.js";
import {
  handleAuthentication,
  handleCurrentRaceSession,
} from "./socketHandlers.js";

const socket = io();

document.addEventListener("DOMContentLoaded", () => {
  handleLogin(socket);

  socket.on("authenticated", (data) => handleAuthentication(data, socket));
  socket.on("startSession", () => socket.emit("getCurrentRaceSession"));
  socket.on("raceStarted", (currentSession) =>
    handleRaceStarted(currentSession, socket)
  );
  socket.on("raceFinished", handleRaceFinished);
  socket.on("currentRaceSession", (currentSession) =>
    handleCurrentRaceSession(currentSession, socket)
  );
});
