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
let currentSessionId = null;  // Variable to track session being edited

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
            <button class="editSessionButton">Edit</button>
            <button class="removeSessionButton">Remove</button>
        `;
        sessionDiv.appendChild(sessionElement);

        // Handle Remove Session
        sessionElement.querySelector('.removeSessionButton').addEventListener('click', () => {
            socket.emit('removeRaceSession', session.sessionId);  // Emit remove session request
        });

        // Handle Edit Session
        sessionElement.querySelector('.editSessionButton').addEventListener('click', () => {
            document.getElementById('sessionName').value = session.sessionName;  // Set session name in input
            const driversList = document.getElementById('driversList');
            driversList.innerHTML = '';  // Clear the current driver list

            // Populate the form with existing drivers
            session.drivers.forEach(driver => {
                const driverEntry = document.createElement('div');
                driverEntry.classList.add('driver-entry');
                driverEntry.innerHTML = `
                    <input type="text" class="driverName" value="${driver.driver}" required>
                    <button class="removeDriverButton">Remove</button>
                `;
                driversList.appendChild(driverEntry);

                // Add remove driver functionality for the editing
                driverEntry.querySelector('.removeDriverButton').addEventListener('click', () => {
                    driversList.removeChild(driverEntry);
                });
            });

            currentSessionId = session.sessionId;  // Track which session is being edited
        });
    });
});

// Add another driver input field (Max 8 drivers)
document.getElementById('addDriverFieldButton').addEventListener('click', () => {
    const driversList = document.getElementById('driversList');
    const currentDrivers = document.querySelectorAll('.driver-entry').length;

    if (currentDrivers < 8) { // Enforce maximum of 8 drivers
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
        alert("You can only add up to 8 drivers.");
    }
});

// Add a new or update race session with drivers (Max 8 drivers and unique names)
document.getElementById('addSessionButton').addEventListener('click', () => {
    const sessionName = document.getElementById('sessionName').value;

    if (!sessionName) {
        alert("Please provide a session name.");
        return;
    }

    // Collect all driver data
    const driverElements = document.querySelectorAll('.driver-entry');
    const drivers = [];
    const driverNamesSet = new Set();  // To check for unique driver names
    let hasDuplicate = false;  // Flag to check for duplicates

    // Assign car numbers in sequential order, starting from 1
    driverElements.forEach((driverElement, index) => {
        const driverName = driverElement.querySelector('.driverName').value.trim();
        if (driverName) {
            // Check if the driver name is already added
            if (driverNamesSet.has(driverName)) {
                alert(`The driver name "${driverName}" has already been added. Please use a unique name.`);
                hasDuplicate = true; // Set duplicate flag to true
            }
            driverNamesSet.add(driverName);  // Add name to the set

            drivers.push({
                driver: driverName,
                carNumber: index + 1 // Assign car number sequentially (1 to 8)
            });
        }
    });

    // If duplicates were found, prevent the race session from being added
    if (hasDuplicate) {
        return; // Stop execution to allow the user to fix the issue
    }

    if (drivers.length === 0) {
        alert("Please add at least one driver.");
        return;
    }

    if (drivers.length > 8) {
        alert("You cannot have more than 8 drivers.");
        return;
    }

    // Check if we're editing an existing session or adding a new one
    if (currentSessionId) {
        // Update the session
        socket.emit('updateRaceSession', { sessionId: currentSessionId, sessionName: sessionName, drivers: drivers });
        currentSessionId = null; // Reset the editing sessionId
    } else {
        // Add a new race session
        socket.emit('addRaceSession', { sessionName: sessionName, drivers: drivers });
    }

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
