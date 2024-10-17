// lap-line-tracker/socketHandlers.js
import { DOM } from "./dom.js";
import { handleRaceStarted, handleRaceFinished } from "./handlers.js";

export function handleAuthentication(data, socket) {
  if (data.success && data.role === "lapLineTracker") {
    DOM.loginMessage.textContent = "";
    DOM.loginScreen.style.display = "none";
    DOM.lapLinerApp.style.display = "block";
    socket.emit("getCurrentRaceSession"); // Request current race session upon login
  } else {
    setTimeout(() => {
      DOM.loginMessage.textContent = "Invalid access key";
      DOM.accessKeyInput.value = "";
    }, 500); //500ms delay
  }
}

export function handleCurrentRaceSession(currentSession, socket) {
  if (currentSession) {
    handleRaceStarted(currentSession, socket);
    DOM.lapLinerButtons.style.display = "block";
  } else {
    DOM.lapLinerMessage.style.display = "block"; // Show waiting message
  }
}

export function setupSocketHandlers(socket) {
  let currentSession = null;
  let isRaceOngoing = false;

  socket.on("authenticated", (data) => {
    handleAuthentication(data, socket);
  });

  socket.on("currentRaceSession", (currentSession) => {
    handleCurrentRaceSession(currentSession, socket);
  });

  socket.on("startSession", (currentSession) => {
    handleRaceStarted(currentSession, socket);
  });

  socket.on("raceStarted", (currentSession) => {
    isRaceOngoing = true;
    handleRaceStarted(currentSession, socket);
  });

  socket.on("raceFinished", () => {
    isRaceOngoing = false;
    handleRaceFinished();
  });

  // New event to handle updates to the race session list
  socket.on("raceSessionsUpdated", () => {
    if (!isRaceOngoing) {
      socket.emit("getCurrentRaceSession");
    }
  });
}