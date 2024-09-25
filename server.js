require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();

const requiredKeys = [
  "RECEPTIONIST_KEY",
  "RACECONTROL_KEY",
  "LAP_LINE_TRACKER_KEY",
];

// Check if all required keys are set in the environment
requiredKeys.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`${key} is not set in the .env file. Server cannot start.`);
  }
});

// Define interface keys
const INTERFACE_KEYS = {
  frontDesk: process.env.RECEPTIONIST_KEY,
  raceControl: process.env.RACECONTROL_KEY,
  lapLineTracker: process.env.LAP_LINE_TRACKER_KEY,
};

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// Define routes for each interface
app.get("/front-desk", (req, res) => {
  res.sendFile(__dirname + "/public/front-desk.html");
});

app.get("/lap-line-tracker", (req, res) => {
  res.sendFile(__dirname + "/public/lap-line-tracker.html");
});

app.get("/leader-board", (req, res) => {
  res.sendFile(__dirname + "/public/leader-board.html");
});

app.get("/race-flags", (req, res) => {
  res.sendFile(__dirname + "/public/race-flags.html");
});

app.get("/race-control", (req, res) => {
  res.sendFile(__dirname + "/public/race-control.html");
});

app.get("/next-race", (req, res) => {
  res.sendFile(__dirname + "/public/next-race.html");
});

app.get("/race-countdown", (req, res) => {
  res.sendFile(__dirname + "/public/race-countdown.html");
});

// New route to get the race list
app.get("/api/race-list", (req, res) => {
  res.json(raceSessions);
});

const server = http.createServer(app);
const io = socketIo(server);

// In-memory storage for race sessions and drivers
let raceSessions = [];
let currentRace = null;
let raceStartTime = null;
let raceFlags = "";

// Handle socket connections
io.on("connection", (socket) => {
  console.log("New client connected");

  // Track client role based on authentication
  let clientRole = null;

  // Authenticate client for different interfaces
  socket.on("authenticate", (key) => {
    if (key === INTERFACE_KEYS.frontDesk) {
      clientRole = "frontDesk";
      socket.emit("authenticated", { success: true, role: "frontDesk" });
      console.log("Receptionist logged in");
    } else if (key === INTERFACE_KEYS.raceControl) {
      clientRole = "raceControl";
      socket.emit("authenticated", { success: true, role: "raceControl" });
      console.log("Race Control logged in");
    } else if (key === INTERFACE_KEYS.lapLineTracker) {
      clientRole = "lapLineTracker";
      socket.emit("authenticated", { success: true, role: "lapLineTracker" });
      console.log("Lap Line Tracker logged in");
    } else {
      socket.emit("authenticated", { success: false });
      console.log("wrong access key");
    }
  });

  socket.on('startSession', () => {
    socket.emit('startSession')
    console.log('session started')
  })

  // Event to send race sessions after authentication
  socket.on("getRaceSessions", () => {
    if (clientRole === "raceControl") {
      socket.emit("raceSessions", raceSessions); // Send current race sessions to authenticated clients
    }
  });

  // Add a new race session for raceControl
  socket.on("addRaceSession", (session) => {
    if (clientRole === "frontDesk") {
      // Create new session
      const newSession = {
        sessionId: Date.now(),
        sessionName: session.sessionName,
        drivers: session.drivers || [],
        // isNext will be set later
      };

      // Add the new session to the list
      raceSessions.push(newSession);

      // Set isNext to true for the first session only
      raceSessions.forEach((s, index) => {
        s.isNext = index === 0; // Mark the first session as next
      });

      io.emit("raceSessions", raceSessions); // Broadcast updated race sessions to all clients
    }
  });

  // Update an existing race session (for raceControl role)
  socket.on("updateRaceSession", (updatedSession) => {
    if (clientRole === "frontDesk") {
      const sessionIndex = raceSessions.findIndex(
        (session) => session.sessionId === updatedSession.sessionId
      );
      if (sessionIndex !== -1) {
        raceSessions[sessionIndex] = updatedSession; // Replace with updated session
        io.emit("raceSessions", raceSessions); // Broadcast updated sessions
      }
    }
  });

  // Remove a race session (for raceControl role)
  socket.on("removeRaceSession", (sessionId) => {
    if (clientRole === "frontDesk") {
      raceSessions = raceSessions.filter(
        (session) => session.sessionId !== sessionId
      );
      io.emit("raceSessions", raceSessions); // Broadcast updated list of race sessions
    }
  });

  // Start the race and set the timer
  socket.on("startRace", () => {
    if (clientRole === "raceControl") {
      currentRace = raceSessions.find((session) => session.isNext);
      if (currentRace) {
        raceStartTime = Date.now() + 600000; // 10 minutes from now
        io.emit("raceStarted", { race: currentRace, startTime: raceStartTime });
      }
    }
  });

  socket.on("sendCarList", (carIds) => {
    if (clientRole === "frontDesk") {
      console.log("Broadcasting car list:", carIds); // Debugging log
      io.emit("carIds", carIds); // Broadcast car IDs to all clients
    }
  });

  socket.on("lapAdded", (data) => {
    console.log("Lap added:", data); // Debugging log
    io.emit("lapUpdate", data); // Broadcast lap data to all clients
  });

  // Update race flags
  socket.on("updateFlags", (flag) => {
    if (clientRole === "raceControl") {
      raceFlags = flag;
      io.emit("raceFlags", raceFlags); // Broadcast updated flags to all clients
    }
  });

  // Send current race flags to new connections
  socket.on("getRaceFlags", () => {
    socket.emit("raceFlags", raceFlags);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(3000, () => {
  console.log("Server listening on port 3000");
});
