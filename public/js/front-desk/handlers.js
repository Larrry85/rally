// handlers.js
import { CONFIG } from "./config.js";
import { DOM } from "./dom.js";
import {
  createDriverEntry,
  showMessage,
  sendCarListToServer,
} from "./utils.js";
import { currentSessionId, setCurrentSessionId } from "./socketHandlers.js";

export function handleLogin(socket) {
  if (CONFIG.SKIP_LOGIN) {
    socket.emit("authenticate", "0000");
  } else {
    DOM.loginButton.addEventListener("click", () => {
      const key = DOM.accessKeyInput.value;
      socket.emit("authenticate", key);
    });
  }
}

export function handleAddDriver() {
  const currentDrivers =
    DOM.driversListContainer.querySelectorAll(".driver-entry").length;
  if (currentDrivers < CONFIG.MAX_DRIVERS) {
    DOM.driversListContainer.appendChild(createDriverEntry());
  } else {
    showMessage("main", "max 8 drivers!");
  }
}

export function handleAddSession(socket) {
  const sessionName = DOM.sessionNameInput.value;

  if (!sessionName) {
    showMessage("sessionName", "Please add a session name.");
    return;
  }

  const { drivers, isValid } = collectDriversData();

  if (!isValid) return;

  if (drivers.length === 0) {
    showMessage("minDrivers", "you need at least 1 driver!");
    return;
  }

  // Double-check if we're in "edit mode" based on the currentSessionId
  console.log("Current Session ID before saving:", currentSessionId); // Debugging

  if (currentSessionId) {
    // If currentSessionId is set, we are updating the session
    console.log("Updating session with ID:", currentSessionId);

    socket.emit("updateRaceSession", {
      sessionId: currentSessionId, // Use current session ID for updating
      sessionName: sessionName,
      drivers: drivers,
    });

    // Reset the session ID after update
    setCurrentSessionId(null); // Call the function to reset
  } else {
    // No currentSessionId means this is a new session
    console.log("Adding new session");

    socket.emit("addRaceSession", {
      sessionName: sessionName,
      drivers: drivers,
    });
  }

  socket.emit("updateDriverList", drivers);
  sendCarListToServer(socket, drivers);

  resetForm(); // Reset the form after adding/updating session
}

function collectDriversData() {
  const driverElements =
    DOM.driversListContainer.querySelectorAll(".driver-entry");
  const drivers = [];
  const driverNamesSet = new Set();
  const carNumbersSet = new Set();
  let isValid = true;

  driverElements.forEach((driverElement) => {
    const driverName = driverElement.querySelector(".driverName").value.trim();
    const carNumber = driverElement.querySelector(".carNumberDropdown").value;

    if (!driverName || !carNumber) {
      showMessage("minDrivers", "Each driver must have a name and car number.");
      isValid = false;
      return;
    }

    if (driverNamesSet.has(driverName)) {
      showMessage(
        "duplicateName",
        `The driver name "${driverName}" has already been added. Please use a unique name.`
      );
      isValid = false;
      return;
    }
    driverNamesSet.add(driverName);

    if (carNumbersSet.has(carNumber)) {
      showMessage(
        "duplicateCarNumber",
        `The car number "${carNumber}" has already been selected. Please choose a different car number.`
      );
      isValid = false;
      return;
    }
    carNumbersSet.add(carNumber);

    drivers.push({
      driver: driverName,
      carNumber: carNumber,
    });
  });

  return { drivers, isValid };
}

function resetForm() {
  // Reset form fields after adding/updating session
  DOM.sessionNameInput.value = "";
  DOM.driversListContainer.innerHTML = ""; // Clear all driver fields
  DOM.driversListContainer.appendChild(createDriverEntry()); // Add one empty driver field for convenience
  setCurrentSessionId(null); // Use the setter function instead of direct assignment
}
