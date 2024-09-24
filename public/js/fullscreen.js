function toggleFullScreen(elementId) {
    const fullscreenButton = document.querySelector('.fullscreen-btn');
    const container = document.getElementById(elementId);
    
    if (!document.fullscreenElement) {
        container.requestFullscreen().then(() => {
            fullscreenButton.style.display = 'none';
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen().then(() => {
                fullscreenButton.style.display = 'block';
            });
        }
    }
}

// Listen for fullscreen change events to handle cases where the user exits fullscreen using the browser's built-in controls
document.addEventListener('fullscreenchange', () => {
    const fullscreenButton = document.querySelector('.fullscreen-btn');
    
    if (!document.fullscreenElement) {
        fullscreenButton.style.display = 'block';
    } else {
        fullscreenButton.style.display = 'none';
    }
});

/*
function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}
*/