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

const server = http.createServer(app);
const io = socketIo(server);

// In-memory storage for race sessions and drivers
let raceSessions = [];
let drivers = [];

// Helper function to assign cars to drivers
const assignCarToDriver = (driver) => {
    // Implement logic to assign cars, e.g., randomly assign car number
    return { driver, carNumber: Math.floor(Math.random() * 20) };
};

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
