// socketHandlers.js
import { DOM } from "./dom.js";
import { createDriverEntry } from "./utils.js";

export let currentSessionId = null; // Now exported correctly

export function setCurrentSessionId(id) {
  currentSessionId = id; // Allow the ID to be updated
}

export function handleAuthentication(data, socket) {
  if (data.success && data.role === "frontDesk") {
    DOM.loginMessage.textContent = "";
    DOM.loginScreen.style.display = "none";
    DOM.frontDeskApp.style.display = "block";
    socket.emit("getRaceSessions");

    DOM.driversListContainer.innerHTML = "";
    DOM.driversListContainer.appendChild(createDriverEntry());
  } else {
    DOM.loginMessage.textContent = "Invalid access key";
    DOM.accessKeyInput.value = "";
  }
}

export function handleRaceSessions(sessions, socket) {
  DOM.sessionsContainer.innerHTML = "";

  sessions.forEach((session) => {
    const sessionElement = document.createElement("div");
    sessionElement.innerHTML = `
      <strong>${session.sessionName}</strong>
      <ul>
        ${session.drivers
          .map(
            (driver) => `<li>${driver.driver} (Car: ${driver.carNumber})</li>`
          )
          .join("")}
      </ul>
      <button class="editSessionButton">Edit</button>
      <button class="removeSessionButton">Remove</button>
    `;
    DOM.sessionsContainer.appendChild(sessionElement);

    sessionElement
      .querySelector(".removeSessionButton")
      .addEventListener("click", () => {
        socket.emit("removeRaceSession", session.sessionId);
      });

    // Handle session editing
    sessionElement
      .querySelector(".editSessionButton")
      .addEventListener("click", () => {
        // Populate form with session data for editing
        DOM.sessionNameInput.value = session.sessionName;
        DOM.driversListContainer.innerHTML = ""; // Clear current drivers list

        // Populate driver fields with session data
        session.drivers.forEach((driver) => {
          DOM.driversListContainer.appendChild(
            createDriverEntry(driver.driver, driver.carNumber)
          );
        });

        // Set the current session ID to enable updating
        currentSessionId = session.sessionId; // Set the session ID to be updated
        console.log("Editing session ID:", currentSessionId); // Debugging to confirm it's set
        DOM.addSessionButton.textContent = "Update Session";
      });
  });
}
