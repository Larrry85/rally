// front-desk/socketHandlers.js
import { DOM } from "./dom.js";
import { createDriverEntry } from "./utils.js";

export let currentSessionId = null;

export function setCurrentSessionId(id) {
  currentSessionId = id;
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
    setTimeout(() => {
      DOM.loginMessage.textContent = "Invalid access key";
      DOM.accessKeyInput.value = "";
    }, 500); //500ms delay
    
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
      <button class="removeSessionButton" ${
        session.isCurrent ? 'style="display: none;"' : ""
      }>Remove</button>
    `;
    sessionElement.setAttribute("data-session-id", session.sessionId);
    DOM.sessionsContainer.appendChild(sessionElement);

    const removeButton = sessionElement.querySelector(".removeSessionButton");
    removeButton.addEventListener("click", () => {
      if (!session.isCurrent) {
        socket.emit("removeRaceSession", session.sessionId);
      }
    });

    sessionElement
      .querySelector(".editSessionButton")
      .addEventListener("click", () => {
        DOM.sessionNameInput.value = session.sessionName;
        DOM.driversListContainer.innerHTML = "";

        session.drivers.forEach((driver) => {
          DOM.driversListContainer.appendChild(
            createDriverEntry(driver.driver, driver.carNumber)
          );
        });

        currentSessionId = session.sessionId;
        DOM.addSessionButton.textContent = "Update Session";
      });
  });
}

export function handleRaceStart(currentRace, socket) {
  console.log("Race started:", currentRace);
  
  // Remove the current session from the front desk
  const sessionElements = DOM.sessionsContainer.querySelectorAll("div[data-session-id]");
  sessionElements.forEach((element) => {
    const sessionId = element.getAttribute("data-session-id");
    if (sessionId === currentRace.sessionId.toString()) {
      element.remove(); // Remove the current race session
    }
  });

  // Emit request to fetch and display the next race session
  socket.emit("getNextRaceSession");
}

