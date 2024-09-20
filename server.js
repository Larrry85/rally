//server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();

const RECEPTIONIST_KEY = process.env.RECEPTIONIST_KEY;

if (!RECEPTIONIST_KEY) {
    throw new Error("RECEPTIONIST_KEY is not set. Server cannot start.");
}

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + 'public/index.html');
});

// Define routes for each interface
app.get('/front-desk', (req, res) => {
    res.sendFile(__dirname + '/public/front-desk.html'); // Front desk interface
});

const server = http.createServer(app);
const io = socketIo(server);

// In-memory storage for race sessions and drivers
let raceSessions = [];



io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('authenticate', (key) => {
        if (key === RECEPTIONIST_KEY) {
            socket.emit('authenticated', { success: true });

            // Emit the existing race sessions
            socket.on('getRaceSessions', () => {
                socket.emit('raceSessions', raceSessions);
            });

           // Add new race session
socket.on('addRaceSession', (session) => {
    raceSessions.push({
        sessionId: Date.now(),
        sessionName: session.sessionName,
        drivers: session.drivers || []  
    });

    // Update race session
socket.on('updateRaceSession', (updatedSession) => {
    const sessionIndex = raceSessions.findIndex(session => session.sessionId === updatedSession.sessionId);
    
    if (sessionIndex !== -1) {
        raceSessions[sessionIndex] = updatedSession; // Replace the session with the updated one
        io.emit('raceSessions', raceSessions);  // Broadcast updated race sessions to all clients
    }
});
    io.emit('raceSessions', raceSessions);  // Broadcast updated race sessions to all clients
});


            // Remove race session
            socket.on('removeRaceSession', (sessionId) => {
                raceSessions = raceSessions.filter(session => session.sessionId !== sessionId);
                io.emit('raceSessions', raceSessions);
            });

        } else {
            socket.emit('authenticated', { success: false });
            socket.disconnect();
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});



server.listen(3000, () => {
    console.log('Server listening on port 3000');
});
