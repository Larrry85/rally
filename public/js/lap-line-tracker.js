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
        socket.emit('getRaceSessions'); // Request current race sessions
    } else {
        messageContainer.textContent = 'Invalid access key'
    }
});
