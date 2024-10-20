// server/utils.js
function finishRace(io, raceSessions, currentRace) {
  if (currentRace) {
    const finishedRaceIndex = raceSessions.findIndex(
      (s) => s.sessionId === currentRace.sessionId
    );
    if (finishedRaceIndex !== -1) {
      raceSessions.splice(finishedRaceIndex, 1);

      const nextSession = raceSessions[0] || null;
      if (nextSession) nextSession.isNext = true;

      io.emit("nextRaceSession", nextSession);
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
  console.log("Current race sessions before removal:", JSON.stringify(raceSessions, null, 2));

  const initialLength = raceSessions.length;
  const indexToRemove = raceSessions.findIndex(session => session.sessionId === sessionId);

  if (indexToRemove !== -1) {
    const removedSession = raceSessions.splice(indexToRemove, 1)[0];
    console.log(`Session with ID ${sessionId} removed. Previous count: ${initialLength}, New count: ${raceSessions.length}`);
    return removedSession;
  }

  console.log(`No session found with ID ${sessionId}.`);
  return null; // or any indication that removal failed
}

module.exports = {
  finishRace,
  addRaceSession,
  updateRaceSession,
  removeRaceSession,
};
