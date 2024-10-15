// race-control/socketHandlers.js
import { DOM } from "./dom.js";
import {
  resetPanel,
  switchLight,
  updateRaceSessionDisplay,
  turnOffAllLights,
} from "./handlers.js";
import { CONFIG } from "./config.js";

export function setupSocketHandlers(socket) {
  let currentSession = null;
  let isRaceOngoing = false;

  socket.on("authenticated", (data) => {
    if (data.success && data.role === "raceControl") {
      DOM.loginMessage.textContent = "";
      DOM.loginScreen.style.display = "none";
      DOM.raceControlApp.style.display = "block";
      socket.emit("getRaceSessions");
      switchLight("red", socket);
    } else {
      DOM.loginMessage.textContent = "Invalid access key";
      DOM.accessKeyInput.value = "";
    }
  });

  socket.on("raceSessions", (sessions) => {
    if (!isRaceOngoing) {
      const nextSession = sessions.find((session) => session.isNext);
      if (nextSession) {
        resetPanel(true);
        currentSession = nextSession;
        updateRaceSessionDisplay(currentSession);
      } else {
        resetPanel(false);
      }
    } else {
      console.log(
        "Race is ongoing. New sessions will be available after the current race finishes."
      );
    }
  });

  socket.on("startSession", () => {
    DOM.startSessionButton.style.display = "none";
    DOM.raceLights.style.display = "flex";
    DOM.buttons.style.display = "flex";
    DOM.session.style.display = "flex";
  });

  socket.on("raceStarted", () => {
    isRaceOngoing = true;
    DOM.message.innerHTML = "Race is starting!";
    setTimeout(() => (DOM.message.innerHTML = ""), CONFIG.MESSAGE_TIMEOUT);
    if (currentSession) {
      updateRaceSessionDisplay(currentSession);
    } else {
      console.warn("Race started but no current session available");
    }
  });

  socket.on("raceFinished", () => {
    isRaceOngoing = false;
    DOM.message.innerHTML = "Race finished! Transitioning to next session...";
    turnOffAllLights();

    setTimeout(() => {
      switchLight("red", socket);
    }, 3000);

    setTimeout(() => {
      DOM.message.innerHTML = "";
      socket.emit("getNextRaceSession");
    }, CONFIG.FINISH_MESSAGE_TIMEOUT);
  });

  socket.on("nextRaceSession", (session) => {
    if (session) {
      currentSession = session;
      updateRaceSessionDisplay(currentSession);
      resetPanel(true);
    } else {
      resetPanel(false);
      DOM.message.innerHTML = "No more race sessions available.";
    }
  });

  // New event to handle updates to the race session list
  socket.on("raceSessionsUpdated", () => {
    if (!isRaceOngoing) {
      socket.emit("getRaceSessions");
    }
  });
}
