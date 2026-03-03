let mediaRecorder;
let recordedBlobs;

// Use function declarations for automatic hoisting (accessible globally)
console.log("screenRecorder-fixed.js loaded - functions should be available");

function startRecording() {
    console.log("=== START RECORDING CALLED ===");

    // Check if we have media via StreamManager or globals
    const hasMedia = (typeof streamManager !== 'undefined' && streamManager.hasMedia()) || (stream || shareStream);

    if(!hasMedia){
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
        changeButtons(['blue','green','grey','grey','grey','red','grey','purple','grey']);

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

    // Use StreamManager to get the correct stream
    let streamToRecord;
    if (typeof streamManager !== 'undefined') {
        streamToRecord = streamManager.createRecordingStream();
    } else {
        // Fallback if StreamManager is missing
        streamToRecord = shareStream || stream;
    }

    console.log("Stream to record:", streamToRecord);

    if (!streamToRecord || streamToRecord.getTracks().length === 0) {
        console.error("No stream available for recording");
        alert("No stream available for recording. Please start camera or screen sharing first.");
        changeButtons(['blue','green','grey','grey','green','grey','grey','purple','grey']);

        const startRecordBtn = document.getElementById('start-record');
        if (startRecordBtn) {
            startRecordBtn.disabled = false;
            startRecordBtn.classList.remove('disabled');
        }
        return;
    }

    console.log("Recording stream with tracks:", streamToRecord.getTracks().length);
    streamToRecord.getTracks().forEach(t => console.log("Track:", t.kind, t.label, t.readyState));

    // Show PIP camera overlay if recording screen sharing with camera
    if (shareStream && stream) {
        showPipDuringScreenRecording();
    }

    try {
        // Stop any existing recorder
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
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

            // Enable Stop button, Disable Start button
            // Start: Grey, Stop: Red
            changeButtons(['blue','green','grey','grey','grey','red','grey','purple','grey']);

            const startRecordBtn = document.getElementById('start-record');
            if (startRecordBtn) {
                startRecordBtn.disabled = true;
                startRecordBtn.classList.add('disabled');
            }

            const stopRecordBtn = document.getElementById('stop-record');
            if (stopRecordBtn) {
                stopRecordBtn.disabled = false;
                stopRecordBtn.classList.remove('disabled');
            }
        };

        mediaRecorder.onstop = () => {
            console.log("MediaRecorder stopped");
            console.log("Total recorded blobs:", recordedBlobs.length);

            // Reset buttons: Enable Start, Disable Stop, Enable Play/Save
            // Start: Green, Stop: Grey, Play: Blue, Save: Blue
            changeButtons(['blue','green','grey','grey','green','grey','blue','purple','blue']);

            // Hide PIP overlay when recording stops (Standard behavior)
            hidePipAfterRecording();

            // Re-enable start button when recording stops
            const startRecordBtn = document.getElementById('start-record');
            if (startRecordBtn) {
                startRecordBtn.disabled = false;
                startRecordBtn.classList.remove('disabled');
            }

            // Disable stop button
            const stopRecordBtn = document.getElementById('stop-record');
            if (stopRecordBtn) {
                stopRecordBtn.disabled = true;
                stopRecordBtn.classList.add('disabled');
            }

            // Enable Play/Save buttons
            const playRecordBtn = document.getElementById('play-record');
            if (playRecordBtn) {
                playRecordBtn.disabled = false;
                playRecordBtn.classList.remove('disabled');
            }
            const saveRecordBtn = document.getElementById('save-record');
            if (saveRecordBtn) {
                saveRecordBtn.disabled = false;
                saveRecordBtn.classList.remove('disabled');
            }
        };

        mediaRecorder.onerror = (event) => {
            console.error("MediaRecorder error:", event);
            console.error("Error details:", event.error);
            alert("Recording error: " + (event.error?.message || "Unknown error"));
            changeButtons(['blue','green','grey','grey','green','grey','grey','purple','grey']);
            // Hide PIP overlay on error
            hidePipAfterRecording();

            // Re-enable start button on error
            const startRecordBtn = document.getElementById('start-record');
            if (startRecordBtn) {
                startRecordBtn.disabled = false;
                startRecordBtn.classList.remove('disabled');
            }

            const stopRecordBtn = document.getElementById('stop-record');
            if (stopRecordBtn) {
                stopRecordBtn.disabled = true;
                stopRecordBtn.classList.add('disabled');
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
        changeButtons(['blue','green','grey','grey','green','grey','grey','purple','grey']);
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

function stopRecording() {
    if(!mediaRecorder || mediaRecorder.state === 'inactive'){
        // If already stopped, just ensure buttons are correct
        const startRecordBtn = document.getElementById('start-record');
        const stopRecordBtn = document.getElementById('stop-record');

        if (startRecordBtn) {
            startRecordBtn.disabled = false;
            startRecordBtn.classList.remove('disabled');
        }
        if (stopRecordBtn) {
            stopRecordBtn.disabled = true;
            stopRecordBtn.classList.add('disabled');
        }

        alert("Please start a recording before stopping");
        return;
    }
    console.log("Stopped Recording");
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
    changeButtons(['blue','green','red','grey','green','grey','red','purple','blue'])
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

    // Hide placeholder, show video
    updateRemoteVideoPlaceholder(true);

    console.log("Setting video to play...");
    recordedVideoEl.play().then(() => {
        console.log("Video playback started successfully");
    }).catch(error => {
        console.error("Video playback failed:", error);
        alert("Failed to play recording: " + error.message);
    });

    changeButtons(['blue','green','grey','grey','green','grey','red','purple','blue'])
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
