let mediaRecorder;
let recordedBlobs;

const startRecording = () => {
    if(!stream && !shareStream){
    alert("No current feed");
    return;
    }
    
    // Check if screen sharing is active
    const isScreenSharing = !!shareStream;
    
    if (isScreenSharing) {
        // Show 3-second countdown overlay for screen sharing
        console.log("Starting recording in 3 seconds...");
        changeButtons(['blue','green','grey','grey','orange','red','grey','purple']);
        
        // Show modern countdown overlay
        const overlay = document.getElementById('countdown-overlay');
        const countdownNumber = document.getElementById('overlay-countdown-number');
        const progressRing = document.getElementById('countdown-ring');
        
        overlay.style.display = 'flex';
        countdownNumber.textContent = '3';
        progressRing.style.strokeDashoffset = '0';
        
        let countdown = 3;
        const circumference = 2 * Math.PI * 90; // 565.48
        
        const countdownInterval = setInterval(() => {
            console.log(`Recording starts in ${countdown}...`);
            countdown--;
            countdownNumber.textContent = countdown;
            
            // Update progress ring
            const offset = circumference - (countdown / 3) * circumference;
            progressRing.style.strokeDashoffset = offset;
            
            // Re-trigger animation for each number
            countdownNumber.style.animation = 'none';
            setTimeout(() => {
                countdownNumber.style.animation = 'countdownPulse 1s ease-in-out';
            }, 10);
            
            if (countdown === 0) {
                clearInterval(countdownInterval);
                overlay.style.display = 'none';
                actuallyStartRecording();
            }
        }, 1000);
        
    } else {
        // Start immediately for regular camera recording
        actuallyStartRecording();
    }
};

const actuallyStartRecording = () => {
    console.log("Attempting to start recording...");
    console.log("Current stream:", stream);
    console.log("Share stream:", shareStream);

    // Determine which stream to record
    const streamToRecord = shareStream || stream;
    
    if (!streamToRecord) {
        console.error("No stream available for recording");
        alert("No stream available for recording");
        changeButtons(['blue','green','grey','grey','grey','grey','grey','purple']);
        return;
    }
    
    // Check if stream has tracks
    const tracks = streamToRecord.getTracks();
    if (tracks.length === 0) {
        console.error("Stream has no tracks");
        alert("Stream has no audio/video tracks to record");
        changeButtons(['blue','green','grey','grey','grey','grey','grey','purple']);
        return;
    }
    
    console.log("Recording stream with tracks:", tracks.length);
    console.log("Track details:", tracks.map(t => ({ kind: t.kind, enabled: t.enabled, state: t.readyState })));
    
    try {
        // Stop any existing recorder
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }
        
        // Create new MediaRecorder with proper MIME type
        let options = {};
        
        // Try to find a supported MIME type
        const mimeTypes = [
            'video/webm;codecs=vp9,opus',
            'video/webm;codecs=vp8,opus',
            'video/webm;codecs=h264,opus',
            'video/webm',
            'video/mp4'
        ];
        
        let supportedMimeType = null;
        for (const mimeType of mimeTypes) {
            if (MediaRecorder.isTypeSupported(mimeType)) {
                supportedMimeType = mimeType;
                console.log("Using MIME type:", mimeType);
                break;
            }
        }
        
        if (supportedMimeType) {
            options.mimeType = supportedMimeType;
        }
        
        mediaRecorder = new MediaRecorder(streamToRecord, options);
        recordedBlobs = [];
        
        mediaRecorder.ondataavailable = event => {
            console.log("Data available:", event.data.size, "bytes");
            if (event.data && event.data.size > 0) {
                recordedBlobs.push(event.data);
            }
        };
        
        mediaRecorder.onstart = () => {
            console.log("MediaRecorder started successfully");
            changeButtons(['blue','green','grey','grey','green','red','grey','purple']);
        };
        
        mediaRecorder.onstop = () => {
            console.log("MediaRecorder stopped");
            changeButtons(['blue','green','grey','grey','blue','purple','red','grey']);
        };
        
        mediaRecorder.onerror = (event) => {
            console.error("MediaRecorder error:", event);
            console.error("Error details:", event.error);
            alert("Recording error: " + (event.error?.message || "Unknown error"));
            changeButtons(['blue','green','grey','grey','grey','grey','grey','purple']);
        };
        
        // Start recording
        mediaRecorder.start();
        console.log("MediaRecorder.start() called successfully");
        console.log("MediaRecorder state:", mediaRecorder.state);
        
    } catch (error) {
        console.error("Failed to start MediaRecorder:", error);
        console.error("Error details:", error.name, error.message);
        alert("Failed to start recording: " + error.message);
        changeButtons(['blue','green','grey','grey','grey','grey','grey','purple']);
    }
};

const stopRecording = () => {
    if(!mediaRecorder){
        alert("Please record before stopping");
        return;
    }
    console.log("Stopped Recording");
    changeButtons(['blue','green','grey','grey','blue','purple','red','grey'])
    mediaRecorder.stop();

}

const playRecording = () => {
    if(!recordedBlobs){
    alert("No recording saved");
    return;
    }
    console.log("Playing Recording");
    changeButtons(['blue','green','red','grey','green','green','red','grey'])
    const superBuffer = new Blob(recordedBlobs, { type: 'video/webm' });
    const recordedVideoEl = document.querySelector('#other-video');
    recordedVideoEl.src = URL.createObjectURL(superBuffer);
    recordedVideoEl.controls = true;
    recordedVideoEl.play();
    changeButtons(['blue','green','grey','grey','blue','grey','red','grey'])


}
