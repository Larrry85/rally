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
let isStartSessionClicked = false; // Add this line to store the state
let isRaceStarted = false; // Add this line to store the state

function setupSocketHandlers(io, socket) {
  console.log("New client connected");

  let clientRole = null;

  socket.on("authenticate", (key) => {
    clientRole = Object.keys(INTERFACE_KEYS).find(
      (role) => INTERFACE_KEYS[role] === key
    );
    if (clientRole) {
      socket.emit("authenticated", { success: true, role: clientRole });
      if (isStartSessionClicked) {
        socket.emit("startSession"); // Inform the client if the session has started
      }
      if (isRaceStarted) {
        socket.emit("raceStarted", {
          race: currentRace,
          duration: raceTimer.remainingTime,
        });
      }
    } else {
      socket.emit("authenticated", { success: false });
      console.log("Wrong access key");
    }
  });

  socket.on("startSession", () => {
    isStartSessionClicked = true; // Update the state
    const fullMinutes = Math.floor(RACE_DURATION / 60000);
    const fullSeconds = Math.floor((RACE_DURATION % 60000) / 1000);
    io.emit("startSession", { fullMinutes, fullSeconds });
    console.log(`Session started with duration: ${fullMinutes}:${fullSeconds}`);
  });

  socket.on("getRaceSessions", () => {
    if (["raceControl", "frontDesk", "lapLineTracker", "nextRace"].includes(clientRole)) {
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
      io.emit("sendCarList", session.drivers.map(driver => ({ carNumber: driver.carNumber, driver: driver.driver })));
    }
  });

  socket.on("updateRaceSession", (updatedSession) => {
    if (clientRole === "frontDesk") {
      updateRaceSession(raceSessions, updatedSession);
      io.emit("raceSessions", raceSessions);
      io.emit("sendCarList", updatedSession.drivers.map(driver => ({ carNumber: driver.carNumber, driver: driver.driver })));
    }
  });

  socket.on("removeRaceSession", (sessionId) => {
    if (clientRole === "frontDesk") {
        console.log(`Attempting to remove race session with ID: ${sessionId}`);
        console.log("Current race sessions before removal:", raceSessions);

        const previousLength = raceSessions.length; // Store previous length for comparison
        removeRaceSession(raceSessions, sessionId);
        console.log(`Race session removed. Previous count: ${previousLength}, New count: ${raceSessions.length}`);

        // Find the next session index
        let nextSessionIndex = raceSessions.findIndex(session => session.isNext);
        console.log(`Current next session index: ${nextSessionIndex}`);

        // If the next session was removed, find the new next session
        if (nextSessionIndex === -1 || raceSessions[nextSessionIndex].sessionId === sessionId) {
            console.log(`Next session with ID: ${sessionId} was removed. Finding new next session...`);
            
            // Loop to find the first non-current session and set it as next
            for (let i = 0; i < raceSessions.length; i++) {
                if (!raceSessions[i].isCurrent) {
                    raceSessions[i].isNext = true;
                    console.log(`New next session set with ID: ${raceSessions[i].sessionId}`);
                    break;
                }
            }
        } else {
            console.log("No change to next session; it wasn't removed or it wasn't the current next session.");
        }

        // Emit the updated session list
        io.emit("raceSessions", raceSessions);
        console.log("Updated race sessions emitted to clients:", raceSessions);
    } else {
        console.log(`Unauthorized attempt to remove race session by client with role: ${clientRole}`);
    }
});

  
  
  

  socket.on("startRace", () => {
    isRaceStarted = true; // Update the state
    isStartSessionClicked = false;
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

        io.emit("sendCarList", currentRace.drivers.map(driver => ({ carNumber: driver.carNumber, driver: driver.driver })));
      }
    }
  });

  socket.on("finishRace", () => {
    isRaceStarted = false; // Update the state
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
    if (clientRole === "nextRace") {
      const nextSessionIndex = raceSessions.findIndex((s) => s.isNext);
      const nextNextSession = nextSessionIndex !== -1 && nextSessionIndex + 1 < raceSessions.length
        ? raceSessions[nextSessionIndex + 1]
        : null;
      socket.emit("nextRaceSession", nextNextSession);
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

  socket.on("getStartSessionState", () => {
    socket.emit("startSessionState", isStartSessionClicked); // Emit the start session state
  });

  socket.on("getRaceStartedState", () => {
    socket.emit("raceStartedState", isRaceStarted); // Emit the race started state
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
}

module.exports = setupSocketHandlers;
