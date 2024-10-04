document.addEventListener('DOMContentLoaded', () => {
    const socket = io(); // Initialize Socket.IO client

    const driverListDiv = document.getElementById('driverList'); // Get the driver list div element
    driverListDiv.innerHTML = '<p class="listheader"><strong>Driver List</strong></p><p>Waiting for drivers data...</p>'; // Set default message with header

    // Request driver list for the next race
    socket.emit('getRaceSessions'); // Emit event to request race sessions

    // Display driver list
    socket.on('raceSessions', (sessions) => { // Listen for 'raceSessions' event from server
        const nextSession = sessions.find(session => session.isNext); // Find the next race session

        if (nextSession && nextSession.drivers.length > 0) { // Check if next session exists and has drivers
            driverListDiv.innerHTML = '<p class="listheader"><strong>Driver List</strong></p><br>' + nextSession.drivers.map(driver => `
                <p>Car:  <strong>${driver.carNumber}</strong>   -    Driver:  <strong>${driver.driver}</strong></p>
    `).join('') + '<br><br><p style="font-size: large; color: red;"><strong>Please proceed to the paddock.</strong></p>'; // Update driver list with driver details and add paddock message
        } else {
            driverListDiv.innerHTML = '<p class="listheader"><strong>Driver List</strong></p><p style="font-size: small;"><small>Waiting for drivers data...</small></p>'; // Display waiting message if no drivers
        }
    });

});