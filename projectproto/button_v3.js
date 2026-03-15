const ICON_COLOR = {
  off: '#7a3b32',
  on: '#ffcac7'
};

const tintedImagesCache = {};

const imagePaths = {
  button: ['graphics/btn_off.png', 'graphics/btn_on.png'],
  tab: ['graphics/tab_off.png', 'graphics/tab_on.png'],
  section: ['graphics/section_off.png', 'graphics/section_on.png'],
  back: ['graphics/back_btn_off.png', 'graphics/back_btn_on.png'],
  ok: ['graphics/ok_btn_off.png', 'graphics/ok_btn_on.png'],
  color: ['graphics/color_off.png', 'graphics/color_on.png'],
};

// Preload image helper
function preloadImage(url) {
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.src = url;
  });
}

// Recolor an icon image to a hex color
async function recolorIconToDataURL(iconSrc, colorHex) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = iconSrc;
  await img.decode();
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const rTarget = parseInt(colorHex.slice(1, 3), 16);
  const gTarget = parseInt(colorHex.slice(3, 5), 16);
  const bTarget = parseInt(colorHex.slice(5, 7), 16);
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] > 240 && data[i + 1] > 240 && data[i + 2] > 240 && data[i + 3] > 0) {
      data[i] = rTarget;
      data[i + 1] = gTarget;
      data[i + 2] = bTarget;
    }
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL();
}

// Tint an image for color buttons
async function tintImage(img, colorHex) {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = colorHex;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = 'destination-in';
  ctx.drawImage(img, 0, 0);
  return canvas.toDataURL();
}

// Update the tab icon color
async function updateTabIcon(btn, state) {
  if (!btn.dataset.icon) return;
  const styleEl = btn.dataset.styleElement;
  const className = btn.dataset.className;
  const iconURL = await recolorIconToDataURL(btn.dataset.icon, ICON_COLOR[state]);
  styleEl.innerHTML = `
    .${className}::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image: url('${iconURL}');
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      image-rendering: pixelated;
      pointer-events: none;
    }
  `;
}

// Initialize all buttons
document.querySelectorAll('.btn').forEach(async btn => {
  const type = btn.dataset.type;
  const [offSrc, onSrc] = imagePaths[type];
  if (!offSrc || !onSrc) return;

  const offImage = await preloadImage(offSrc);
  btn.style.width = `${offImage.width}px`;
  btn.style.height = `${offImage.height}px`;
  btn.dataset.state = 'off';
  btn.style.position = 'relative';
  btn.style.backgroundImage = `url('${offSrc}')`;
  btn.style.backgroundSize = 'contain';
  btn.style.backgroundRepeat = 'no-repeat';

  // Handle icons
  if (btn.dataset.icon) {
    const className = `btn-icon-${Math.random().toString(36).substring(2, 8)}`;
    btn.classList.add(className);
    const styleElement = document.createElement('style');
    document.head.appendChild(styleElement);
    btn.dataset.styleElement = styleElement;
    btn.dataset.className = className;
    await updateTabIcon(btn, 'off');
  }

  // Color buttons
  if (type === 'color') {
    const colorHex = btn.dataset.color || '#FFFFFF';
    const onImage = await preloadImage(onSrc);
    const offKey = offSrc + '_' + colorHex;
    const onKey = onSrc + '_' + colorHex;
    if (!tintedImagesCache[offKey]) tintedImagesCache[offKey] = await tintImage(offImage, colorHex);
    if (!tintedImagesCache[onKey]) tintedImagesCache[onKey] = await tintImage(onImage, colorHex);
    btn.style.backgroundImage = `url('${tintedImagesCache[offKey]}')`;

    btn.addEventListener('click', () => {
      const container = btn.closest('.button-container');
      if (container) {
        container.querySelectorAll(`.btn[data-type="color"]`).forEach(otherBtn => {
          if (otherBtn !== btn) {
            const otherColor = otherBtn.dataset.color || '#FFFFFF';
            const otherOffKey = imagePaths.color[0] + '_' + otherColor;
            otherBtn.dataset.state = 'off';
            otherBtn.style.backgroundImage = `url('${tintedImagesCache[otherOffKey]}')`;
          }
        });
      }
      btn.dataset.state = 'on';
      btn.style.backgroundImage = `url('${tintedImagesCache[onKey]}')`;
    });

  } else {
    // Section, Tab, Button
    btn.addEventListener('click', async () => {
      const container = btn.closest('.button-container');

      if (['button', 'section', 'tab'].includes(type)) {
        if (container) {
          container.querySelectorAll(`.btn[data-type="${type}"]`).forEach(async otherBtn => {
            const [otherOffSrc] = imagePaths[type];
            otherBtn.dataset.state = 'off';
            otherBtn.style.backgroundImage = `url('${otherOffSrc}')`;

            if (type === 'tab') {
              await updateTabIcon(otherBtn, 'off');
            }
          });
        }

        btn.dataset.state = 'on';
        btn.style.backgroundImage = `url('${onSrc}')`;
        if (type === 'tab') await updateTabIcon(btn, 'on');

        // Handle tab content display
        const tabName = btn.dataset.tab;
        if (tabName) {
          document.querySelectorAll('[data-tab-content]').forEach(el => el.style.display = 'none');
          document.querySelectorAll(`[data-tab-content="${tabName}"]`).forEach(el => el.style.display = '');
        }

      } else {
        // Temporary toggle for other buttons
        btn.style.backgroundImage = `url('${onSrc}')`;
        setTimeout(() => { btn.style.backgroundImage = `url('${offSrc}')`; }, 150);
      }
    });
  }
});

// Initialize default tab content
document.querySelectorAll('[data-tab-content]').forEach(el => el.style.display = 'none');
document.querySelectorAll(`[data-tab-content="head"]`).forEach(el => el.style.display = '');

