// Picture-in-Picture Camera Overlay Management
class PipCameraManager {
    constructor() {
        this.pipVideo = document.getElementById('pip-camera-video');
        this.isActive = false;
        this.pipWindow = null;

        // We don't need drag events or overlay elements anymore
        // as we are strictly using System PIP
    }

    initEventListeners() {
        // No specific listeners needed for System PIP initiation here
        // as it's triggered by the recording logic
    }

    // Show PIP overlay with camera stream
    show(cameraStream) {
        if (!cameraStream) {
            console.warn('No camera stream available for PIP');
            return;
        }

        console.log('Showing PIP camera overlay (System PIP)');

        this.trySystemPip(cameraStream)
            .catch(error => {
                console.error('Failed to start System PIP:', error);
                // We no longer fallback to custom overlays
            });
    }

    // Try system-level Picture-in-Picture
    async trySystemPip(cameraStream) {
        return new Promise((resolve, reject) => {
            if (!('pictureInPictureEnabled' in document)) {
                reject('System PIP not supported');
                return;
            }

            console.log('Attempting system-level Picture-in-Picture');

            // Set the camera stream to the video element
            this.pipVideo.srcObject = cameraStream;
            // IMPORTANT: Mute video to allow autoplay
            this.pipVideo.muted = true;

            this.pipVideo.onloadedmetadata = () => {
                // Play the video first
                this.pipVideo.play().then(() => {
                    return this.pipVideo.requestPictureInPicture();
                }).then(pipWindow => {
                    this.pipWindow = pipWindow;
                    this.isActive = true;

                    // Handle PIP window events
                    pipWindow.addEventListener('resize', (e) => {
                        console.log('PIP window resized:', e.target.width, 'x', e.target.height);
                    });

                    pipWindow.addEventListener('pagehide', () => {
                        this.isActive = false;
                        this.pipWindow = null;
                        console.log('PIP window closed by user');
                    });

                    console.log('System PIP window opened successfully');
                    resolve();
                }).catch(error => {
                    console.warn('System PIP failed:', error);
                    reject(error);
                });
            };
        });
    }

    // Check if PIP is currently active
    isPipActive() {
        return this.isActive;
    }

    // Hide PIP overlay
    async hide() {
        console.log('Hiding PIP camera overlay');

        if (this.isActive && document.pictureInPictureElement) {
            try {
                await document.exitPictureInPicture();
                this.pipWindow = null;
                this.isActive = false;
            } catch (error) {
                console.warn('Error exiting system PIP:', error);
            }
        }

        this.pipVideo.srcObject = null;
        this.isActive = false;
    }
}

// Create global PIP manager instance
const pipCamera = new PipCameraManager();

// Helper function to show PIP during screen recording
const showPipDuringScreenRecording = () => {
    // Only show PIP if we have both screen sharing and camera streams
    if (shareStream && stream) {
        console.log('Screen recording with camera - showing PIP');

        // Check if camera stream has audio tracks
        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length === 0) {
            console.warn('Camera stream has no audio tracks - requesting microphone access');
            requestMicrophoneAccess().then(() => {
                pipCamera.show(stream);
            }).catch(error => {
                console.warn('Microphone access denied, showing PIP without audio');
                pipCamera.show(stream);
            });
        } else {
            console.log('Camera stream has audio tracks:', audioTracks.length);
            pipCamera.show(stream);
        }
    }
};

// Request microphone access if not already granted
const requestMicrophoneAccess = async () => {
    try {
        const micStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false
        });

        // We don't need to keep this stream, just check if we got permission
        micStream.getTracks().forEach(track => track.stop());
        console.log('Microphone access granted');

        // Re-request camera with audio
        if (stream) {
            const videoTracks = stream.getVideoTracks();
            if (videoTracks.length > 0) {
                const videoConstraints = videoTracks[0].getConstraints();
                const newStream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: videoConstraints
                });

                // Replace the old stream
                stream.getTracks().forEach(track => track.stop());
                stream = newStream;

                // Update video element if showing
                const videoEl = document.querySelector('#my-video');
                if (videoEl.srcObject) {
                    videoEl.srcObject = stream;
                }

                console.log('Camera stream updated with audio');
            }
        }

    } catch (error) {
        console.error('Microphone access denied:', error);
        throw error;
    }
};

// Helper function to hide PIP when recording stops
const hidePipAfterRecording = () => {
    if (pipCamera.isPipActive()) {
        console.log('Recording stopped - hiding PIP');
        pipCamera.hide();
    }
};
