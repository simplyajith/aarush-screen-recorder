let mediaRecorder;
let recordedBlobs;

// Use function declarations for automatic hoisting (accessible globally)
console.log("screenRecorder-fixed.js loaded - functions should be available");

function startRecording() {
    console.log("=== START RECORDING CALLED ===");
    console.log("Stream available:", !!stream);
    console.log("Share stream available:", !!shareStream);
    
    if(!stream && !shareStream){
        console.log("ERROR: No current feed available");
        alert("No current feed");
        return;
    }
    
    // Check if screen sharing is active
    const isScreenSharing = !!shareStream;
    console.log("Is screen sharing active:", isScreenSharing);
    
    // Disable start recording button immediately
    const startRecordBtn = document.getElementById('start-record');
    if (startRecordBtn) {
        startRecordBtn.disabled = true;
        startRecordBtn.classList.add('disabled');
    }

    if (isScreenSharing) {
        // Show 3-second countdown overlay for screen sharing
        console.log("Starting recording in 3 seconds...");
        changeButtons(['blue','green','grey','grey','orange','red','grey','purple']);
        
        // Show modern countdown overlay
        const overlay = document.getElementById('countdown-overlay');
        const countdownNumber = document.getElementById('overlay-countdown-number');
        const progressRing = document.getElementById('countdown-ring');
        
        console.log("Showing countdown overlay...");
        overlay.style.display = 'flex';
        countdownNumber.textContent = '3';
        progressRing.style.strokeDashoffset = '0';
        
        let countdown = 3;
        const circumference = 2 * Math.PI * 90; // 565.48
        
        console.log("Starting countdown from 3...");
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
                console.log("Countdown finished, calling actuallyStartRecording");
                clearInterval(countdownInterval);
                overlay.style.display = 'none';
                actuallyStartRecording();
            }
        }, 1000);
        
    } else {
        // Start immediately for regular camera recording
        console.log("Starting camera recording immediately...");
        actuallyStartRecording();
    }
}

