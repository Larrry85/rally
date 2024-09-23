const socket = io();

// Request current race flags
socket.emit('getRaceFlags');

// Display race flags
socket.on('raceFlags', (flag) => {
    const flagsDiv = document.getElementById('flags');
    flagsDiv.innerHTML = `<p>${flag} </p>`;
});

// Update race flags in real-time
socket.on('raceFlags', (flag) => {
    const flagsDiv = document.getElementById('flags');
    flagsDiv.innerHTML = `<p>${flag} </p>`;
});