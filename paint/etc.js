// extra paint features :)

const opSlider = document.getElementById('op');
const eyeBtn = document.getElementById('eye');
const mirBtn = document.getElementById('mir');
const mainCanvas = document.getElementById('cv');
const mainCtx = mainCanvas.getContext('2d');
const colorInput = document.getElementById('col');

// opacity
let brushAlpha = 1;
opSlider.addEventListener('input', e => {
    brushAlpha = Number(e.target.value) / 100;
    mainCtx.globalAlpha = brushAlpha;
});

// eyedropper
let eyeActive = false;
eyeBtn.addEventListener('click', () => {
    eyeActive = !eyeActive;
    eyeBtn.textContent = eyeActive ? 'Picking...' : 'Eyedropper';
    mainCanvas.style.cursor = eyeActive ? 'crosshair' : '';
});

mainCanvas.addEventListener('click', e => {
    if (!eyeActive) return;
    const rect = mainCanvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (mainCanvas.width / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (mainCanvas.height / rect.height));
    const [r, g, b] = mainCtx.getImageData(x, y, 1, 1).data;
    const hex = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
    colorInput.value = hex;
    colorInput.dispatchEvent(new Event('input'));
    eyeActive = false;
    eyeBtn.textContent = 'Eyedropper';
    mainCanvas.style.cursor = '';
});

// mirror mode
//hooks into the canvas mousemove/touchmove after js.js fires
let mirrorOn = false;
mirBtn.addEventListener('click', () => {
    mirrorOn = !mirrorOn;
    mirBtn.textContent = mirrorOn ? 'Mirror: On' : 'Mirror';
});

let lastMirPos = null;

function getMirrorPos(x, y) {
    return { x: mainCanvas.width - x, y };
}

mainCanvas.addEventListener('mousemove', e => {
    if (!mirrorOn || !e.buttons) { lastMirPos = null; return; }

    const rect = mainCanvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (mainCanvas.width / rect.width);
    const y = (e.clientY - rect.top) * (mainCanvas.height / rect.height);
    const mx = mainCanvas.width - x;

    mainCtx.lineCap = 'round';
    mainCtx.lineJoin = 'round';
    mainCtx.globalAlpha = brushAlpha;

    if (lastMirPos) {
        mainCtx.beginPath();
        mainCtx.moveTo(lastMirPos.x, lastMirPos.y);
        mainCtx.lineTo(mx, y);
        mainCtx.stroke();
    }

    lastMirPos = { x: mx, y };
}, true);

mainCanvas.addEventListener('touchmove', e => {
    if (!mirrorOn) { lastMirPos = null; return; }

    const rect = mainCanvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = (touch.clientX - rect.left) * (mainCanvas.width / rect.width);
    const y = (touch.clientY - rect.top) * (mainCanvas.height / rect.height);
    const mx = mainCanvas.width - x;

    mainCtx.lineCap = 'round';
    mainCtx.lineJoin = 'round';
    mainCtx.globalAlpha = brushAlpha;

    if (lastMirPos) {
        mainCtx.beginPath();
        mainCtx.moveTo(lastMirPos.x, lastMirPos.y);
        mainCtx.lineTo(mx, y);
        mainCtx.stroke();
    }

    lastMirPos = { x: mx, y };
}, true);

mainCanvas.addEventListener('mouseup', () => lastMirPos = null);
mainCanvas.addEventListener('touchend', () => lastMirPos = null);
mainCanvas.addEventListener('mouseout', () => lastMirPos = null);
