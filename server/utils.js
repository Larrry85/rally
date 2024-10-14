// server/utils.js
function finishRace(io, raceSessions, currentRace) {
  if (currentRace) {
    const finishedRaceIndex = raceSessions.findIndex(
      (s) => s.sessionId === currentRace.sessionId
    );
    if (finishedRaceIndex !== -1) {
      raceSessions.splice(finishedRaceIndex, 1);

      if (raceSessions.length > 0) {
        const nextSession = raceSessions[0];
        nextSession.isNext = true;
        io.emit("nextRaceSession", nextSession);
      } else {
        io.emit("nextRaceSession", null);
      }

      io.emit("raceFinished");
      io.emit("raceSessions", raceSessions);
    }
  }
}

function addRaceSession(raceSessions, session) {
  const newSession = {
    sessionId: Date.now(),
    sessionName: session.sessionName,
    drivers: session.drivers || [],
    isNext: raceSessions.length === 0,
  };
  raceSessions.push(newSession);
}

function updateRaceSession(raceSessions, updatedSession) {
  const sessionIndex = raceSessions.findIndex(
    (session) => session.sessionId === updatedSession.sessionId
  );
  if (sessionIndex !== -1) {
    raceSessions[sessionIndex] = {
      ...raceSessions[sessionIndex],
      ...updatedSession,
    };
  }
}

function removeRaceSession(raceSessions, sessionId) {
  const index = raceSessions.findIndex(
    (session) => session.sessionId === sessionId
  );
  if (index !== -1) {
    raceSessions.splice(index, 1);
  }
}

module.exports = {
  finishRace,
  addRaceSession,
  updateRaceSession,
  removeRaceSession,
};
