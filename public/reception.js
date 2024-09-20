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

// Display race sessions
socket.on('raceSessions', (sessions) => {
    const sessionDiv = document.getElementById('sessions');
    sessionDiv.innerHTML = ''; // Clear existing sessions

    sessions.forEach(session => {
        const sessionElement = document.createElement('div');
        sessionElement.innerHTML = `
            <strong>${session.sessionName}</strong>
            <ul>
                ${session.drivers.map(driver => `<li>${driver.driver} (Car: ${driver.carNumber})</li>`).join('')}
            </ul>
        `;
        sessionDiv.appendChild(sessionElement);
    });
});

// Add another driver input field
document.getElementById('addDriverFieldButton').addEventListener('click', () => {
    const driversList = document.getElementById('driversList');
    if (driversList.children.length < 20) { // Maximum 20 drivers
        const driverEntry = document.createElement('div');
        driverEntry.classList.add('driver-entry');
        driverEntry.innerHTML = `
            <input type="text" class="driverName" placeholder="Driver Name" required>
            <button class="removeDriverButton">Remove</button>
        `;
        driversList.appendChild(driverEntry);

        // Remove driver functionality
        driverEntry.querySelector('.removeDriverButton').addEventListener('click', () => {
            driversList.removeChild(driverEntry);
        });
    } else {
        alert("You can only add up to 20 drivers.");
    }
});

// Add a new race session with drivers
document.getElementById('addSessionButton').addEventListener('click', () => {
    const sessionName = document.getElementById('sessionName').value;

    if (!sessionName) {
        alert("Please provide a session name.");
        return;
    }

    // Collect all driver data
    const driverElements = document.querySelectorAll('.driver-entry');
    const drivers = [];

    driverElements.forEach(driverElement => {
        const driverName = driverElement.querySelector('.driverName').value;
        if (driverName) {
            drivers.push({ 
                driver: driverName, 
                carNumber: Math.floor(Math.random() * 21) // Random car number between 0-20
            });
        }
    });

    if (drivers.length === 0) {
        alert("Please add at least one driver.");
        return;
    }

    // Emit new race session with sessionName and drivers
    socket.emit('addRaceSession', { sessionName: sessionName, drivers: drivers });

    // Clear inputs
    document.getElementById('sessionName').value = '';
    
    // Reset drivers list to only one input field
    const driversList = document.getElementById('driversList');
    driversList.innerHTML = `
        <h4>Drivers</h4>
        <div class="driver-entry">
            <input type="text" class="driverName" placeholder="Driver Name" required>
            <button class="removeDriverButton">Remove</button>
        </div>
    `;

    // Re-add the event listener for the remove button
    driversList.querySelector('.removeDriverButton').addEventListener('click', () => {
        driversList.removeChild(driversList.querySelector('.driver-entry'));
    });
});
