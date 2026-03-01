//green = btn-success
//blue = btn-primary
//grey = btn-secondary
//red = btn-danger

const buttonsById = [
    'share', 'show-video', 'stop-video', 'change-size', 'start-record',
    'stop-record','play-record','share-screen'
]

//buttonEls will be an array of dom elements in order of buttonsById
const buttonEls = buttonsById.map(buttonId=>document.getElementById(buttonId));
console.log(buttonEls);

const colorMap = {
    green: 'btn-success',
    blue: 'btn-primary',
    grey: 'btn-secondary',
    red: 'btn-danger',
    purple: 'btn-primary', // reuse existing classes
    orange: 'btn-warning'
};

const changeButtons = (colorsArray) => {

    colorsArray.forEach((color, i) => {
        // Clear existing classes
        const isChangeSizeButton = buttonsById[i] === 'change-size';
        buttonEls[i].className = isChangeSizeButton ? 'btn mb-1' : 'btn d-block mb-1';
        // Add new class
        if (colorMap[color]) {
            buttonEls[i].classList.add(colorMap[color]);
        }
    });
};
