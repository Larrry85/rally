document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    const driverListDiv = document.getElementById('driverList');
    driverListDiv.innerHTML = '<p><strong>Driver List</strong></p><p>Waiting for drivers data...</p>'; // Set default message with header

    // Request driver list for the next race
    socket.emit('getRaceSessions');

    // Display driver list
    socket.on('raceSessions', (sessions) => {
        const nextSession = sessions.find(session => session.isNext);
        
        if (nextSession && nextSession.drivers.length > 0) {
            driverListDiv.innerHTML = '<p><strong>Driver List</strong></p><br>' + nextSession.drivers.map(driver => `
                <p><strong>Car:</strong> ${driver.carNumber} <strong> - Driver:</strong> ${driver.driver}</p>
            `).join('');
        } else {
            driverListDiv.innerHTML = '<p><strong>Driver List</strong></p><p style="font-size: small;"><small>Waiting for drivers data...</small></p>';
        }
    });
});