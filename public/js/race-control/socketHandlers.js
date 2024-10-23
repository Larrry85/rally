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
      }, 500); // 500ms delay
    }
  });

  socket.on("raceSessions", (sessions) => {
    if (!isRaceOngoing) {
      // Check if the current session still exists
      if (
        currentSession &&
        !sessions.some((session) => session.sessionId === currentSession.sessionId)
      ) {
        console.log("Current session was removed. Updating to the next session.");
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
      console.log("Race is ongoing. New sessions will be available after the current race finishes.");
    }
  });

  socket.on("startSession", () => {
    // Hide everything if the end session button is visible
    if (DOM.endSessionButton.style.display === "block") {
      hideEverything();
    } else {
      // Start the session by hiding the start session button and showing race elements
      DOM.startSessionButton.style.display = "none";
      DOM.raceLights.style.display = "flex";
      DOM.buttons.style.display = "flex";
      DOM.session.style.display = "flex";
    }
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
    DOM.message.innerHTML = "Race finished! Waiting for all cars to return to pit lane...";
    turnOffAllLights();
    disableFlagButtons();
    hideEverything(); // Hide all UI except for the End Session button

    // Show the End Session button
    DOM.endSessionContainer.style.display = "block";
    DOM.endSessionButton.style.display = "block";
    DOM.endSessionButton.disabled = false;
  });

  DOM.endSessionButton.addEventListener("click", () => {
    // Hide End Session button and show everything else
    hideEndSessionButton();

    // Show all session-related elements
    showEverything();

    // Emit to get the next race session
    socket.emit("getNextRaceSession");
  });

  socket.on("sessionEnded", () => {
    isInFinishState = false;
    DOM.message.innerHTML = "Session ended. Preparing for next session...";

    // Hide end session button
    if (DOM.endSessionContainer) {
      DOM.endSessionContainer.style.display = "none";
    }
    if (DOM.endSessionButton) {
      DOM.endSessionButton.style.display = "none";
      DOM.endSessionButton.disabled = true;
    }

    disableFlagButtons();
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

function hideEverything() {
  // Hide all UI elements except for the End Session button
  DOM.startSessionButton.style.display = "none";
  DOM.startSessionButton.disabled = true;
  DOM.raceLights.style.display = "none"; // Hide race lights if present
  DOM.buttons.style.display = "none"; // Hide other buttons if present
  DOM.session.style.display = "none"; // Hide session info if present
  // Add any additional UI elements you want to hide here
}

function showEverything() {
  // Show all UI elements related to the session
  DOM.startSessionButton.style.display = "inline-block"; 
  DOM.startSessionButton.disabled = false; // Enable the button
  DOM.raceLights.style.display = "flex"; // Show race lights if applicable
  DOM.buttons.style.display = "flex"; // Show other buttons if applicable
  DOM.session.style.display = "flex"; // Show session info if applicable
  // Add any additional UI elements you want to show here
}

function hideEndSessionButton() {
  if (DOM.endSessionContainer) {
    DOM.endSessionContainer.style.display = "none";
  }
  if (DOM.endSessionButton) {
    DOM.endSessionButton.style.display = "none";
    DOM.endSessionButton.disabled = true;
  }
}
