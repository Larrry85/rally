// next-race/handlers.js
import { DOM } from "./dom.js";
import { CONFIG } from "./config.js";

export function updateDriverList(session) {
  DOM.driverListDiv.innerHTML =
    session && session.drivers.length > 0
      ? `<p class="listheader"><strong>Driver List</strong></p><br>${session.drivers
          .map(
            (driver) =>
              `<p>Car: <strong>${driver.carNumber}</strong> - Driver: <strong>${driver.driver}</strong></p>`
          )
          .join("")}`
      : CONFIG.WAITING_MESSAGE;
}

export function togglePaddockMessage(show) {
  const paddockMessage = DOM.getPaddockMessage();
  if (paddockMessage) {
    paddockMessage.style.display = show ? "block" : "none";
  } else if (show) {
    DOM.driverListDiv.innerHTML += CONFIG.PADDOCK_MESSAGE;
  }
}