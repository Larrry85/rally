const socket = io();

// Request driver list for the next race
socket.emit('getRaceSessions');

// Display driver list
socket.on('raceSessions', (sessions) => {
    const nextSession = sessions.find(session => session.isNext);
    if (nextSession) {
        const driverListDiv = document.getElementById('driverList');
        driverListDiv.innerHTML = nextSession.drivers.map(driver => `
            <p><strong>Car Number:</strong> ${driver.carNumber}, <strong>Driver Name:</strong> ${driver.driver}</p>
        `).join('');
    }
});