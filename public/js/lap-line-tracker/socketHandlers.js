// lap-line-tracker/socketHandlers.js
import { DOM } from "./dom.js";
import { handleRaceStarted } from "./handlers.js";

export function handleAuthentication(data, socket) {
  if (data.success && data.role === "lapLineTracker") {
    DOM.loginMessage.textContent = "";
    DOM.loginScreen.style.display = "none";
    DOM.lapLinerApp.style.display = "block";
    socket.emit("getCurrentRaceSession");
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
  }
}
