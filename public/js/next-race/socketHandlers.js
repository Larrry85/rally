// next-race/socketHandlers.js
import { updateDriverList, togglePaddockMessage } from "./handlers.js";

export function setupSocketHandlers(socket) {
  socket.on("raceSessions", (sessions) => {
    updateDriverList(sessions.find((session) => session.isNext));
  });

  socket.on("startSession", () => togglePaddockMessage(true));
  socket.on("raceStarted", () => togglePaddockMessage(false));
}
