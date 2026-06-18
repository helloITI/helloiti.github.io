  const fileEl = document.getElementById('file');
    const origCanvas = document.getElementById('orig');
    const outCanvas = document.getElementById('out');
    const ctxOrig = origCanvas.getContext('2d', { willReadFrequently: true });
    const ctxOut = outCanvas.getContext('2d');

    const modeEl = document.getElementById('mode');
    const hueRangeEl = document.getElementById('hueRange');
    const satMinEl = document.getElementById('satMin');
    const valMinEl = document.getElementById('valMin');
    const softEl = document.getElementById('soft');
    const redBoostEl = document.getElementById('redBoost');
    const downloadBtn = document.getElementById('download');
    const resetBtn = document.getElementById('reset');
    const music = document.getElementById('bg-music');

    let img = new Image();

    function resetControls() {
      hueRangeEl.value = 18;
      satMinEl.value = 30;
      valMinEl.value = 20;
      softEl.value = 12;
      redBoostEl.value = 1.5;
      modeEl.value = 'hue';
    }

    function fitCanvasToImage(c, image) {
      c.width = image.naturalWidth || image.width;
      c.height = image.naturalHeight || image.height;
    }

    function drawOriginal(image) {
      fitCanvasToImage(origCanvas, image);
      ctxOrig.drawImage(image, 0, 0);
    }

    function process() {
      if (!img || !img.complete) return;
      fitCanvasToImage(origCanvas, img);
      fitCanvasToImage(outCanvas, img);
      ctxOrig.drawImage(img, 0, 0);

      const w = origCanvas.width, h = origCanvas.height;
      const data = ctxOrig.getImageData(0, 0, w, h);
      const out = ctxOut.createImageData(w, h);

      const mode = modeEl.value;
      const hueRange = Number(hueRangeEl.value);
      const satMin = Number(satMinEl.value) / 100;
      const valMin = Number(valMinEl.value) / 100;
      const soft = Number(softEl.value);
      const redBoost = Number(redBoostEl.value);

      for (let i = 0; i < data.data.length; i += 4) {
        const r = data.data[i] / 255;
        const g = data.data[i + 1] / 255;
        const b = data.data[i + 2] / 255;
        let keep = 0;

        if (mode === 'channel') {
          if (r > (g + b) * 0.5 && r > g * redBoost && r > b * redBoost && r > 0.05) keep = 1;
        } else {
          const max = Math.max(r, g, b), min = Math.min(r, g, b);
          const v = max;
          let s = 0;
          if (max !== 0) s = (max - min) / max;
          let h = 0;
          if (max === min) h = 0;
          else {
            if (max === r) h = ((g - b) / (max - min)) % 6;
            else if (max === g) h = ((b - r) / (max - min)) + 2;
            else h = ((r - g) / (max - min)) + 4;
            h = h * 60;
            if (h < 0) h += 360;
          }
          const distToRed = Math.min(Math.abs(h - 0), Math.abs(h - 360));
          const withinHue = (distToRed <= hueRange);
          if (withinHue && s >= satMin && v >= valMin) keep = 1;
        }

        out.data[i]     = data.data[i];
        out.data[i + 1] = data.data[i + 1];
        out.data[i + 2] = data.data[i + 2];
        out.data[i + 3] = keep ? 255 : 0;
      }

      ctxOut.putImageData(out, 0, 0);
    }

    fileEl.addEventListener('change', e => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      const url = URL.createObjectURL(f);
      img = new Image();
      img.onload = () => {
        drawOriginal(img);
        process();
        URL.revokeObjectURL(url);
      };
      img.src = url;
    });

    [modeEl, hueRangeEl, satMinEl, valMinEl, softEl, redBoostEl].forEach(el =>
      el.addEventListener('input', process)
    );

    downloadBtn.addEventListener('click', () => {
      outCanvas.toBlob(function(blob) {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'finished_img.png';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(a.href);
      });
    });

    resetBtn.addEventListener('click', () => { resetControls(); process(); });

    function enableSound() {
      music.currentTime = 0;
      music.play().catch(()=>{});
      window.removeEventListener('click', enableSound);
    }
    window.addEventListener('click', enableSound);

    resetControls();
