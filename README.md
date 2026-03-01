# Aarush Screen Recorder

A comprehensive web-based screen recording application built with vanilla JavaScript, HTML5, and CSS3. This application allows users to record their screen, camera, and microphone with advanced features like Picture-in-Picture (PiP), device selection, and video playback.

## 🚀 Features

- **Screen Recording**: Capture your entire screen, application window, or browser tab.
- **Camera & Microphone Support**: Record video from your webcam and audio from your microphone.
- **Picture-in-Picture (PiP)**: View your camera feed in a floating window while recording your screen.
- **Device Selection**: Choose specific audio input, audio output, and video input devices.
- **Video Playback**: Play back recorded videos immediately within the application.
- **Responsive Design**: Modern, dark-themed UI built with Bootstrap 5.
- **Visual Feedback**: Real-time status indicators for camera, microphone, and recording state.
- **Countdown Timer**: Visual countdown before recording starts.

## 🛠️ Components

The project is structured into several modular JavaScript files, each handling specific functionality:

### 1. Core Logic (`scripts.js`)
The main entry point for the application. It handles:
- Initialization of global variables (streams, constraints).
- Event listeners for UI buttons.
- Status updates for camera and microphone.
- Basic camera and microphone access requests.

### 2. Screen Recording (`screenRecorder-fixed.js`)
Manages the recording process using the `MediaRecorder` API.
- **`startRecording()`**: Initiates the recording process, handles the countdown, and sets up the media stream.
- **`actuallyStartRecording()`**: The core function that creates the `MediaRecorder` instance and starts capturing data.
- **`stopRecording()`**: Stops the recording and saves the data.
- **`playRecording()`**: Creates a blob from the recorded data and plays it in the video player.
- **`createMixedStream()`**: Combines screen video with audio from both the screen and microphone/camera.

### 3. Screen Sharing (`shareScreen-updated.js`)
Handles the screen sharing functionality.
- **`shareScreen()`**: Requests access to the user's screen using `navigator.mediaDevices.getDisplayMedia`.
- **`toggleScreenShareAudio()`**: Toggles audio capture during screen sharing.

### 4. Input/Output Management (`inputOutput.js`)
Manages device enumeration and selection.
- **`getDevices()`**: Lists available audio and video devices.
- **`changeAudioInput()`**: Switches the active microphone.
- **`changeAudioOutput()`**: Switches the active speaker (if supported by the browser).
- **`changeVideoInput()`**: Switches the active camera.

### 5. Picture-in-Picture (`pipCamera.js`)
Controls the Picture-in-Picture overlay for the camera.
- **`PipCameraManager`**: A class that manages the PiP window, supporting system-level PiP, floating windows, and browser-based overlays.
- **`showPipDuringScreenRecording()`**: Automatically shows the camera in PiP mode when screen recording starts.

### 6. UI Helpers
- **`changeButtons.js`**: Updates button styles (colors) based on the current application state (e.g., recording, idle).
- **`changeVideoSize.js`**: Allows users to change the resolution of the camera feed.

### 7. Styling (`styles.css`, `video-fix.css`)
- **`styles.css`**: Basic layout and styling.
- **`video-fix.css`**: Advanced styling for video containers, overlays, and animations to ensure a polished look.

## 📦 Installation & Usage

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    ```
2.  **Open `index.html`**:
    Simply open the `index.html` file in a modern web browser (Chrome, Firefox, Edge). No build step or server is strictly required for basic functionality, though a local server is recommended for full feature support (like `setSinkId`).

## 🔒 Permissions

The application requires the following permissions to function correctly:
- **Camera**: To record your video feed.
- **Microphone**: To record your audio.
- **Screen Recording**: To capture your screen content.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open-source and available under the MIT License.
