const videoEl = document.querySelector('#my-video');

let stream = null;
let shareStream = null;
const constraints = {
    video:true,
    audio:true
}

// Update status indicators
const updateStatusIndicators = (hasCamera, hasMic) => {
    const cameraStatus = document.getElementById('camera-status');
    const micStatus = document.getElementById('mic-status');
    
    if (hasCamera) {
        cameraStatus.className = 'badge bg-success me-2';
        cameraStatus.innerHTML = '<i class="fas fa-video"></i> Camera On';
    } else {
        cameraStatus.className = 'badge bg-danger me-2';
        cameraStatus.innerHTML = '<i class="fas fa-video-slash"></i> Camera Off';
    }
    
    if (hasMic) {
        micStatus.className = 'badge bg-success';
        micStatus.innerHTML = '<i class="fas fa-microphone"></i> Mic On';
    } else {
        micStatus.className = 'badge bg-danger';
        micStatus.innerHTML = '<i class="fas fa-microphone-slash"></i> Mic Off';
    }
};

// Update video placeholder visibility
const updateVideoPlaceholder = (showVideo) => {
    const placeholder = document.getElementById('my-video-placeholder');
    if (placeholder) {
        placeholder.style.display = showVideo ? 'none' : 'flex';
    }
};
const getMicAndCamera = async(e)=>{
try{
    // Try to get camera with optional audio fallback
    stream = await requestCameraWithOptionalAudio();
    getDevices();
    
    // Update status based on what we actually got
    updateStatusFromTracks(stream);
    
    console.log("Media access completed successfully");
    console.log("Stream tracks:", stream.getTracks().length);
    console.log("Video tracks:", stream.getVideoTracks().length);
    console.log("Audio tracks:", stream.getAudioTracks().length);
    
    changeButtons(['blue','green','grey','grey','grey','grey','grey','purple']);

}catch(ex){
    // Handle different types of permission errors
    console.error("Media access error:", ex);
    
    if (ex.name === 'NotAllowedError') {
        // User denied permission - try individual requests to see what's available
        let hasCamera = false;
        let hasMic = false;
        
        // Try camera only
        try {
            await requestCameraOnly();
            hasCamera = true;
            console.log("Camera is available but was denied in combined request");
        } catch (cameraError) {
            console.log("Camera completely denied or unavailable");
        }
        
        // Try microphone only
        try {
            await requestMicrophoneOnly();
            hasMic = true;
            console.log("Microphone is available but was denied in combined request");
        } catch (micError) {
            console.log("Microphone completely denied or unavailable");
        }
        
        // Update status based on what's actually available
        updateStatusIndicators(hasCamera, hasMic);
        
        // Show appropriate message
        if (!hasCamera && !hasMic) {
            alert("Both camera and microphone permissions are required for full functionality.");
        } else if (!hasCamera) {
            alert("Camera permission denied. You can still use audio-only features.");
        } else if (!hasMic) {
            alert("Microphone permission denied. You can still use video-only features.");
        }
        
    } else if (ex.name === 'NotFoundError') {
        // No camera/microphone found
        console.log("No camera or microphone found");
        updateStatusIndicators(false, false);
        alert("No camera or microphone found. Please connect a camera and microphone.");
    } else if (ex.name === 'NotReadableError') {
        // Camera/microphone already in use
        console.log("Camera or microphone already in use");
        updateStatusIndicators(false, false);
        alert("Camera or microphone is already in use by another application.");
    } else {
        // Other errors
        console.log("Unknown media error:", ex);
        updateStatusIndicators(false, false);
        alert("Failed to access camera or microphone: " + ex.message);
    }
    
    // Set buttons to error state only if completely failed
    if (!stream) {
        changeButtons(['red','red','red','red','red','red','red','red']);
    }
}
};

// Request only camera access
const requestCameraOnly = async () => {
    try {
        const cameraStream = await navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: false 
        });
        console.log("Camera access granted");
        return cameraStream;
    } catch (error) {
        console.error("Camera access denied:", error);
        throw error;
    }
};

// Request only microphone access with optimization
const requestMicrophoneOnly = async () => {
    try {
        const constraints = {
            video: false, 
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
                sampleRate: 44100,
                channelCount: 1,
                googAutoGainControl: true,
                googNoiseSuppression: true,
                googEchoCancellation: true,
                googHighpassFilter: true
            }
        };
        
        const micStream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log("Optimized microphone access granted");
        return micStream;
    } catch (error) {
        console.error("Microphone access denied:", error);
        throw error;
    }
};

// Request camera with microphone fallback
const requestCameraWithOptionalAudio = async () => {
    try {
        // Try to get both first
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: true 
        });
        console.log("Camera and microphone access granted");
        return stream;
    } catch (error) {
        console.log("Both permissions failed, trying camera only...");
        try {
            const cameraStream = await requestCameraOnly();
            console.log("Camera access granted (microphone denied)");
            return cameraStream;
        } catch (cameraError) {
            console.error("Camera access also failed:", cameraError);
            throw cameraError;
        }
    }
};

// Update audio quality indicator
const updateAudioQualityIndicator = (hasOptimizedAudio) => {
    const audioQualityEl = document.getElementById('audio-quality');
    const audioQualityText = document.getElementById('audio-quality-text');
    
    if (audioQualityEl && audioQualityText) {
        if (hasOptimizedAudio) {
            audioQualityEl.style.display = 'inline-block';
            audioQualityEl.className = 'badge bg-success me-2';
            audioQualityText.textContent = 'HD Audio';
        } else {
            audioQualityEl.style.display = 'inline-block';
            audioQualityEl.className = 'badge bg-warning me-2';
            audioQualityText.textContent = 'Standard Audio';
        }
    }
};

