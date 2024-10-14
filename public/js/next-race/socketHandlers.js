// next-race/socketHandlers.js
import {
  updateDriverList,
  showPaddockMessage,
  hidePaddockMessage,
} from "./handlers.js";

export function setupSocketHandlers(socket) {
  socket.on("raceSessions", (sessions) => {
    const nextSession = sessions.find((session) => session.isNext);
    updateDriverList(nextSession);
  });

  socket.on("startSession", () => {
    showPaddockMessage();
  });

  socket.on("raceStarted", () => {
    hidePaddockMessage();
  });
}