function actuallyStartRecording() {
    console.log("Attempting to start recording...");
    console.log("Current stream:", stream);
    console.log("Share stream:", shareStream);

    // Determine which stream to record
    const streamToRecord = shareStream || stream;
    
    if (!streamToRecord) {
        console.error("No stream available for recording");
        alert("No stream available for recording. Please start camera or screen sharing first.");
        changeButtons(['blue','green','grey','grey','grey','grey','grey','purple']);
        // Re-enable start button on error
        const startRecordBtn = document.getElementById('start-record');
        if (startRecordBtn) {
            startRecordBtn.disabled = false;
            startRecordBtn.classList.remove('disabled');
        }
        return;
    }
    
    // Check if stream has tracks
    const tracks = streamToRecord.getTracks();
    if (tracks.length === 0) {
        console.error("Stream has no tracks");
        alert("Stream has no audio/video tracks to record");
        changeButtons(['blue','green','grey','grey','grey','grey','grey','purple']);
        // Re-enable start button on error
        const startRecordBtn = document.getElementById('start-record');
        if (startRecordBtn) {
            startRecordBtn.disabled = false;
            startRecordBtn.classList.remove('disabled');
        }
        return;
    }
    
    console.log("Recording stream with tracks:", tracks.length);
    console.log("Track details:", tracks.map(t => ({ kind: t.kind, enabled: t.enabled, state: t.readyState })));
    
    // Show PIP camera overlay if recording screen sharing with camera
    if (shareStream && stream) {
        showPipDuringScreenRecording();
    }
    
    try {
        // Stop any existing recorder
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }
        
        // Create mixed stream for recording
        let recordingStream = streamToRecord;
        
        // If we have both screen share and camera, mix the audio
        if (shareStream && stream) {
            recordingStream = createMixedStream(shareStream, stream);
        }
        
        // Create new MediaRecorder with proper MIME type
        let options = {};
        
        // Try to find a supported MIME type with audio
        const mimeTypes = [
            'video/webm;codecs=vp9,opus',
            'video/webm;codecs=vp8,opus',
            'video/webm;codecs=h264,opus',
            'video/webm;codecs=vp8',
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
        
        mediaRecorder = new MediaRecorder(recordingStream, options);
        recordedBlobs = [];
        
        mediaRecorder.ondataavailable = event => {
            console.log("Data available:", event.data.size, "bytes");
            if (event.data && event.data.size > 0) {
                recordedBlobs.push(event.data);
            }
        };
        
        mediaRecorder.onstart = () => {
            console.log("MediaRecorder started successfully");
            console.log("Recording stream tracks:", recordingStream.getTracks().length);
            console.log("Audio tracks:", recordingStream.getAudioTracks().length);
            console.log("Video tracks:", recordingStream.getVideoTracks().length);
            
            // Update user about what's being recorded
            const audioTracks = recordingStream.getAudioTracks();
            const videoTracks = recordingStream.getVideoTracks();
            
            if (audioTracks.length === 0 && videoTracks.length > 0) {
                console.log("Recording video only (no audio available)");
            } else if (audioTracks.length > 0 && videoTracks.length === 0) {
                console.log("Recording audio only (no video available)");
            } else {
                console.log("Recording video and audio");
            }
            
            changeButtons(['blue','green','grey','grey','green','red','grey','purple']);
        };
        
        mediaRecorder.onstop = () => {
            console.log("MediaRecorder stopped");
            changeButtons(['blue','green','grey','grey','blue','purple','red','grey']);
            // Hide PIP overlay when recording stops
            hidePipAfterRecording();

            // Re-enable start button when recording stops
            const startRecordBtn = document.getElementById('start-record');
            if (startRecordBtn) {
                startRecordBtn.disabled = false;
                startRecordBtn.classList.remove('disabled');
            }
        };
        
        mediaRecorder.onerror = (event) => {
            console.error("MediaRecorder error:", event);
            console.error("Error details:", event.error);
            alert("Recording error: " + (event.error?.message || "Unknown error"));
            changeButtons(['blue','green','grey','grey','grey','grey','grey','purple']);
            // Hide PIP overlay on error
            hidePipAfterRecording();

            // Re-enable start button on error
            const startRecordBtn = document.getElementById('start-record');
            if (startRecordBtn) {
                startRecordBtn.disabled = false;
                startRecordBtn.classList.remove('disabled');
            }
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
        // Hide PIP overlay on error
        hidePipAfterRecording();

        // Re-enable start button on error
        const startRecordBtn = document.getElementById('start-record');
        if (startRecordBtn) {
            startRecordBtn.disabled = false;
            startRecordBtn.classList.remove('disabled');
        }
    }
};

// Create a mixed stream that combines video from screen share and audio from both sources
const createMixedStream = (screenStream, cameraStream) => {
    console.log("Creating mixed stream for recording with echo cancellation");
    
    // Create a new stream
    const mixedStream = new MediaStream();
    
    // Add video tracks from screen share
    const screenVideoTracks = screenStream.getVideoTracks();
    screenVideoTracks.forEach(track => {
        console.log("Adding screen video track:", track.kind);
        mixedStream.addTrack(track);
    });
    
    // Process audio tracks with echo cancellation
    const screenAudioTracks = screenStream.getAudioTracks();
    const cameraAudioTracks = cameraStream.getAudioTracks();
    
    // Priority system for audio sources
    if (screenAudioTracks.length > 0 && screenShareAudioEnabled) {
        // Screen audio is enabled and available - use it primarily
        console.log("Using screen audio as primary source");
        screenAudioTracks.forEach(track => {
            console.log("Adding screen audio track with echo cancellation");
            mixedStream.addTrack(track);
        });
        
        // Add camera audio only if it has different constraints (for narration)
        if (cameraAudioTracks.length > 0) {
            console.log("Camera audio available but screen audio is primary");
            // Don't add camera audio to prevent echo when screen audio is active
        }
        
    } else if (cameraAudioTracks.length > 0) {
        // Only camera audio available - optimize it
        console.log("Using camera audio with noise suppression");
        cameraAudioTracks.forEach(track => {
            console.log("Adding optimized camera audio track");
            mixedStream.addTrack(track);
        });
    }
    
    // If no audio tracks available, try to get optimized microphone
    if (screenAudioTracks.length === 0 && cameraAudioTracks.length === 0) {
        console.log("No audio tracks available, requesting optimized microphone");
        requestOptimizedMicrophone()
            .then(micStream => {
                const micTracks = micStream.getAudioTracks();
                micTracks.forEach(track => {
                    console.log("Adding optimized microphone audio track");
                    mixedStream.addTrack(track);
                });
                console.log("Optimized microphone added to mixed stream");
            })
            .catch(error => {
                console.warn("Could not get optimized microphone:", error);
            });
    }
    
    console.log("Mixed stream created with tracks:", mixedStream.getTracks().length);
    console.log("Mixed stream audio tracks:", mixedStream.getAudioTracks().length);
    console.log("Mixed stream video tracks:", mixedStream.getVideoTracks().length);
    
    return mixedStream;
};

// Request optimized microphone with echo cancellation and noise suppression
const requestOptimizedMicrophone = async () => {
    try {
        const constraints = {
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
                sampleRate: 44100,
                channelCount: 1, // Mono for better clarity
                latency: 0.01, // Low latency
                googAutoGainControl: true,
                googNoiseSuppression: true,
                googEchoCancellation: true,
                googHighpassFilter: true,
                googAudioMirroring: false
            },
            video: false
        };
        
        console.log("Requesting optimized microphone with constraints:", constraints);
        const micStream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log("Optimized microphone access granted");
        return micStream;
        
    } catch (error) {
        console.warn("Optimized microphone failed, trying basic microphone:", error);
        
        // Fallback to basic microphone
        const basicConstraints = {
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            },
            video: false
        };
        
        return await navigator.mediaDevices.getUserMedia(basicConstraints);
    }
};

