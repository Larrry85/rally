// server/socketHandlers.js
const RaceTimer = require("./raceTimer");
const { RACE_DURATION, INTERFACE_KEYS } = require("./config");
const {
  finishRace,
  addRaceSession,
  updateRaceSession,
  removeRaceSession,
} = require("./utils");

let raceSessions = [];
let currentRace = null;
let raceTimer = new RaceTimer(RACE_DURATION);

function setupSocketHandlers(io, socket) {
  console.log("New client connected");

  let clientRole = null;

  socket.on("authenticate", (key) => {
    clientRole = Object.keys(INTERFACE_KEYS).find(
      (role) => INTERFACE_KEYS[role] === key
    );
    if (clientRole) {
      socket.emit("authenticated", { success: true, role: clientRole });
    } else {
      socket.emit("authenticated", { success: false });
      console.log("Wrong access key");
    }
  });

  socket.on("startSession", () => {
    const fullMinutes = Math.floor(RACE_DURATION / 60000);
    const fullSeconds = Math.floor((RACE_DURATION % 60000) / 1000);
    io.emit("startSession", { fullMinutes, fullSeconds });
    console.log(`Session started with duration: ${fullMinutes}:${fullSeconds}`);
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
        currentRace.isNext = false;
        io.emit("raceStarted", currentRace);

        setTimeout(() => {
          io.emit("raceStarted", {
            race: currentRace,
            duration: RACE_DURATION,
          });

          raceTimer.reset(RACE_DURATION);
          raceTimer.start();

          raceTimer.on("tick", (remainingTime) => {
            io.emit("raceTimerUpdate", remainingTime);
          });

          raceTimer.on("finish", () => {
            finishRace(io, raceSessions, currentRace);
            currentRace = null;
          });
        }, 3000);
      }
    }
  });

  socket.on("finishRace", () => {
    if (clientRole === "raceControl") {
      raceTimer.stop();
      finishRace(io, raceSessions, currentRace);
      currentRace = null;
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
      io.emit("raceFlags", flag);
    }
  });

  socket.on("getRaceFlags", () => {
    socket.emit("raceFlags", currentRace ? currentRace.raceMode : "Safe");
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
}

module.exports = setupSocketHandlers;
