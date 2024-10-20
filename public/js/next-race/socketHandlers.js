// next-race/socketHandlers.js
import { updateDriverList, togglePaddockMessage } from "./handlers.js"; // Import functions from handlers.js
import { DOM } from "./dom.js"; // Import DOM elements
import { CONFIG } from "./config.js"; // Import CONFIG

export function setupSocketHandlers(socket) {
  let isStartSessionClicked = false; // Flag to track if the start session button was clicked
  let isRaceStarted = false; // Flag to track if the race has started

  // Handle the raceSessions event
  socket.on("raceSessions", (sessions) => {
    console.log("All race sessions:", sessions); // Debug line to print all race sessions
    const nextSession = sessions.find((session) => session.isNext); // Find the next session
    if (nextSession) {
      updateDriverList(nextSession); // Update the driver list with the next session
    }
  });

  // Handle the startSession event
  socket.on("startSession", () => {
    isStartSessionClicked = true; // Set the flag to true
    togglePaddockMessage(true); // Show the paddock message
  });

 // Handle the raceStarted event
socket.on("raceStarted", () => {
  isRaceStarted = true; // Set the flag to true
  togglePaddockMessage(false); // Hide the paddock message
  socket.emit("getNextRaceSession"); // Request the next race session after the current one starts
});


 // Handle the nextRaceSession event
socket.on("nextRaceSession", (nextSession) => {
  console.log("nextRaceSession:", nextSession); // Debug log to check the next session details
  if (nextSession) {
    updateDriverList(nextSession); // Update the driver list with the next session details
  } else {
    DOM.driverListDiv.innerHTML = CONFIG.WAITING_MESSAGE; // Show a waiting message if no next session
  }
});

  

  // Handle the finishRace event
  socket.on("finishRace", () => {
    isRaceStarted = false; // Reset the flag
    // Request the next race session upon race finish
    socket.emit("getNextRaceSession");
  });

  // Request the current race session upon connection
  socket.emit("getCurrentRaceSession");

  // Handle the current race session response
  socket.on("currentRaceSession", (currentSession) => {
    console.log("currentSession:", currentSession); // Debug line 
    if (currentSession) {
      if (isRaceStarted) {
        // If the race has started, request the next race session
        socket.emit("getNextRaceSession");
      } else {
        updateDriverList(currentSession); // Update the driver list with the current session
        if (isStartSessionClicked) {
          togglePaddockMessage(true); // Show the paddock message if the start session button was clicked
        }
      }
    } else {
      // If no current session, request the next race session
      socket.emit("getNextRaceSession");
    }
  });

  // Request the next race session upon connection
  socket.emit("getNextRaceSession");

  // Handle the addRaceSession event
  socket.on("addRaceSession", (session) => {
    console.log("session:", session); // Debug line 
    updateDriverList(session); // Update the driver list with the new session
  });

  // Handle the updateRaceSession event
  socket.on("updateRaceSession", (updatedSession) => {
    console.log("updatedSession:", updatedSession); // Debug line 
    updateDriverList(updatedSession); // Update the driver list with the updated session
  });

  // Request the start session state upon connection
  socket.emit("getStartSessionState");

  // Handle the start session state response
  socket.on("startSessionState", (state) => {
    console.log("startSessionState:", state); // Debug line 
    isStartSessionClicked = state; // Update the flag
    if (isStartSessionClicked) {
      togglePaddockMessage(true); // Show the paddock message if the start session button was clicked
    }
  });

  // Request the race started state upon connection
  socket.emit("getRaceStartedState");

  // Handle the race started state response
  socket.on("raceStartedState", (state) => {
    console.log("raceStartedState:", state); // Debug line 
    isRaceStarted = state; // Update the flag
    if (isRaceStarted) {
      togglePaddockMessage(false); // Hide the paddock message if the race has started
      socket.emit("getNextRaceSession"); // Request the next race session
    }
  });
}