// Update the main camera request to use optimized audio
// Note: This function is already defined in scripts.js, so we don't duplicate it here

function stopRecording() {
    if(!mediaRecorder){
        alert("Please record before stopping");
        return;
    }
    console.log("Stopped Recording");
    changeButtons(['blue','green','grey','grey','blue','purple','red','grey'])
    mediaRecorder.stop();

}

function playRecording() {
    console.log("=== PLAY RECORDING CALLED ===");
    console.log("Recorded blobs available:", !!recordedBlobs);
    console.log("Recorded blobs length:", recordedBlobs ? recordedBlobs.length : 0);
    console.log("Total recorded data size:", recordedBlobs ? recordedBlobs.reduce((total, blob) => total + blob.size, 0) : 0);
    
    if(!recordedBlobs){
        console.log("ERROR: No recording saved");
        alert("No recording saved");
        return;
    }
    
    if (recordedBlobs.length === 0) {
        console.log("ERROR: Recording is empty");
        alert("Recording is empty");
        return;
    }
    
    console.log("Playing Recording");
    changeButtons(['blue','green','red','grey','green','green','red','grey'])
    const superBuffer = new Blob(recordedBlobs, { type: 'video/webm' });
    console.log("Created blob with size:", superBuffer.size);
    
    const recordedVideoEl = document.querySelector('#other-video');
    console.log("Found video element:", recordedVideoEl);
    
    if (!recordedVideoEl) {
        console.error("Could not find video element #other-video");
        alert("Could not find video player element");
        return;
    }
    
    const videoUrl = URL.createObjectURL(superBuffer);
    console.log("Created video URL:", videoUrl);
    
    recordedVideoEl.src = videoUrl;
    recordedVideoEl.controls = true;
    
    console.log("Setting video to play...");
    recordedVideoEl.play().then(() => {
        console.log("Video playback started successfully");
    }).catch(error => {
        console.error("Video playback failed:", error);
        alert("Failed to play recording: " + error.message);
    });
    
    changeButtons(['blue','green','grey','grey','blue','grey','red','grey'])
}

function saveRecording() {
    console.log("=== SAVE RECORDING CALLED ===");
    console.log("Recorded blobs available:", !!recordedBlobs);
    console.log("Recorded blobs length:", recordedBlobs ? recordedBlobs.length : 0);
    
    if(!recordedBlobs){
        console.log("ERROR: No recording saved");
        alert("No recording to save. Please record something first.");
        return;
    }
    
    if (recordedBlobs.length === 0) {
        console.log("ERROR: Recording is empty");
        alert("Recording is empty. Nothing to save.");
        return;
    }
    
    console.log("Saving Recording...");
    
    // Create blob with proper MIME type
    const superBuffer = new Blob(recordedBlobs, { type: 'video/webm' });
    console.log("Created blob with size:", superBuffer.size);
    
    // Create download URL
    const url = URL.createObjectURL(superBuffer);
    
    // Generate filename with timestamp
    const now = new Date();
    const timestamp = now.getFullYear() + 
                    String(now.getMonth() + 1).padStart(2, '0') + 
                    String(now.getDate()).padStart(2, '0') + '_' +
                    String(now.getHours()).padStart(2, '0') + 
                    String(now.getMinutes()).padStart(2, '0') + 
                    String(now.getSeconds()).padStart(2, '0');
    
    const filename = `Aarush_Screen_Recording_${timestamp}.webm`;
    
    // Create temporary download link
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    
    // Trigger download
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        console.log("Recording saved as:", filename);
        alert(`Recording saved as: ${filename}`);
    }, 100);
}
