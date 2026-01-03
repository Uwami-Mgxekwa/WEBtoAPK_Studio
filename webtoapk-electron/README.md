# WEBtoAPK Studio - Electron Edition

A modern desktop application for converting web applications into Android APK files, built with Electron and web technologies.

## Features

- **Modern UI**: Clean, responsive interface built with HTML/CSS/JS
- **Web Preview**: Live preview of your web application before conversion
- **Step-by-step Workflow**: Guided process for APK generation
- **Cross-platform**: Runs on Windows, macOS, and Linux

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Navigate to the electron project directory:
```bash
cd webtoapk-electron
```

2. Install dependencies:
```bash
npm install
```

3. Run the application:
```bash
npm start
```

### Development

Run in development mode with DevTools:
```bash
npm run dev
```

### Building

Create distributable packages:
```bash
npm run build
```

## Project Structure

```
webtoapk-electron/
├── src/
│   ├── main.js          # Electron main process
│   ├── preload.js       # Preload script for security
│   └── renderer/        # Frontend application
│       ├── index.html   # Main UI
│       ├── styles.css   # Styling
│       └── app.js       # Frontend logic
├── assets/              # Application assets
├── package.json         # Project configuration
└── README.md           # This file
```

## Current Status

This is a modern UI framework for the WEBtoAPK conversion tool. The current implementation includes:

- ✅ Complete UI workflow (3 steps)
- ✅ Web preview functionality
- ✅ File/folder selection dialogs
- ✅ Progress tracking for APK generation
- ⚠️ APK generation is currently a placeholder (generates JSON info file)

## Next Steps

To complete the APK generation functionality, you'll need to integrate:

1. **Android SDK Tools**: For actual APK building
2. **Web Scraping**: To download and package web assets
3. **Template System**: Android project templates for web apps
4. **Signing**: APK signing capabilities

## Advantages over Java Swing Version

- Modern, responsive UI that feels native
- Built-in web preview capabilities
- Easier to maintain and extend
- Better performance for web-related operations
- Cross-platform compatibility with native look and feel