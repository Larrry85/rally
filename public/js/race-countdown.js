const socket = io(); // Initialize Socket.IO client

// Function to update the countdown display
function updateCountdownDisplay(minutes, seconds) {
    const countdownElement = document.getElementById('countdown'); // Get the countdown element
    countdownElement.textContent = `${String(minutes).padStart(2, '0')} : ${String(seconds).padStart(2, '0')}`;
}

// Function to update the SVG progress circle
function updateSVGProgress(remainingTime, totalTime) {
    const progress = remainingTime / totalTime; // Calculate progress as a fraction
    const circle = document.querySelector('#countdownCircle svg circle:nth-child(2)'); // Get the SVG circle element
    circle.style.strokeDasharray = `${progress} 1`; // Set the stroke dash array based on progress
    circle.style.stroke = `hsl(${progress * 120}, 100%, 50%)`; // Set the stroke color based on progress (green to red)
}

// Function to reset the countdown display to full time
function resetCountdownDisplay(fullMinutes, fullSeconds) {
    const countdownElement = document.getElementById('countdown'); // Get the countdown element
    countdownElement.textContent = `${String(fullMinutes).padStart(2, '0')} : ${String(fullSeconds).padStart(2, '0')}`;
}

// Function to reset the SVG progress circle to full
function resetSVGProgress() {
    const circle = document.querySelector('#countdownCircle svg circle:nth-child(2)'); // Get the SVG circle element
    circle.style.strokeDasharray = `1 0`; // Set the stroke dash array to full
    circle.style.stroke = `hsl(120, 100%, 50%)`; // Set the stroke color to green
}

let countdownInterval; // Variable to store the countdown interval

// Function to start the countdown
function startCountdown(duration) {
    let remainingTime = duration; // Initialize remaining time with the duration

    // Set an interval to update the countdown every second
    countdownInterval = setInterval(() => {
        if (remainingTime <= 0) { // Check if the countdown has finished
            clearInterval(countdownInterval); // Clear the interval
            document.getElementById('countdown').textContent = "End of race!"; // Display end of race message
            socket.emit("endRace"); // Emit end race event to the server?????????????????????????????????????????????????????????
            setTimeout(() => {
                document.getElementById('countdown').textContent = "00 : 00"; // Revert to default display
            }, 3000); // Show "race ended" message for 3 seconds
        } else {
            const minutes = Math.floor((remainingTime % (60 * 60)) / 60); // Calculate minutes
            const seconds = Math.floor(remainingTime % 60); // Calculate seconds

            updateCountdownDisplay(minutes, seconds); // Update the countdown display
            updateSVGProgress(remainingTime, duration); // Update the SVG progress circle

            remainingTime--; // Decrement the remaining time
        }
    }, 1000); // Interval set to 1 second
}

// Listen for the 'startSession' event from the server
socket.on('startSession', ({ fullMinutes, fullSeconds }) => {
    resetCountdownDisplay(fullMinutes, fullSeconds); // Reset the countdown display to full time
    resetSVGProgress(); // Reset the SVG progress circle to full
});

// Listen for the 'startRace' event from the server
socket.on('startRace', ({ duration }) => {
    // Delay the countdown by 6 seconds
    document.getElementById('countdown').textContent = "Race is starting.";
    
    setTimeout(() => {
        startCountdown(duration / 1000); // Start the countdown after 6 seconds, convert milliseconds to seconds
    }, 6000); // Delay of 6 seconds
});

// Listen for the 'endRace' event from the server
socket.on('raceFinished', () => {
    clearInterval(countdownInterval); // Clear the interval
    document.getElementById('countdown').textContent = "End of race!"; // Display end of race message
    setTimeout(() => {
        document.getElementById('countdown').textContent = "00 : 00"; // Revert to default display
    }, 3000); // Show "race ended" message for 3 seconds
});