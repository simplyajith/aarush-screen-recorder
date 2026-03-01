# 🎥 Aarush Screen Recorder: Professional Web-Based Capture Tool

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![JavaScript](https://img.shields.io/badge/javascript-vanilla-yellow.svg)
![Bootstrap](https://img.shields.io/badge/style-bootstrap-purple.svg)

A comprehensive, zero-install screen recording application built with vanilla JavaScript. Record your screen, camera, and microphone with advanced features like Picture-in-Picture (PiP), multi-source audio mixing, and instant playback.

## 🚀 Key Features

*   **🖥️ Versatile Recording**: Capture your entire screen, specific application windows, or browser tabs.
*   **📸 Smart PiP Overlay**: Keep your camera visible in a floating Picture-in-Picture window while recording your screen.
*   **🎙️ Advanced Audio Mixing**: Seamlessly mix system audio with microphone input (perfect for tutorials and reaction videos).
*   **🎛️ Device Management**: easily switch between multiple cameras, microphones, and speakers on the fly.
*   **⚡ Instant Playback**: Review your recordings immediately within the browser before saving.
*   **🎨 Modern UI**: Clean, dark-themed interface built with Bootstrap 5 for a professional look.

## 🛠️ Technical Highlights

The project is structured into modular JavaScript components:

*   **Core Logic**: `scripts.js` handles initialization and state management.
*   **Recording Engine**: `screenRecorder-fixed.js` utilizes the `MediaRecorder` API with custom stream mixing.
*   **Screen Sharing**: `shareScreen-updated.js` manages `getDisplayMedia` and track events.
*   **PiP Manager**: `pipCamera.js` implements a robust Picture-in-Picture system supporting both native API and custom overlays.
*   **Device Handling**: `inputOutput.js` manages `enumerateDevices` and stream switching.

## 📦 Quick Start

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/aarush-screen-recorder.git
    ```
2.  **Open `index.html`**:
    Simply open the file in a modern browser (Chrome, Edge, Firefox). No server or installation required!

## 🔒 Privacy & Permissions

This application runs entirely in your browser. No data is sent to any server.
*   **Camera/Mic**: Required only for recording your feed.
*   **Screen Recording**: Required to capture your desktop content.

## 🤝 Contributing

Contributions are welcome! Feel free to submit a Pull Request or open an issue.

## 📄 License

This project is open-source and available under the MIT License.
