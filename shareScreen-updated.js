let screenShareAudioEnabled = false;

const shareScreen = async() => {
    console.log("Sharing my screen here")
    changeButtons(['blue','green','grey','grey','blue','grey','red','purple']);
    
    const options = {
        video: {
            cursor: 'always'
        },
        audio: screenShareAudioEnabled,
        surfaceSwitching: 'include',
        cursorSwitching: true
    }
    
    try {
        shareStream = await navigator.mediaDevices.getDisplayMedia(options);
        console.log("Screen sharing started with audio:", screenShareAudioEnabled);
        
        // Show stop sharing button, hide share screen button
        document.getElementById('share-screen').style.display = 'none';
        document.getElementById('stop-screen').style.display = 'block';
        
        // Add event listener for screen sharing end
        shareStream.getVideoTracks()[0].addEventListener('ended', () => {
            console.log("Screen sharing ended");
            stopScreenSharing();
        });
        
    } catch(ex) {
        console.log("Error sharing screen:", ex);
        alert("Failed to share screen: " + ex.message);
    }
}

// Stop screen sharing function
const stopScreenSharing = () => {
    if (shareStream) {
        shareStream.getTracks().forEach(track => track.stop());
        shareStream = null;
    }
    
    // Show share screen button, hide stop sharing button
    document.getElementById('share-screen').style.display = 'block';
    document.getElementById('stop-screen').style.display = 'none';
    
    // Reset buttons when screen sharing ends
    if (stream) {
        changeButtons(['blue','green','grey','grey','grey','grey','grey','purple']);
    } else {
        changeButtons(['grey','grey','grey','grey','grey','grey','grey','purple']);
    }
    
    console.log("Screen sharing stopped manually");
}

// Toggle screen share audio
const toggleScreenShareAudio = () => {
    screenShareAudioEnabled = !screenShareAudioEnabled;
    console.log("Screen share audio toggled:", screenShareAudioEnabled);
    
    // Update button to show current state
    const audioToggleBtn = document.getElementById('screen-audio-toggle');
    if (audioToggleBtn) {
        if (screenShareAudioEnabled) {
            audioToggleBtn.innerHTML = '<i class="fas fa-microphone"></i> Audio On';
            audioToggleBtn.className = 'btn btn-sm btn-success mb-1';
        } else {
            audioToggleBtn.innerHTML = '<i class="fas fa-microphone-slash"></i> Audio Off';
            audioToggleBtn.className = 'btn btn-sm btn-secondary mb-1';
        }
    }
    
    // If currently sharing screen, restart with new audio setting
    if (shareStream) {
        console.log("Restarting screen share with new audio setting");
        // Stop current screen share
        shareStream.getTracks().forEach(track => track.stop());
        shareStream = null;
        
        // Start screen share again with new audio setting
        setTimeout(() => {
            shareScreen();
        }, 100);
    }
};
