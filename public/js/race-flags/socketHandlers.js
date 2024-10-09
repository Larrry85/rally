// socketHandlers.js
import {
  updateAnimatedFlag,
  startTrafficLightSequence,
  updateDisplay,
} from "./handlers.js";
import { CONFIG } from "./config.js";

export function setupSocketHandlers(socket) {
  socket.on("startSession", () => {
    updateAnimatedFlag("Danger");
  });

  socket.on("raceFlags", (flag) => {
    updateAnimatedFlag(flag);
  });

  socket.on("updateFlags", (flag) => {
    updateAnimatedFlag(flag);
  });

  socket.on("startRace", () => {
    console.log("Start race event received");
    startTrafficLightSequence(socket);
  });

  socket.on("raceFinished", () => {
    console.log("End race event received");
    updateAnimatedFlag("Finish");
    setTimeout(() => {
      updateDisplay("flag");
    }, CONFIG.RACE_END_MESSAGE_DURATION);
  });

  socket.on("startTrafficLightSequence", () =>
    startTrafficLightSequence(socket)
  );
}