// Update status indicators based on available tracks
const updateStatusFromTracks = (stream) => {
    if (!stream) {
        updateStatusIndicators(false, false);
        updateAudioQualityIndicator(false);
        return;
    }
    
    const videoTracks = stream.getVideoTracks();
    const audioTracks = stream.getAudioTracks();
    
    const hasCamera = videoTracks.length > 0 && videoTracks[0].enabled;
    const hasMic = audioTracks.length > 0 && audioTracks[0].enabled;
    
    updateStatusIndicators(hasCamera, hasMic);
    
    // Check if audio has optimization features
    if (hasMic && audioTracks[0].getSettings) {
        const settings = audioTracks[0].getSettings();
        const hasOptimization = settings.echoCancellation || settings.noiseSuppression || settings.autoGainControl;
        updateAudioQualityIndicator(hasOptimization);
    } else {
        updateAudioQualityIndicator(hasMic);
    }
};

const showMyFeed = e =>{
    if(!stream){
    alert("No feed allowed");
    return;
    }
    console.log("showMyFeed is working")
    videoEl.srcObject = stream;
    const tracks = stream.getTracks();
    console.log(tracks);
    changeButtons(['blue','green','green','green','green','grey','grey','purple']);
    // Hide the placeholder when video is active
    updateVideoPlaceholder(true);
};

const stopVideo = e => {
    if(!stream){
    alert("No current feed");
    return;
    }
    console.log("stopVideo is working");
    const tracks = stream.getTracks();
    tracks.forEach(
//    track => console.log(track)
    track => track.stop()
    );
    changeButtons(['grey','grey','grey','grey','grey','grey','grey','purple']);
    // Update status indicators to show camera and mic are off
    updateStatusIndicators(false, false);
    // Show the placeholder when video is stopped
    updateVideoPlaceholder(false);
//    videoEl.srcObject = null;

};
document.querySelector('#share').addEventListener('click',e =>getMicAndCamera(e));
document.querySelector('#show-video').addEventListener('click',e =>showMyFeed(e));
document.querySelector('#stop-video').addEventListener('click',e =>stopVideo(e));
document.querySelector('#change-size').addEventListener('click',e =>changeVideoSize(e));

// Test button clicks first
document.querySelector('#start-record')?.addEventListener('click', () => {
    console.log("START RECORDING BUTTON CLICKED - SIMPLE TEST");
    console.log("Now calling actual startRecording function...");
    
    if (typeof startRecording === 'function') {
        startRecording();
    } else {
        console.error("startRecording function not available!");
        alert("Recording function not available!");
    }
});

// Check if recording functions exist before adding event listeners
console.log("=== AARUSH SCREEN RECORDER DEBUG ===");
console.log("Checking if recording functions are available...");
console.log("startRecording exists:", typeof startRecording);
console.log("stopRecording exists:", typeof stopRecording);
console.log("playRecording exists:", typeof playRecording);
console.log("shareScreen exists:", typeof shareScreen);
console.log("toggleScreenShareAudio exists:", typeof toggleScreenShareAudio);

// Test button elements
console.log("Checking button elements...");
console.log("Start record button:", document.querySelector('#start-record'));
console.log("Stop record button:", document.querySelector('#stop-record'));
console.log("Play record button:", document.querySelector('#play-record'));
console.log("Share screen button:", document.querySelector('#share-screen'));
console.log("Screen audio toggle:", document.querySelector('#screen-audio-toggle'));

if (typeof startRecording === 'function') {
    document.querySelector('#start-record').addEventListener('click',() => {
        console.log("Start recording button clicked");
        startRecording();
    });
} else {
    console.error("startRecording function not found!");
}

if (typeof stopRecording === 'function') {
    document.querySelector('#stop-record').addEventListener('click',() => {
        console.log("Stop recording button clicked");
        stopRecording();
    });
} else {
    console.error("stopRecording function not found!");
    // Add fallback listener
    document.querySelector('#stop-record')?.addEventListener('click', () => {
        console.log("STOP RECORDING BUTTON CLICKED - FALLBACK");
        if (typeof stopRecording === 'function') {
            stopRecording();
        } else {
            alert("Stop recording function not available!");
        }
    });
}

if (typeof playRecording === 'function') {
    document.querySelector('#play-record').addEventListener('click',() => {
        console.log("Play recording button clicked");
        playRecording();
    });
} else {
    console.error("playRecording function not found!");
    // Add fallback listener
    document.querySelector('#play-record')?.addEventListener('click', () => {
        console.log("PLAY RECORDING BUTTON CLICKED - FALLBACK");
        if (typeof playRecording === 'function') {
            playRecording();
        } else {
            alert("Play recording function not available!");
        }
    });
}

if (typeof saveRecording === 'function') {
    document.querySelector('#save-record').addEventListener('click',() => {
        console.log("Save recording button clicked");
        saveRecording();
    });
} else {
    console.error("saveRecording function not found!");
    // Add fallback listener
    document.querySelector('#save-record')?.addEventListener('click', () => {
        console.log("SAVE RECORDING BUTTON CLICKED - FALLBACK");
        if (typeof saveRecording === 'function') {
            saveRecording();
        } else {
            alert("Save recording function not available!");
        }
    });
}

document.querySelector('#share-screen').addEventListener('click',e =>shareScreen(e));
document.querySelector('#stop-screen').addEventListener('click',e =>stopScreenSharing(e));
document.querySelector('#screen-audio-toggle').addEventListener('click',e =>toggleScreenShareAudio(e));
document.querySelector('#audio-input').addEventListener('change',e =>changeAudioInput(e));
document.querySelector('#audio-output').addEventListener('change',e =>changeAudioOutput(e));
document.querySelector('#video-input').addEventListener('change',e =>changeVideoInput(e));

