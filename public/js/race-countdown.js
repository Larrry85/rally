const socket = io(); // Initialize Socket.IO client

// Function to update the countdown display
function updateCountdownDisplay(minutes, seconds) {
    const countdownElement = document.getElementById('countdown'); // Get the countdown element
    // Format and set the countdown text
    countdownElement.textContent = `${String(minutes).padStart(2, '0')} : ${String(seconds).padStart(2, '0')}`;
}

/*
SVG stands for Scalable Vector Graphics. It is an XML-based markup language for describing two-dimensional vector graphics.
 SVG images and their behaviors are defined in XML text files, which means they can be searched, indexed, scripted, and 
compressed. SVG is used to create graphics that can be scaled to different sizes without losing quality, making it ideal
 for responsive web design.
In this code, SVG is used to create a progress circle that visually represents the countdown timer. The function
 updates the appearance of this SVG circle based on the remaining time of the countdown.*/

// Function to update the SVG progress circle
function updateSVGProgress(remainingTime, totalTime) {
    const progress = remainingTime / totalTime; // Calculate progress as a fraction
    const circle = document.querySelector('#countdownCircle svg circle:nth-child(2)'); // Get the SVG circle element
    circle.style.strokeDasharray = `${progress} 1`; // Set the stroke dash array based on progress
    circle.style.stroke = `hsl(${progress * 120}, 100%, 50%)`; // Set the stroke color based on progress (green to red)
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
        } else {
            const minutes = Math.floor((remainingTime % (60 * 60)) / 60); // Calculate minutes
            const seconds = Math.floor(remainingTime % 60); // Calculate seconds

            updateCountdownDisplay(minutes, seconds); // Update the countdown display
            updateSVGProgress(remainingTime, duration); // Update the SVG progress circle

            remainingTime--; // Decrement the remaining time
        }
    }, 1000); // Interval set to 1 second
}

// Listen for the 'startRace' event from the server
socket.on('startRace', ({ duration }) => {
    startCountdown(duration / 1000); // Start the countdown, convert milliseconds to seconds
});
