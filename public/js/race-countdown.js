const socket = io();

function updateCountdownDisplay(minutes, seconds) {
    const countdownElement = document.getElementById('countdown');
    countdownElement.textContent = `${String(minutes).padStart(2, '0')} : ${String(seconds).padStart(2, '0')}`;
}

function updateSVGProgress(remainingTime, totalTime) {
    const progress = remainingTime / totalTime;
    const circle = document.querySelector('#countdownCircle svg circle:nth-child(2)');
    circle.style.strokeDasharray = `${progress} 1`;
    circle.style.stroke = `hsl(${progress * 120}, 100%, 50%)`; // Color transition from green to red
}

let countdownInterval;

function startCountdown(duration) {
    let remainingTime = duration;

    countdownInterval = setInterval(() => {
        if (remainingTime <= 0) {
            clearInterval(countdownInterval);
            document.getElementById('countdown').textContent = "End of race!";
        } else {
            const minutes = Math.floor((remainingTime % (60 * 60)) / 60);
            const seconds = Math.floor(remainingTime % 60);

            updateCountdownDisplay(minutes, seconds);
            updateSVGProgress(remainingTime, duration);

            remainingTime--;
        }
    }, 1000);
}

socket.on('startRace', () => {
    const duration = 10 * 60; // 10 minutes in seconds
    startCountdown(duration);
});