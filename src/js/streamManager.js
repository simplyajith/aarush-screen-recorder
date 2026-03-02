class StreamManager {
    constructor() {
        this.cameraStream = null;
        this.screenStream = null;
        this.activeRecordingStream = null;
    }

    setCameraStream(stream) {
        this.cameraStream = stream;
        console.log("StreamManager: Camera stream set", stream ? stream.id : 'null');
    }

    setScreenStream(stream) {
        this.screenStream = stream;
        console.log("StreamManager: Screen stream set", stream ? stream.id : 'null');
    }

    getCameraStream() {
        return this.cameraStream;
    }

    getScreenStream() {
        return this.screenStream;
    }

    // Creates a stream specifically for recording
    createRecordingStream() {
        console.log("StreamManager: createRecordingStream called");
        console.log("StreamManager State - Camera:", this.cameraStream ? "Active" : "Null", "Screen:", this.screenStream ? "Active" : "Null");

        // Case 1: Screen + Camera (or Screen + Mic)
        if (this.screenStream) {
            const tracks = [
                ...this.screenStream.getVideoTracks(),
                ...(this.cameraStream ? this.cameraStream.getAudioTracks() : [])
            ];
            this.activeRecordingStream = new MediaStream(tracks);
            console.log("StreamManager: Created composite recording stream (Screen + Audio)");
        }
        // Case 2: Camera Only
        else if (this.cameraStream) {
            this.activeRecordingStream = this.cameraStream;
            console.log("StreamManager: Using camera stream for recording");
        } else {
            console.warn("StreamManager: No streams available to record!");
            this.activeRecordingStream = null;
        }

        return this.activeRecordingStream;
    }

    // Switches the video track in the active recording stream from Screen to Camera
    switchToCameraVideo() {
        if (!this.activeRecordingStream || !this.cameraStream) {
            console.warn("StreamManager: Cannot switch to camera. Missing active stream or camera stream.");
            return false;
        }

        const screenVideoTrack = this.activeRecordingStream.getVideoTracks()[0];
        const cameraVideoTrack = this.cameraStream.getVideoTracks()[0];

        if (screenVideoTrack) {
            this.activeRecordingStream.removeTrack(screenVideoTrack);
            console.log("StreamManager: Removed screen track");
        }

        if (cameraVideoTrack) {
            this.activeRecordingStream.addTrack(cameraVideoTrack);
            console.log("StreamManager: Added camera track");
        }

        // Clear screen stream reference as it's ended
        this.screenStream = null;

        return true;
    }

    // Helper to check if we have what we need to record
    hasMedia() {
        return !!(this.cameraStream || this.screenStream);
    }
}

// Export a singleton instance
const streamManager = new StreamManager();
