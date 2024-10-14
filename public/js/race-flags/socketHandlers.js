// race-flags/socketHandlers.js
import {
  updateAnimatedFlag,
  startTrafficLightSequence,
  updateDisplay,
} from "./handlers.js";
import { CONFIG } from "./config.js";

export function setupSocketHandlers(socket) {
  socket.on("startSession", () => updateAnimatedFlag("Danger"));
  socket.on("raceFlags", updateAnimatedFlag);
  socket.on("updateFlags", updateAnimatedFlag);
  socket.on("raceStarted", startTrafficLightSequence);
  socket.on("raceFinished", () => {
    updateAnimatedFlag("Finish");
    setTimeout(() => updateDisplay("flag"), CONFIG.RACE_END_MESSAGE_DURATION);
  });
  socket.on("startTrafficLightSequence", startTrafficLightSequence);
}
