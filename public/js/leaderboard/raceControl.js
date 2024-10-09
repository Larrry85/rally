// raceControl.js
import { updateRaceInfo } from "./handlers.js";

export function endRace(socket, raceData) {
  raceData.isRaceActive = false;
  clearInterval(raceData.countdownInterval);
  raceData.raceMode = "Finish";
  updateRaceInfo(raceData);
  socket.emit("endRace");
}
