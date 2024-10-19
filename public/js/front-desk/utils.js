// front-desk/utils.js
import { DOM } from "./dom.js";
import { CONFIG } from "./config.js";


export function createDriverEntry(name = "", selectedCarNumber = null) {
  const driverEntry = document.createElement("div");
  driverEntry.classList.add("driver-entry");

  const carNumberDropdown = createCarNumberDropdown(selectedCarNumber);

  driverEntry.innerHTML = `
    <input type="text" class="driverName" value="${name}" placeholder="Driver Name" required>
  `;
  driverEntry.appendChild(carNumberDropdown);

  const removeButton = document.createElement("button");
  removeButton.classList.add("removeDriverButton");
  removeButton.textContent = "Remove";
  removeButton.addEventListener("click", () => {
    driverEntry.remove();
  });
  driverEntry.appendChild(removeButton);

  return driverEntry;
}

function createCarNumberDropdown(selectedCarNumber = null) {
  const carNumberDropdown = document.createElement("select");
  carNumberDropdown.classList.add("carNumberDropdown");

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Select Car Number";
  defaultOption.disabled = true;
  defaultOption.selected = !selectedCarNumber;
  carNumberDropdown.appendChild(defaultOption);

  CONFIG.AVAILABLE_CAR_NUMBERS.forEach((num) => {
    const option = document.createElement("option");
    option.value = num.toString();
    option.textContent = `Car ${num}`;
    if (num.toString() === selectedCarNumber) {
      option.selected = true;
    }
    carNumberDropdown.appendChild(option);
  });

  return carNumberDropdown;
}

export function showMessage(type, message) {
  const messageElement = DOM.messageContainers[type];
  if (messageElement) {
    messageElement.textContent = message;
    setTimeout(() => {
      messageElement.textContent = "";
    }, 5000);
  }
}

export function sendCarListToServer(socket, drivers) {
  const carIds = drivers.map((driver) => driver.carNumber);
  socket.emit("sendCarList", carIds);
}
