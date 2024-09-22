//race-contol.js
const socket = io();

// Handle login
document.getElementById('loginButton').addEventListener('click', () => {
    const key = document.getElementById('accessKey').value;
    socket.emit('authenticate', key);  // Emit authentication event
});

socket.on('authenticated', (data) => {
    if (data.success) {
        document.getElementById('login').style.display = 'none';
        document.getElementById('app').style.display = 'block';
        socket.emit('getRaceSessions'); // Request current race sessions
    } else {
        alert('Invalid access key');
    }
});

document.getElementById('startRaceButton').addEventListener('click', () => {
    socket.emit('startRace');
});


socket.on('raceSession', (sessions) => {

});

socket.on('raceStarted', () => {
    alert('race started')
});