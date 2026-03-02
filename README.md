# 🎥 Aarush Screen Recorder: Professional Web-Based Capture Tool

[![Live Demo](https://img.shields.io/badge/demo-vercel-black?logo=vercel)](https://aarushscreenrecorder.vercel.app/)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-support-yellow.svg)](https://buymeacoffee.com/aarushtech)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![JavaScript](https://img.shields.io/badge/javascript-vanilla-yellow.svg)
![Bootstrap](https://img.shields.io/badge/style-bootstrap-purple.svg)

A comprehensive, zero-install screen recording application built with vanilla JavaScript. Record your screen, camera, and microphone with advanced features like Picture-in-Picture (PiP), multi-source audio mixing, and instant playback.

## 🌐 Live Demo

Try it out instantly: **[https://aarushscreenrecorder.vercel.app/](https://aarushscreenrecorder.vercel.app/)**

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
    git clone https://github.com/simplyajith/aarush-screen-recorder.git
    ```
2.  **Open `index.html`**:
    Simply open the file in a modern browser (Chrome, Edge, Firefox). No server or installation required!

## 🔒 Privacy & Permissions

This application runs entirely in your browser. No data is sent to any server.
*   **Camera/Mic**: Required only for recording your feed.
*   **Screen Recording**: Required to capture your desktop content.

## ☕ Support

If you find this tool useful, consider buying me a coffee!

<a href="https://buymeacoffee.com/aarushtech" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

## 🤝 Contributing

Contributions are welcome! Feel free to submit a Pull Request or open an issue.

## 📄 License

This project is open-source and available under the MIT License.
