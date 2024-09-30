// Function to toggle fullscreen mode for a specific element
function toggleFullScreen(elementId) {
    const fullscreenButton = document.querySelector('.fullscreen-btn'); // Select the fullscreen button element
    const container = document.getElementById(elementId); // Get the container element by its ID
    
    // Check if the document is currently not in fullscreen mode
    if (!document.fullscreenElement) {
        // Request fullscreen mode for the container element
        container.requestFullscreen().then(() => {
            fullscreenButton.style.display = 'none'; // Hide the fullscreen button when in fullscreen mode
        });
    } else {
        // Check if the document can exit fullscreen mode
        if (document.exitFullscreen) {
            // Exit fullscreen mode
            document.exitFullscreen().then(() => {
                fullscreenButton.style.display = 'block'; // Show the fullscreen button when exiting fullscreen mode
            });
        }
    }
}

// Listen for fullscreen change events to handle cases where the user exits fullscreen using the browser's built-in controls
document.addEventListener('fullscreenchange', () => {
    const fullscreenButton = document.querySelector('.fullscreen-btn'); // Select the fullscreen button element
    
    // Check if the document is currently not in fullscreen mode
    if (!document.fullscreenElement) {
        fullscreenButton.style.display = 'block'; // Show the fullscreen button when not in fullscreen mode
    } else {
        fullscreenButton.style.display = 'none'; // Hide the fullscreen button when in fullscreen mode
    }
});