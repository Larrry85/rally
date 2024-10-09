// server/socketHandlers.js
const { INTERFACE_KEYS, RACE_DURATION, SKIP_LOGIN } = require("./config");
const {
  finishRace,
  addRaceSession,
  updateRaceSession,
  removeRaceSession,
} = require("./utils");

let raceSessions = [];
let currentRace = null;
let raceStartTime = null;
let raceFlags = "";
let raceTimer = null;

function setupSocketHandlers(io, socket) {
  console.log("New client connected");

  let clientRole = null;

  socket.on("authenticate", (key) => {
    if (SKIP_LOGIN) {
      // Automatic login logic
      if (key === INTERFACE_KEYS.frontDesk) {
        clientRole = "frontDesk";
        socket.emit("authenticated", { success: true, role: "frontDesk" });
      } else if (key === INTERFACE_KEYS.raceControl) {
        clientRole = "raceControl";
        socket.emit("authenticated", { success: true, role: "raceControl" });
      } else if (key === INTERFACE_KEYS.lapLineTracker) {
        clientRole = "lapLineTracker";
        socket.emit("authenticated", { success: true, role: "lapLineTracker" });
      }
    } else {
      // Manual login logic
      if (key === INTERFACE_KEYS.frontDesk) {
        clientRole = "frontDesk";
        socket.emit("authenticated", { success: true, role: "frontDesk" });
      } else if (key === INTERFACE_KEYS.raceControl) {
        clientRole = "raceControl";
        socket.emit("authenticated", { success: true, role: "raceControl" });
      } else if (key === INTERFACE_KEYS.lapLineTracker) {
        clientRole = "lapLineTracker";
        socket.emit("authenticated", { success: true, role: "lapLineTracker" });
      } else {
        socket.emit("authenticated", { success: false });
        console.log("Wrong access key");
      }
    }
  });

  socket.on("startSession", () => {
    const fullMinutes = Math.floor(RACE_DURATION / 60000);
    const fullSeconds = Math.floor((RACE_DURATION % 60000) / 1000);
    io.emit("startSession", { fullMinutes, fullSeconds });
    console.log("session started");
  });

  socket.on("getRaceSessions", () => {
    if (["raceControl", "frontDesk", "lapLineTracker"].includes(clientRole)) {
      socket.emit("raceSessions", raceSessions);
    }
  });

  socket.on("getCurrentRaceSession", () => {
    const currentSession = raceSessions.find((session) => session.isNext);
    socket.emit("currentRaceSession", currentSession || null);
  });

  socket.on("addRaceSession", (session) => {
    if (clientRole === "frontDesk") {
      addRaceSession(raceSessions, session);
      io.emit("raceSessions", raceSessions);
    }
  });

  socket.on("updateRaceSession", (updatedSession) => {
    if (clientRole === "frontDesk") {
      updateRaceSession(raceSessions, updatedSession);
      io.emit("raceSessions", raceSessions);
    }
  });

  socket.on("removeRaceSession", (sessionId) => {
    if (clientRole === "frontDesk") {
      removeRaceSession(raceSessions, sessionId);
      io.emit("raceSessions", raceSessions);
    }
  });

  socket.on("startRace", () => {
    if (clientRole === "raceControl") {
      currentRace = raceSessions.find((session) => session.isNext);
      if (currentRace) {
        currentRace.isCurrent = true;
        io.emit("raceStarted", currentRace);
        raceStartTime = Date.now();

        setTimeout(() => {
          io.emit("raceStarted", {
            race: currentRace,
            startTime: raceStartTime,
            duration: RACE_DURATION,
          });
          io.emit("startRace", { duration: RACE_DURATION });

          raceTimer = setTimeout(() => {
            finishRace(io, raceSessions, currentRace, raceTimer);
            currentRace = null;
            raceStartTime = null;
          }, RACE_DURATION);
        }, 3000);
      }
    }
  });

  socket.on("finishRace", () => {
    if (clientRole === "raceControl") {
      finishRace(io, raceSessions, currentRace, raceTimer);
      currentRace = null;
      raceStartTime = null;
    }
  });

  socket.on("getNextRaceSession", () => {
    if (clientRole === "raceControl") {
      const nextSession = raceSessions.find((s) => s.isNext);
      socket.emit("nextRaceSession", nextSession || null);
    }
  });

  socket.on("sendCarList", (carIds) => {
    if (clientRole === "frontDesk") {
      console.log("Broadcasting car list:", carIds);
      io.emit("carIds", carIds);
    }
  });

  socket.on("lapAdded", (data) => {
    console.log("Lap added:", data);
    io.emit("lapUpdate", data);
  });

  socket.on("updateFlags", (flag) => {
    if (clientRole === "raceControl") {
      raceFlags = flag;
      io.emit("raceFlags", raceFlags);
    }
  });

  socket.on("getRaceFlags", () => {
    socket.emit("raceFlags", raceFlags);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
}

module.exports = setupSocketHandlers;
