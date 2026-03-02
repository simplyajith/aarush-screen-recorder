// Picture-in-Picture Camera Overlay Management
class PipCameraManager {
    constructor() {
        this.pipOverlay = document.getElementById('pip-camera-overlay');
        this.pipVideo = document.getElementById('pip-camera-video');
        this.toggleSizeBtn = document.getElementById('pip-toggle-size');
        this.closeBtn = document.getElementById('pip-close');
        this.isMinimized = false;
        this.isActive = false;
        this.pipWindow = null;
        this.isUsingSystemPip = false;
        this.floatingWindow = null;

        this.initEventListeners();
    }

    initEventListeners() {
        // Toggle size button
        this.toggleSizeBtn.addEventListener('click', () => {
            this.toggleSize();
        });

        // Close button
        this.closeBtn.addEventListener('click', () => {
            this.hide();
        });

        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.isActive && !this.isUsingSystemPip) {
                console.log('Page hidden, ensuring PIP is visible');
                this.ensurePipVisibility();
            }
        });
    }

    // Show PIP overlay with camera stream
    show(cameraStream) {
        if (!cameraStream) {
            console.warn('No camera stream available for PIP');
            return;
        }

        console.log('Showing PIP camera overlay');

        // Try different PIP methods in order of preference
        this.trySystemPip(cameraStream)
            .catch(() => this.tryFloatingWindow(cameraStream))
            .catch(() => this.tryBrowserOverlay(cameraStream));
    }

    // Try system-level Picture-in-Picture
    async trySystemPip(cameraStream) {
        return new Promise((resolve, reject) => {
            if (!this.supportsSystemPip()) {
                reject('System PIP not supported');
                return;
            }

            console.log('Attempting system-level Picture-in-Picture');

            // Set the camera stream to the video element
            this.pipVideo.srcObject = cameraStream;
            // IMPORTANT: Don't mute for audio to work in PIP
            this.pipVideo.muted = false;

            // Play the video first
            this.pipVideo.play().then(() => {
                return this.pipVideo.requestPictureInPicture();
            }).then(pipWindow => {
                this.pipWindow = pipWindow;
                this.isUsingSystemPip = true;
                this.isActive = true;

                // Handle PIP window events
                pipWindow.addEventListener('resize', this.onPipResize.bind(this));

                console.log('System PIP window opened successfully with audio');
                resolve();
            }).catch(error => {
                console.warn('System PIP failed:', error);
                reject(error);
            });
        });
    }

    // Try creating a floating window (popup)
    async tryFloatingWindow(cameraStream) {
        return new Promise((resolve, reject) => {
            console.log('Attempting floating window PIP');

            try {
                // Create a new popup window
                const features = 'width=300,height=225,top=100,left=100,toolbar=no,menubar=no,location=no,status=no';
                this.floatingWindow = window.open('', 'CameraPIP', features);

                if (!this.floatingWindow) {
                    reject('Popup blocked');
                    return;
                }

                // Write basic HTML to the popup with audio enabled
                this.floatingWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Camera</title>
                        <style>
                            body { margin: 0; padding: 0; background: #000; }
                            video { width: 100%; height: 100%; object-fit: cover; }
                        </style>
                    </head>
                    <body>
                        <video id="pip-video" autoplay playsinline></video>
                    </body>
                    </html>
                `);

                this.floatingWindow.document.close();

                // Set the camera stream to the popup's video element
                const popupVideo = this.floatingWindow.document.getElementById('pip-video');
                popupVideo.srcObject = cameraStream;

                // IMPORTANT: Don't mute the video in PIP to allow audio
                popupVideo.muted = false;

                // Play the video with audio
                popupVideo.play().then(() => {
                    console.log('PIP video playing with audio');
                }).catch(error => {
                    console.warn('PIP video play failed:', error);
                });

                this.isUsingSystemPip = false;
                this.isActive = true;

                // Handle window close
                this.floatingWindow.addEventListener('beforeunload', () => {
                    this.hide();
                });

                console.log('Floating window PIP opened successfully with audio');
                resolve();

            } catch (error) {
                console.warn('Floating window failed:', error);
                reject(error);
            }
        });
    }

    // Fallback to browser overlay
    tryBrowserOverlay(cameraStream) {
        console.log('Using browser overlay PIP (fallback)');
        this.pipVideo.srcObject = cameraStream;
        // IMPORTANT: Don't mute for audio to work
        this.pipVideo.muted = false;
        this.pipOverlay.classList.add('active');
        this.isUsingSystemPip = false;
        this.isActive = false; // Mark as not using advanced PIP

        // Play the video with audio
        this.pipVideo.play().then(() => {
            console.log('Browser overlay video playing with audio');
        }).catch(error => {
            console.warn('Browser overlay video play failed:', error);
        });

        // Reset to normal size when showing
        if (this.isMinimized) {
            this.toggleSize();
        }
    }

    // Ensure PIP remains visible when page changes
    ensurePipVisibility() {
        if (this.floatingWindow && !this.floatingWindow.closed) {
            // Bring floating window to front
            this.floatingWindow.focus();
        } else if (this.isUsingSystemPip && this.pipWindow) {
            // System PIP should already be visible
            console.log('System PIP should remain visible');
        } else {
            // Try to show browser overlay again
            console.log('Attempting to restore browser overlay');
            if (stream) {
                this.showBrowserOverlay(stream);
            }
        }
    }

    // Check if browser supports Picture-in-Picture API
    supportsSystemPip() {
        return 'pictureInPictureEnabled' in document &&
               this.pipVideo &&
               typeof this.pipVideo.requestPictureInPicture === 'function';
    }

    // Hide PIP overlay
    async hide() {
        console.log('Hiding PIP camera overlay');

        if (this.isUsingSystemPip && this.pipWindow) {
            try {
                await document.exitPictureInPicture();
                this.pipWindow = null;
            } catch (error) {
                console.warn('Error exiting system PIP:', error);
            }
        } else if (this.floatingWindow && !this.floatingWindow.closed) {
            this.floatingWindow.close();
            this.floatingWindow = null;
        } else {
            // Hide browser overlay
            this.pipOverlay.classList.remove('active');
        }

        this.pipVideo.srcObject = null;
        this.isActive = false;
        this.isUsingSystemPip = false;
    }

    // Toggle between normal and minimized size (only for browser overlay)
    toggleSize() {
        if (this.isUsingSystemPip || this.floatingWindow) {
            console.log('Size toggle not available for system/floating PIP');
            return;
        }

        this.isMinimized = !this.isMinimized;

        if (this.isMinimized) {
            this.pipOverlay.classList.add('minimized');
            this.toggleSizeBtn.innerHTML = '<i class="fas fa-expand"></i>';
        } else {
            this.pipOverlay.classList.remove('minimized');
            this.toggleSizeBtn.innerHTML = '<i class="fas fa-compress"></i>';
        }
    }

    // Handle PIP window resize events
    onPipResize() {
        console.log('PIP window resized:', this.pipWindow.width, 'x', this.pipWindow.height);
    }

    // Check if PIP is currently active
    isPipActive() {
        return this.isActive;
    }

    // Update PIP with new stream
    updateStream(newStream) {
        if (this.isActive && newStream) {
            if (this.isUsingSystemPip) {
                this.pipVideo.srcObject = newStream;
            } else if (this.floatingWindow && !this.floatingWindow.closed) {
                const popupVideo = this.floatingWindow.document.getElementById('pip-video');
                if (popupVideo) {
                    popupVideo.srcObject = newStream;
                }
            } else {
                this.pipVideo.srcObject = newStream;
            }
        }
    }

    // Get PIP type for debugging
    getPipType() {
        if (this.isUsingSystemPip) return 'system';
        if (this.floatingWindow) return 'floating';
        return 'browser';
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
