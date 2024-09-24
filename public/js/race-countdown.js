const socket = io();

// Display countdown timer
socket.on('raceStarted', ({ startTime }) => {
    const countdownDiv = document.getElementById('countdown');
    const interval = setInterval(() => {
        const now = Date.now();
        const distance = startTime - now;

        if (distance < 0) {
            clearInterval(interval);
            countdownDiv.innerHTML = "Finish!";
        } else {
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            countdownDiv.innerHTML = `${minutes} : ${seconds}`;
        }
    }, 1000);
});