// handlers.js
import { DOM } from "./dom.js";
import { CONFIG } from "./config.js";

export function updateDriverList(nextSession) {
  if (nextSession && nextSession.drivers.length > 0) {
    DOM.driverListDiv.innerHTML =
      '<p class="listheader"><strong>Driver List</strong></p><br>' +
      nextSession.drivers
        .map(
          (driver) => `
        <p>Car:  <strong>${driver.carNumber}</strong>   -    Driver:  <strong>${driver.driver}</strong></p>
      `
        )
        .join("");
  } else {
    DOM.driverListDiv.innerHTML = CONFIG.WAITING_MESSAGE;
  }
}

export function showPaddockMessage() {
  const paddockMessage = DOM.getPaddockMessage();
  if (paddockMessage) {
    paddockMessage.style.display = "block";
  } else {
    DOM.driverListDiv.innerHTML += CONFIG.PADDOCK_MESSAGE;
  }
}

export function hidePaddockMessage() {
  const paddockMessage = DOM.getPaddockMessage();
  if (paddockMessage) {
    paddockMessage.style.display = "none";
  }
}
