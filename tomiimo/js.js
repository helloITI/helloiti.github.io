const dotLoaderHTML = '<div class="dot-loader"><span></span><span></span><span></span></div>';
let last_fetch_time = 0;

// settings
function ld_s() {
  try {
    const s = JSON.parse(localStorage.getItem('mii_settings') || '{}');
    if (s.dark) { document.body.classList.add('dark'); document.getElementById('set_dark').checked = true; }
    if (s.sfx === false) document.getElementById('set_sfx').checked = false;
    if (s.bgm === false) document.getElementById('set_bgm').checked = false;
    if (s.remember) document.getElementById('set_remember').checked = true;
    if (s.url) document.getElementById('set_url').checked = true;
    if (s.autoclear) document.getElementById('set_autoclear').checked = true;
  } catch(e) {}
}

function sv_s() {
  try {
    const s = {
      dark: document.getElementById('set_dark').checked,
      sfx: document.getElementById('set_sfx').checked,
      bgm: document.getElementById('set_bgm').checked,
      remember: document.getElementById('set_remember').checked,
      url: document.getElementById('set_url').checked,
      autoclear: document.getElementById('set_autoclear').checked,
    };
    localStorage.setItem('mii_settings', JSON.stringify(s));
  } catch(e) {}
}

const tg_d = () => { document.body.classList.toggle('dark', document.getElementById('set_dark').checked); sv_s(); };
const tg_b = () => { bgm.volume = document.getElementById('set_bgm').checked ? 1 : 0; sv_s(); };
const s_on = () => document.getElementById('set_sfx')?.checked !== false;

// cache
const g_cc = () => { try { return Object.keys(localStorage).filter(k => k.startsWith(cp)).length; } catch(e) { return 0; } };

