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
    console.log("Started Recording");
    changeButtons(['blue','green','grey','grey','green','red','grey','purple']);
    recordedBlobs = [];
    
    // Determine which stream to record
    const streamToRecord = shareStream || stream;
    if (!streamToRecord) {
        console.error("No stream available for recording");
        alert("No stream available for recording");
        return;
    }
    
    console.log("Recording stream:", streamToRecord);
    mediaRecorder = new MediaRecorder(streamToRecord);
    
    mediaRecorder.ondataavailable = event =>{
        console.log("Data is available for the media recorder!");
        recordedBlobs.push(event.data);
    };
    
    mediaRecorder.onstart = () => {
        console.log("MediaRecorder started successfully");
    };
    
    mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        alert("Recording failed to start");
    };
    
    try {
        mediaRecorder.start();
        console.log("MediaRecorder.start() called");
    } catch (error) {
        console.error("Failed to start MediaRecorder:", error);
        alert("Failed to start recording: " + error.message);
    }
}

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
