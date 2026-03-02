let screenShareAudioEnabled = false;

const shareScreen = async() => {
    console.log("Sharing my screen here")
    changeButtons(['blue','green','grey','grey','blue','grey','red','purple','grey']);

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

        // Sync with StreamManager
        if (typeof streamManager !== 'undefined') {
            streamManager.setScreenStream(shareStream);
        }

        // Disable share screen button, enable stop sharing button
        const shareBtn = document.getElementById('share-screen');
        const stopBtn = document.getElementById('stop-screen');

        if (shareBtn) {
            shareBtn.disabled = true;
            shareBtn.classList.add('disabled');
            shareBtn.style.display = 'none'; // Hide it completely
        }

        if (stopBtn) {
            stopBtn.style.display = 'block'; // Show stop button
            stopBtn.disabled = false;
        }

        // Add event listener for screen sharing end (browser UI stop button)
        shareStream.getVideoTracks()[0].addEventListener('ended', () => {
            console.log("Screen sharing ended event triggered (Browser UI)");
            handleScreenShareEnded();
        });

    } catch(ex) {
        console.log("Error sharing screen:", ex);
        // Re-enable button if sharing failed
        const shareBtn = document.getElementById('share-screen');
        if (shareBtn) {
            shareBtn.disabled = false;
            shareBtn.classList.remove('disabled');
            shareBtn.style.display = 'block';
        }
        alert("Failed to share screen: " + ex.message);
    }
}

// Centralized function to handle screen share ending
const handleScreenShareEnded = () => {
    // Check if we are recording
    if (typeof mediaRecorder !== 'undefined' && mediaRecorder && mediaRecorder.state === 'recording') {
        console.log("Recording is active, stopping recording automatically.");
        if (typeof stopRecording === 'function') {
            stopRecording();
            // Show toast notification
            if (typeof showToast === 'function') {
                showToast('recording-stopped-toast');
            }
        } else {
            console.error("stopRecording function not found!");
        }
    }

    // Perform cleanup
    stopScreenSharing();
}

// Stop screen sharing function (Manual stop from App UI)
const stopScreenSharing = () => {
    console.log("Stopping screen sharing...");

    // Check if we are recording and need to stop it (if called manually)
    if (typeof mediaRecorder !== 'undefined' && mediaRecorder && mediaRecorder.state === 'recording') {
        console.log("Recording is active, stopping recording automatically.");
        if (typeof stopRecording === 'function') {
            stopRecording();
            // Show toast notification
            if (typeof showToast === 'function') {
                showToast('recording-stopped-toast');
            }
        } else {
            console.error("stopRecording function not found!");
        }
    }

    if (shareStream) {
        shareStream.getTracks().forEach(track => track.stop());
        shareStream = null;
        // Sync with StreamManager
        if (typeof streamManager !== 'undefined') {
            streamManager.setScreenStream(null);
        }
    }

    // Enable share screen button, disable/hide stop sharing button
    const shareBtn = document.getElementById('share-screen');
    const stopBtn = document.getElementById('stop-screen');

    if (shareBtn) {
        shareBtn.disabled = false;
        shareBtn.classList.remove('disabled');
        shareBtn.style.display = 'block';
    }

    if (stopBtn) {
        stopBtn.style.display = 'none';
    }

    // Reset buttons when screen sharing ends
    if (stream) {
        changeButtons(['blue','green','grey','grey','green','grey','grey','purple','grey']);
    } else {
        changeButtons(['grey','grey','grey','grey','grey','grey','grey','purple','grey']);
    }

    console.log("Screen sharing stopped.");
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