const u_cc = () => {
  const l = document.getElementById('cl');
  const list = document.getElementById('cl_list');
  if (l) l.innerHTML = `Cached Miis: <b>${g_cc()}</b>`;
  if (!list) return;

  list.innerHTML = '';
  const keys = Object.keys(localStorage).filter(k => k.startsWith(cp));
  if (keys.length === 0) {
    list.innerHTML = '<div style="font-size:13px; color:#aaa; padding:6px;">No cached Miis</div>';
    return;
  }

  keys.forEach(k => {
    const uid = k.replace(cp, '');
    const item = c_g(uid);
    if (!item) return;

    const div = document.createElement('div');
    div.className = 'cl-item';
    const escapedName = (item.name || 'N/A').replace(/'/g, "\\'");
    div.innerHTML = `
      <div class="cl-info" onclick="ld_c_mii('${uid}')" title="Click to load">
        <img class="cl-img" src="${item.img}" alt="" onclick="show_mii_img_pop('${item.img}', '${escapedName}', event)" title="Click to preview image" />
        <div class="cl-txt">
          <div class="cl-name">${item.name || 'N/A'}</div>
          <div class="cl-uid">${uid}</div>
        </div>
      </div>
      <div class="cl-btns">
        <button class="cl-btn cl-ref" onclick="ref_c_mii('${uid}', event)" title="Refresh Mii from API">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
          </svg>
        </button>
        <button class="cl-btn cl-del" onclick="del_c_mii('${uid}')" title="Delete from cache">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `;
    list.appendChild(div);
  });
};

function show_mii_img_pop(imgUrl, name, event) {
  if (event) event.stopPropagation();
  document.getElementById('p_img_src').src = imgUrl;
  document.getElementById('p_img_name').textContent = name || 'Mii Preview';
  p_on('p_img_preview', 'normal');
}

function ld_c_mii(uid) {
  document.getElementById('uid').value = uid;
  p_off();
  l_m();
}

async function ref_c_mii(uid, event) {
  if (event) event.stopPropagation();
  if (!navigator.onLine) { off(); return; }

  const now = Date.now();
  const diff = now - last_fetch_time;
  if (diff < 5000) {
    const rem = Math.ceil((5000 - diff) / 1000);
    err(`Please wait ${rem} second${rem !== 1 ? 's' : ''} before refreshing from the API.`);
    return;
  }

  const btn = event ? event.target.closest('.cl-btn') : null;
  if (btn) { btn.disabled = true; btn.style.opacity = '0.5'; }

  try {
    last_fetch_time = Date.now();
    const res = await fetch(`https://api.tomiimo.online/${encodeURIComponent(uid)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    if (!data || !data.head_image) throw new Error('Invalid data');

    const imgRes = await fetch(data.head_image);
    if (!imgRes.ok) throw new Error('Image fetch failed');

    const blob = await imgRes.blob();
    const base64 = await b_b(blob);
    await v_im(base64);

    const co = { name: data.name || 'N/A', img: base64 };
    c_s(uid, co);

    if (s_uid === uid) {
      s_m(base64, uid, co.name, true);
    } else {
      u_cc();
    }
  } catch(e) {
    err(`Failed to refresh cached Mii.<br><br><span style="font-size:14px; color:#999;">${e.message}</span>`);
  } finally {
    if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
  }
}

function del_c_mii(uid) {
  try {
    localStorage.removeItem(cp + uid);
    u_cc();
  } catch(e) {}
}

function clr_c() {
  try {
    const k = Object.keys(localStorage).filter(x => x.startsWith(cp));
    k.forEach(x => localStorage.removeItem(x));
    u_cc(); p_off();
    setTimeout(() => {
      document.getElementById('p_succ_txt').innerHTML = `Cleared ${k.length} cached Mii${k.length !== 1 ? 's' : ''}.`;
      p_on('p_succ', 'success');
    }, 550);
  } catch(e) { p_off(); setTimeout(() => err('Could not clear cache.'), 550); }
}

window.addEventListener('beforeunload', () => {
  try {
    const s = JSON.parse(localStorage.getItem('mii_settings') || '{}');
    if (s.autoclear) Object.keys(localStorage).filter(k => k.startsWith(cp)).forEach(k => localStorage.removeItem(k));
  } catch(e) {}
});

// audio
const s_dn = '/assets/sounds/se_button_select_sink.mp3',
      s_up = '/assets/sounds/se_button_orange_decide_small.mp3',
      s_tg = '/assets/sounds/se_button_orange_decide.mp3', // switch
      s_pop = '/assets/sounds/se_appear_dialog_normal.mp3', // regular
      s_pop_succ = '/assets/sounds/se_appear_dialog_check.mp3', // success
      s_pop_err = '/assets/sounds/se_appear_dialog_alert.mp3', // error
      s_day = '/assets/audio/BGM_MiiWatch_Normal_Day.mp3',
      s_night = '/assets/audio/BGM_MiiWatch_Normal_Night.mp3';

const a_dn = new Audio(s_dn), a_up = new Audio(s_up), a_tg = new Audio(s_tg), a_pop = new Audio(s_pop),
      a_pop_succ = new Audio(s_pop_succ), a_pop_err = new Audio(s_pop_err), bgm = new Audio();

a_dn.preload = a_up.preload = a_tg.preload = a_pop.preload = a_pop_succ.preload = a_pop_err.preload = bgm.preload = 'auto';
bgm.loop = true;

let t_touch = 0, skip_up = false;

const sd = (e) => {
  if (!s_on()) return;
  if (e && e.type === 'touchstart') t_touch = Date.now();
  if (e && e.type === 'mousedown' && Date.now() - t_touch < 500) return;
  const snd = a_dn.cloneNode();
  snd.play().catch(()=>{});
};

const su = (e) => {
  if (!s_on()) return;
  if (e && e.type === 'mouseup' && Date.now() - t_touch < 500) return;
  if (skip_up) return;
  const snd = a_up.cloneNode();
  snd.play().catch(()=>{});
};

function sp(type) {
  if (!s_on()) return;
  skip_up = true;
  setTimeout(() => { skip_up = false; }, 500);
  let p = a_pop;
  if (type === 'success') p = a_pop_succ;
  else if (type === 'error') p = a_pop_err;
  const snd = p.cloneNode();
  snd.play().catch(()=>{});
}

function p_bgm() {
  const h = new Date().getHours();
  bgm.src = (h >= 6 && h < 18) ? s_day : s_night;
  bgm.volume = document.getElementById('set_bgm')?.checked !== false ? 1 : 0;
  bgm.play().catch(() => {
    const ib = () => { bgm.play().catch(()=>{}); window.removeEventListener('click', ib); window.removeEventListener('keydown', ib); };
    window.addEventListener('click', ib); window.addEventListener('keydown', ib);
  });
}

function at_s(el) {
  el.addEventListener('mousedown', sd); el.addEventListener('touchstart', sd, { passive: true });
  el.addEventListener('mouseup', su); el.addEventListener('touchend', su, { passive: true });
}

function at_tg(el) {
  el.addEventListener('change', () => {
    if (!s_on()) return;
    const snd = a_tg.cloneNode();
    snd.play().catch(()=>{});
  });
}

// popups
let act_pop = null;

function p_on(id, type = 'normal') {
  if (act_pop) document.getElementById(act_pop).classList.remove('act');
  act_pop = id;
  document.getElementById('ov').classList.add('act');
  document.getElementById(id).classList.add('act');
  if (type === 'normal') {
    if (id === 'p_succ' || id === 'p_dl_succ') type = 'success';
    else if (id === 'p_err' || id === 'p_off') type = 'error';
  }
  if (id === 'p_settings') u_cc();
  sp(type);
}

function p_off() {
  if (act_pop) { document.getElementById(act_pop).classList.remove('act'); act_pop = null; }
  document.getElementById('ov').classList.remove('act');
}

const off = () => p_on('p_off', 'error');
function err(h) { document.getElementById('p_err_txt').innerHTML = h; p_on('p_err', 'error'); }

document.getElementById('ov').addEventListener('click', p_off);

// storage
const cp = 'mii_cache_';
const c_g = u => { try { const v = localStorage.getItem(cp + u); return v ? JSON.parse(v) : null; } catch(e) { return null; } };
function c_s(u, o) {
  try { localStorage.setItem(cp + u, JSON.stringify(o)); }
  catch(e) {
    try { Object.keys(localStorage).filter(k => k.startsWith(cp)).forEach(k => localStorage.removeItem(k)); localStorage.setItem(cp + u, JSON.stringify(o)); } catch(e2) {}
  }
}

// mii image validation
const min = 4;
const g_dm = s => new Promise((res, rej) => {
  const i = new Image();
  i.onload = () => res({ w: i.naturalWidth, h: i.naturalHeight });
  i.onerror = () => rej(new Error('bad_image'));
  i.src = s;
});

async function v_im(b) {
  const { w, h } = await g_dm(b);
  if (w <= min || h <= min) throw new Error('not_found');
}

let s_b64 = null, s_uid = null, st_tm = null;

function s_m(b, u, n, c) {
  s_b64 = b; s_uid = u;
  document.getElementById('m_img').src = b;
  document.getElementById('n_lbl').textContent = n || 'N/A';
  document.getElementById('u_lbl').textContent = u;
  document.getElementById('c_lbl').textContent = c ? '(loaded from local cache)' : '';
  document.getElementById('pv').style.display = 'block';
  
  const st = document.getElementById('st');
  st.style.opacity = '1'; st.innerHTML = '<font color="green">Loaded successfully!</font>';

  if (st_tm) clearTimeout(st_tm);
  st_tm = setTimeout(() => {
    st.style.opacity = '0';
    setTimeout(() => { if (st.style.opacity === '0') st.innerHTML = ''; }, 500);
  }, 3000);

  try { if (document.getElementById('set_remember')?.checked) localStorage.setItem('mii_last_uid', u); } catch(e) {}
  document.getElementById('p_succ_txt').innerHTML = 'Your Mii image was loaded successfully and is ready to preview.';
  p_on('p_succ', 'success');
}

// load mii
async function l_m() {
  const u = document.getElementById('uid').value.trim();

  if (!navigator.onLine) {
    const cached = c_g(u);
    if (cached && u && /^[a-zA-Z0-9]+$/.test(u)) { s_m(cached.img, u, cached.name, true); return; }
    off(); return;
  }

  if (!u) { err('Please enter a User ID before loading a Mii.'); return; }
  if (!/^[a-zA-Z0-9]+$/.test(u)) { err('The User ID contains invalid characters.<br><br>Only letters and numbers are allowed.'); return; }

  const cached = c_g(u);
  if (cached) {
    document.getElementById('pv').style.display = 'none';
    s_b64 = null;
    s_m(cached.img, u, cached.name, true);
    return;
  }

  const now = Date.now();
  const diff = now - last_fetch_time;
  if (diff < 5000) {
    const rem = Math.ceil((5000 - diff) / 1000);
    err(`Please wait ${rem} second${rem !== 1 ? 's' : ''} before loading another User ID.`);
    return;
  }

  last_fetch_time = now;

  document.getElementById('pv').style.display = 'none';
  const st = document.getElementById('st');
  st.style.opacity = '1'; 
  st.innerHTML = dotLoaderHTML; 
  s_b64 = null;

  try {
    const res = await fetch(`https://api.tomiimo.online/${encodeURIComponent(u)}`);
    if (!res.ok) { err(`User ID not found.<br><br><span style="font-size:14px; color:#999;">HTTP ${res.status}</span>`); st.innerHTML = ''; return; }

    const data = await res.json();
    if (!data || !data.head_image) { err('The API did not return valid Mii data.<br><br>Double-check your User ID and try again.'); st.innerHTML = ''; return; }

    const imgRes = await fetch(data.head_image);
    if (!imgRes.ok) { err('Failed to load Mii head image.'); st.innerHTML = ''; return; }

    const blob = await imgRes.blob();
    const base64 = await b_b(blob);
    await v_im(base64);

    const co = { name: data.name || 'N/A', img: base64 };
    c_s(u, co); s_m(base64, u, co.name, false);
  } catch (e) {
    st.innerHTML = '';
    if (!navigator.onLine) off();
    else if (e.message === 'not_found') err('User ID not found.<br><br>Make sure you copied it correctly.');
    else if (e.message === 'bad_image') err('The image data was invalid or corrupted.<br><br>Try again in a moment.');
    else err(`Something went wrong.<br><br><span style="font-size:14px; color:#999;">${e.message}</span>`);
  }
}

const b_b = b => new Promise((res, rej) => {
  const r = new FileReader();
  r.onloadend = () => res(r.result);
  r.onerror = () => rej(new Error('Failed to read image data'));
  r.readAsDataURL(b);
});

// save mii
function sv_m() {
  if (!s_b64) return;
  const a = document.createElement('a');
  a.href = s_b64; a.download = `mii_${s_uid}.png`; a.click();
  p_on('p_dl_succ', 'success');
}

// init
document.addEventListener('DOMContentLoaded', () => {
  const ls = document.getElementById('ls');

  ld_s();

  const f = [
    new FontFace('Miitomo', "url('/assets/font/SeuratPro-B.otf') format('truetype')"),
    new FontFace('Message', "url('/assets/font/FOT-Seurat%20Pro%20M.otf') format('truetype')"),
  ];

  Promise.allSettled(f.map(x => x.load().then(ld => document.fonts.add(ld))))
    .then(() => {
      setTimeout(() => { 
        ls.classList.add('fade-out'); 
        p_bgm();
        setTimeout(() => { ls.style.display = 'none'; }, 520); 
      }, 500);
    });

  const clk = 'input[type="button"], #btn_back, .cl-btn';
  const tg_sel = '.tg input';

  document.querySelectorAll(clk).forEach(at_s);
  document.querySelectorAll(tg_sel).forEach(at_tg);

  new MutationObserver(ml => {
    ml.forEach(m => m.addedNodes.forEach(n => {
      if (n.nodeType === 1) {
        if (n.matches(clk)) at_s(n);
        if (n.matches(tg_sel)) at_tg(n);
        if (n.querySelectorAll) {
          n.querySelectorAll(clk).forEach(at_s);
          n.querySelectorAll(tg_sel).forEach(at_tg);
        }
      }
    }));
  }).observe(document.body, { childList: true, subtree: true });

  document.getElementById('uid').addEventListener('keydown', e => { if (e.key === 'Enter') l_m(); });

  try {
    const s = JSON.parse(localStorage.getItem('mii_settings') || '{}');
    if (s.remember) { const lu = localStorage.getItem('mii_last_uid'); if (lu) document.getElementById('uid').value = lu; }
    if (s.url) { const uu = new URLSearchParams(location.search).get('uid'); if (uu) { document.getElementById('uid').value = uu; setTimeout(l_m, 900); } }
  } catch(e) {}

  if (!navigator.onLine) off();
  window.addEventListener('offline', off);
});
