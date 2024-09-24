const socket = io();

// Request current race flags
socket.emit('getRaceFlags');

// Display race flags
socket.on('raceFlags', (flag) => {
    updateFlag(flag);
});

// Update race flags in real-time
socket.on('updateFlags', (flag) => {
    updateFlag(flag);
});

function updateFlag(flag) {
    const flagsDiv = document.getElementById('flags');
    let flagImage = 'redflag.png'; // Default image

    if (flag === 'Safe') {
        flagImage = 'greenflag.png';
    } else if (flag === 'Hazard') {
        flagImage = 'yellowflag.png';
    } else if (flag === 'Danger') {
        flagImage = 'redflag.png';
    } else if (flag === 'Finish') {
        flagImage = 'finflag.png';
    }

    flagsDiv.innerHTML = `<div class="flag"><img src="image/${flagImage}" alt="${flag} Flag" class="flag-image"/></div>`;
}