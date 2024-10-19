// front-desk/handlers.js
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
    socket.emit("authenticate", CONFIG.DEFAULT_AUTH_KEY);
  } else {
    const attemptLogin = () => {
      const key = DOM.accessKeyInput.value;
      socket.emit("authenticate", key);
    };

    DOM.loginButton.addEventListener("click", attemptLogin);

    DOM.accessKeyInput.addEventListener("keyup", (event) => {
      if (event.key === "Enter") {
        attemptLogin();
      }
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

  if (currentSessionId) {
    socket.emit("updateRaceSession", {
      sessionId: currentSessionId,
      sessionName: sessionName,
      drivers: drivers,
    });
  } else {
    socket.emit("addRaceSession", {
      sessionName: sessionName,
      drivers: drivers,
    });
  }

  socket.emit("updateDriverList", drivers);
  sendCarListToServer(socket, drivers);

  resetForm();
}

function collectDriversData() {
  const driverElements = DOM.driversListContainer.querySelectorAll(".driver-entry");
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
      return; // Exit the current iteration if validation fails
    }

    if (driverNamesSet.has(driverName)) {
      showMessage("duplicateName", `The driver name "${driverName}" has already been added. Please use a unique name.`);
      isValid = false;
      return;
    }
    driverNamesSet.add(driverName);

    if (carNumbersSet.has(carNumber)) {
      showMessage("duplicateCarNumber", `The car number "${carNumber}" has already been selected. Please choose a different car number.`);
      isValid = false;
      return;
    }
    carNumbersSet.add(carNumber);

    drivers.push({ driver: driverName, carNumber: carNumber });
  });

  // If there are no valid drivers after the check, notify the user
  if (drivers.length === 0 && isValid) {
    showMessage("minDrivers", "You need to add at least 1 driver with both name and car number.");
    isValid = false;
  }

  return { drivers, isValid };
}


function resetForm() {
  DOM.sessionNameInput.value = "";
  DOM.driversListContainer.innerHTML = "";
  DOM.driversListContainer.appendChild(createDriverEntry());
  setCurrentSessionId(null);
  DOM.addSessionButton.textContent = "Add Session";
}
