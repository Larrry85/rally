const socket = io();

// Handle login
document.getElementById('loginButton').addEventListener('click', () => {
    const key = document.getElementById('accessKey').value;
    socket.emit('authenticate', key);  // Emit authentication event
});

socket.on('authenticated', (data) => {
    if (data.success) {
        document.getElementById('login').style.display = 'none';
        document.getElementById('raceControlApp').style.display = 'block';
        socket.emit('getRaceSessions'); // Request current race sessions
    } else {
        alert('Invalid access key');
    }
});

// Listen for race sessions data and render it
socket.on('raceSessions', (sessions) => {
    const container = document.getElementById('raceSessionContainer');
    container.innerHTML = ''; // Clear the previous sessions

    // Render the race sessions
    sessions.forEach(session => {
        const sessionElement = document.createElement('div');
        sessionElement.classList.add('race-session');
        sessionElement.innerHTML = `
            <h3>${session.sessionName}</h3>
            <ul>
                ${session.drivers.map(driver => `<li>${driver.driver} (Car: ${driver.carNumber})</li>`).join('')}
            </ul>
        `;
        container.appendChild(sessionElement);
    });
});

// Emit event to start the race
document.getElementById('startRaceButton').addEventListener('click', () => {
    socket.emit('startRace');
});

// Notify when a race has started
socket.on('raceStarted', () => {
    alert('Race started');
});
