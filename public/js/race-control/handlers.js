// handlers.js
import { DOM } from "./dom.js";
import { FLAGS } from "./config.js";

export function resetPanel(hasSession) {
  DOM.startSessionButton.style.display = hasSession ? "block" : "none";
  DOM.session.style.display = "none";
  DOM.raceLights.style.display = "none";
  DOM.buttons.style.display = "none";

  if (!hasSession) {
    DOM.raceSessionContainer.innerHTML = "<p>No upcoming race sessions.</p>";
  }
}

export function turnOffAllLights() {
  DOM.getLightElement("green").classList.remove("on");
  DOM.getLightElement("yellow").classList.remove("on");
  DOM.getLightElement("red").classList.remove("on");
  DOM.getLightElement("finish-image").classList.remove("on");
}

export function switchLight(light, socket) {
  turnOffAllLights();
  const lightElement = DOM.getLightElement(
    light === "finish" ? "finish-image" : light
  );
  if (lightElement) {
    lightElement.classList.add("on");
    socket.emit("updateFlags", FLAGS[light.toUpperCase()]);
  } else {
    console.error(`Light element not found: ${light}`);
  }
}

export function updateRaceSessionDisplay(session) {
  DOM.raceSessionContainer.innerHTML = "";
  const sessionElement = document.createElement("div");
  sessionElement.classList.add("race-session");

  const maxNameLength = Math.max(
    ...session.drivers.map((driver) => driver.driver.length)
  );

  const formattedDrivers = session.drivers
    .map((driver) => {
      const paddedName = driver.driver.padEnd(maxNameLength);
      return `<span style="display:inline-block; min-width: ${maxNameLength}ch;"><strong>${paddedName}</strong></span> (Car: ${driver.carNumber})`;
    })
    .join("<br>");

  sessionElement.innerHTML = `
    <h3>${session.sessionName}</h3>
    <pre style="font-family: inherit;">${formattedDrivers}</pre>
  `;
  DOM.raceSessionContainer.appendChild(sessionElement);
}
