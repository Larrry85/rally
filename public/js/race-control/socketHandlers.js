// socketHandlers.js
import { DOM } from "./dom.js";
import {
  resetPanel,
  switchLight,
  updateRaceSessionDisplay,
} from "./handlers.js";
import { CONFIG } from "./config.js";

export function setupSocketHandlers(socket) {
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
    const nextSession = sessions.find((session) => session.isNext);
    if (nextSession) {
      resetPanel(true);
      updateRaceSessionDisplay(nextSession);
    } else {
      resetPanel(false);
    }
  });

  socket.on("startSession", () => {
    DOM.startSessionButton.style.display = "none";
    DOM.raceLights.style.display = "flex";
    DOM.buttons.style.display = "flex";
    DOM.session.style.display = "flex";
  });

  socket.on("raceStarted", () => {
    DOM.message.innerHTML = "Race is starting!";
    setTimeout(() => {
      DOM.message.innerHTML = "";
    }, CONFIG.MESSAGE_TIMEOUT);
    updateRaceSessionDisplay(currentSession);
  });

  socket.on("raceFinished", () => {
    DOM.message.innerHTML = "Race finished! Transitioning to next session...";
    setTimeout(() => {
      DOM.message.innerHTML = "";
      socket.emit("getNextRaceSession");
    }, CONFIG.FINISH_MESSAGE_TIMEOUT);
  });

  socket.on("nextRaceSession", (session) => {
    if (session) {
      updateRaceSessionDisplay(session);
      resetPanel(true);
    } else {
      resetPanel(false);
      DOM.message.innerHTML = "No more race sessions available.";
    }
  });
}
