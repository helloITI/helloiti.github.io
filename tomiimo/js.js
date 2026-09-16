  // audio sources
  const s_dn       = '/assets/sounds/se_button_select_sink.mp3';
  const s_up       = '/assets/sounds/se_button_orange_decide_small.mp3';
  const s_pop      = '/assets/sounds/se_appear_dialog_normal.mp3'; // regular
  const s_pop_succ = '/assets/sounds/se_appear_dialog_check.mp3';  // success
  const s_pop_err  = '/assets/sounds/se_appear_dialog_alert.mp3';  // error
  const s_day      = '/assets/audio/BGM_MiiWatch_Normal_Day.mp3';
  const s_night    = '/assets/audio/BGM_MiiWatch_Normal_Night.mp3';

  const a_dn = new Audio(s_dn), 
        a_up = new Audio(s_up), 
        a_pop = new Audio(s_pop),
        a_pop_succ = new Audio(s_pop_succ),
        a_pop_err = new Audio(s_pop_err),
        bgm = new Audio();

  a_dn.preload = a_up.preload = a_pop.preload = a_pop_succ.preload = a_pop_err.preload = bgm.preload = 'auto';
  bgm.loop = true;

  let lastTouchTime = 0;
  let skip_up = false;

  const snd_dn = (e) => {
    if (e && e.type === 'touchstart') lastTouchTime = Date.now();
    if (e && e.type === 'mousedown' && Date.now() - lastTouchTime < 500) return;
    a_dn.currentTime = 0;
    a_dn.play().catch(()=>{});
  };

  const snd_up = (e) => {
    if (e && e.type === 'mouseup' && Date.now() - lastTouchTime < 500) return;
    if (skip_up) return;
    a_up.currentTime = 0;
    a_up.play().catch(()=>{});
  };

  // plays sfx depending on popup type
  function snd_pop(type) {
    a_up.pause();
    a_up.currentTime = 0;
    skip_up = true;
    setTimeout(() => { skip_up = false; }, 500);

    let audioToPlay = a_pop;
    if (type === 'success') audioToPlay = a_pop_succ;
    else if (type === 'error') audioToPlay = a_pop_err;

    audioToPlay.currentTime = 0;
    audioToPlay.play().catch(()=>{});
  }

  // play day or night bgm
  function play_bgm() {
    const hr = new Date().getHours();
    bgm.src = (hr >= 6 && hr < 18) ? s_day : s_night;
    bgm.play().catch(() => {
      const init_bgm = () => {
        bgm.play().catch(()=>{});
        window.removeEventListener('click', init_bgm);
        window.removeEventListener('keydown', init_bgm);
      };
      window.addEventListener('click', init_bgm);
      window.addEventListener('keydown', init_bgm);
    });
  }

  function attach_sounds(el) {
    el.addEventListener('mousedown', snd_dn);
    el.addEventListener('touchstart', snd_dn, { passive: true });
    el.addEventListener('mouseup', snd_up);
    el.addEventListener('touchend', snd_up, { passive: true });
  }

  // popups
  let act_pop = null;

  function pop_on(id, type = 'normal') {
    if (act_pop) document.getElementById(act_pop).classList.remove('act');
    act_pop = id;
    document.getElementById('ov').classList.add('act');
    document.getElementById(id).classList.add('act');
    
    if (type === 'normal') {
      if (id === 'p_succ') type = 'success';
      else if (id === 'p_err' || id === 'p_off') type = 'error';
    }
    
    snd_pop(type);
  }

  function pop_off() {
    if (act_pop) {
      document.getElementById(act_pop).classList.remove('act');
      act_pop = null;
    }
    document.getElementById('ov').classList.remove('act');
  }

  const faq = () => pop_on('p_faq', 'normal');
  const off = () => pop_on('p_off', 'error');
  function err(html) {
    document.getElementById('p_err_txt').innerHTML = html;
    pop_on('p_err', 'error');
  }

  document.getElementById('ov').addEventListener('click', pop_off);

  // cache helper storing both image and nickname
  const cp = 'mii_cache_';
  const c_g = u => {
    try {
      const val = localStorage.getItem(cp + u);
      return val ? JSON.parse(val) : null;
    } catch(e) { return null; }
  };
  function c_s(u, obj) {
    try { localStorage.setItem(cp + u, JSON.stringify(obj)); }
    catch(e) {
      try {
        for (const k of Object.keys(localStorage)) if (k.startsWith(cp)) localStorage.removeItem(k);
        localStorage.setItem(cp + u, JSON.stringify(obj));
      } catch(e2) {}
    }
  }

  // image validation
  const min = 4;
  const g_dim = s => new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res({ w: i.naturalWidth, h: i.naturalHeight });
    i.onerror = () => rej(new Error('bad_image'));
    i.src = s;
  });

  async function v_img(b) {
    const { w, h } = await g_dim(b);
    if (w <= min || h <= min) throw new Error('not_found');
  }

  let s_b64 = null, s_uid = null;

  function s_mii(b, u, name, c) {
    s_b64 = b; s_uid = u;
    document.getElementById('m_img').src = b;
    document.getElementById('n_lbl').textContent = name || 'N/A';
    document.getElementById('u_lbl').textContent = u;
    document.getElementById('c_lbl').textContent = c ? '(loaded from local cache)' : '';
    document.getElementById('pv').style.display = 'block';
    document.getElementById('st').innerHTML = '<font color="green">Loaded successfully!</font>';
    pop_on('p_succ', 'success');
  }

  // load mii using API
  async function ld_mii() {
    const u = document.getElementById('uid').value.trim();

    if (!navigator.onLine) {
      const cached = c_g(u);
      if (cached && u && /^[a-zA-Z0-9]+$/.test(u)) { s_mii(cached.img, u, cached.name, true); return; }
      off(); return;
    }

    if (!u) { err('Please enter an User ID before loading a Mii.'); return; }
    if (!/^[a-zA-Z0-9]+$/.test(u)) { err('The User ID contains invalid characters.<br><br>Only letters and numbers are allowed.'); return; }

    document.getElementById('pv').style.display = 'none';
    document.getElementById('st').innerHTML = 'Loading...';
    s_b64 = null;

    const cached = c_g(u);
    if (cached) { s_mii(cached.img, u, cached.name, true); return; }

    const apiUrl = `https://api.tomiimo.online/${encodeURIComponent(u)}`;
    try {
      const res = await fetch(apiUrl);
      if (!res.ok) { err(`User ID not found.<br><br><span style="font-size:14px; color:#999;">HTTP ${res.status}</span>`); document.getElementById('st').innerHTML = ''; return; }
      
      const data = await res.json();
      if (!data || !data.head_image) {
        err('The API did not return valid Mii data.<br><br>Double-check your User ID and try again.');
        document.getElementById('st').innerHTML = '';
        return;
      }

      // fetch head_image returned from API JSON
      const imgRes = await fetch(data.head_image);
      if (!imgRes.ok) { err('Failed to load Mii head image.'); document.getElementById('st').innerHTML = ''; return; }

      const blob = await imgRes.blob();
      const base64 = await b2_b64(blob);
      await v_img(base64);

      const cacheObj = { name: data.name || 'N/A', img: base64 };
      c_s(u, cacheObj);
      s_mii(base64, u, cacheObj.name, false);
    } catch (e) {
      document.getElementById('st').innerHTML = '';
      if (!navigator.onLine) off();
      else if (e.message === 'not_found') err('User ID not found.<br><br>Make sure you copied it correctly.');
      else if (e.message === 'bad_image') err('The image data was invalid or corrupted.<br><br>Try again in a moment.');
      else err(`Something went wrong.<br><br><span style="font-size:14px; color:#999;">${e.message}</span>`);
    }
  }

  const b2_b64 = b => new Promise((res, rej) => {
    const r = new FileReader();
    r.onloadend = () => res(r.result);
    r.onerror = () => rej(new Error('Failed to read image data'));
    r.readAsDataURL(b);
  });

  // save mii
  function sv_mii() {
    if (!s_b64) return;
    const a = document.createElement('a');
    a.href = s_b64;
    a.download = `mii_${s_uid}.png`;
    a.click();
  }

  // init
  document.addEventListener('DOMContentLoaded', () => {
    play_bgm();
    
    const clickables = 'input[type="button"], #btn_back';
    document.querySelectorAll(clickables).forEach(attach_sounds);

    new MutationObserver(m_list => {
      m_list.forEach(m => m.addedNodes.forEach(n => {
        if (n.nodeType === 1) {
          if (n.matches(clickables)) attach_sounds(n);
          n.querySelectorAll && n.querySelectorAll(clickables).forEach(attach_sounds);
        }
      }));
    }).observe(document.body, { childList: true, subtree: true });

    document.getElementById('uid').addEventListener('keydown', e => { if (e.key === 'Enter') ld_mii(); });
    if (!navigator.onLine) off();
    window.addEventListener('offline', off);
  });
