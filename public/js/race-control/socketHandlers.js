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
  let isInFinishState = false;

  socket.on("authenticated", (data) => {
    if (data.success && data.role === "raceControl") {
      DOM.loginMessage.textContent = "";
      DOM.loginScreen.style.display = "none";
      DOM.raceControlApp.style.display = "block";
      socket.emit("getRaceSessions");
      switchLight("red", socket);
    } else {
      setTimeout(() => {
        DOM.loginMessage.textContent = "Invalid access key";
        DOM.accessKeyInput.value = "";
      }, 500); //500ms delay
    }
  });

  socket.on("raceSessions", (sessions) => {
    if (!isRaceOngoing) {
      // Check if the current session still exists
      if (
        currentSession &&
        !sessions.some(
          (session) => session.sessionId === currentSession.sessionId
        )
      ) {
        // If the current session was removed, reset it
        console.log(
          "Current session was removed. Updating to the next session."
        );
        currentSession = null; // Clear current session
      }

      // Find the new next session
      const nextSession = sessions.find((session) => session.isNext);

      if (nextSession) {
        resetPanel(true);
        currentSession = nextSession;
        updateRaceSessionDisplay(currentSession); // Update the UI with the next session
      } else {
        resetPanel(false); // No sessions available
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
    isInFinishState = true;
    DOM.message.innerHTML =
      "Race finished! Waiting for all cars to return to pit lane...";
    turnOffAllLights();
    disableFlagButtons(); // Disable the flag buttons

    // Show and enable the end session button
    if (DOM.endSessionContainer) {
      DOM.endSessionContainer.style.display = "block";
    }
    if (DOM.endSessionButton) {
      DOM.endSessionButton.style.display = "block";
      DOM.endSessionButton.disabled = false;
    }

    if (currentSession) {
      updateRaceSessionDisplay(currentSession, "finished");
    }

    setTimeout(() => {
      switchLight("red", socket);
    }, 3000);
  });

  socket.on("sessionEnded", () => {
    isInFinishState = false;
    DOM.message.innerHTML = "Session ended. Preparing for next session...";

    // Hide both container and button
    if (DOM.endSessionContainer) {
      DOM.endSessionContainer.style.display = "none";
    }
    if (DOM.endSessionButton) {
      DOM.endSessionButton.style.display = "none";
      DOM.endSessionButton.disabled = true;
    }

    disableFlagButtons(); // Ensure flags remain disabled

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

  // Listen for updated session lists
  socket.on("raceSessionsUpdated", () => {
    if (!isRaceOngoing) {
      socket.emit("getRaceSessions");
    }
  });
}

function disableFlagButtons() {
  DOM.getAllFlagButtons().forEach((button) => {
    button.disabled = true;
  });
}
