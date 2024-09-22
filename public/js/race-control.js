//race control
const socket = io();

// Handle login
document.getElementById('loginButton').addEventListener('click', () => {
    const key = document.getElementById('accessKey').value;
    socket.emit('authenticate', key);  // Emit authentication event
});

socket.on('authenticated', (data) => {
    const messageContainer = document.getElementById('loginMessage')
    if (data.success) {
        messageContainer.textContent = '';
        document.getElementById('login').style.display = 'none';
        document.getElementById('raceControlApp').style.display = 'block';
        document.getElementById('raceLights').style.display = 'flex';
        socket.emit('getRaceSessions'); // Request current race sessions
    } else {
        messageContainer.textContent = 'Invalid access key'
    }
});

// Listen for race sessions data and render it
socket.on('raceSessions', (sessions) => {
    const container = document.getElementById('raceSessionContainer');
    container.innerHTML = ''; // Clear the previous sessions

    // Filter to get only the next race session
    const nextSession = sessions.find(session => session.isNext);

    if (nextSession) {
        const sessionElement = document.createElement('div');
        sessionElement.classList.add('race-session');
        sessionElement.innerHTML = `
            <h3>${nextSession.sessionName}</h3>
            <ul>
                ${nextSession.drivers.map(driver => `<li>${driver.driver} (Car: ${driver.carNumber})</li>`).join('')}
            </ul>
        `;
        container.appendChild(sessionElement);
    } else {
        container.innerHTML = '<p>No upcoming race sessions.</p>';
    }
});



// Emit event to start the race
document.getElementById('startRaceButton').addEventListener('click', () => {
    socket.emit('startRace');
});

// Notify when a race has started
socket.on('raceStarted', () => {
    alert('Race started');
});
