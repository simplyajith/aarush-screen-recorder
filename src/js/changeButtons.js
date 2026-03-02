// UI Theme Configuration
const THEME = {
    primary: 'btn-primary',   // Blue
    success: 'btn-success',   // Green
    danger: 'btn-danger',     // Red
    accent: 'btn-purple',     // Purple
    secondary: 'btn-secondary', // Grey
    warning: 'btn-warning',   // Yellow/Orange
    info: 'btn-info'          // Light Blue
};

const buttonsById = [
    'share',        // 0: Share Camera & Mic
    'show-video',   // 1: Show Video
    'stop-video',   // 2: Stop Video
    'change-size',  // 3: Change Size
    'start-record', // 4: Start Recording
    'stop-record',  // 5: Stop Recording
    'play-record',  // 6: Play Recording
    'share-screen', // 7: Share Screen
    'save-record'   // 8: Save Recording (Added this one)
];

// Cache button elements
const buttonEls = buttonsById.map(buttonId => document.getElementById(buttonId));

/**
 * Updates button styles based on an array of color keys.
 *
 * @param {string[]} colorsArray - Array of color keys matching the order in buttonsById.
 * Keys: 'blue', 'green', 'red', 'purple', 'grey', 'orange', 'info'
 */
const changeButtons = (colorsArray) => {
    colorsArray.forEach((colorKey, i) => {
        const button = buttonEls[i];
        if (!button) return;

        // Base classes
        const isChangeSizeButton = buttonsById[i] === 'change-size';
        let baseClass = isChangeSizeButton ? 'btn mb-1' : 'btn d-block mb-1';

        // Map color keys to Bootstrap classes
        let themeClass = THEME.secondary; // Default to grey

        switch(colorKey) {
            case 'blue': themeClass = THEME.primary; break;
            case 'green': themeClass = THEME.success; break;
            case 'red': themeClass = THEME.danger; break;
            case 'purple': themeClass = THEME.accent; break;
            case 'grey': themeClass = THEME.secondary; break;
            case 'orange': themeClass = THEME.warning; break;
            case 'info': themeClass = THEME.info; break;
        }

        // Apply classes
        button.className = `${baseClass} ${themeClass}`;
    });
};
