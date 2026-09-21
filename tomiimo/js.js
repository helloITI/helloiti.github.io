const dl_h = '<div class="dl"><span></span><span></span><span></span></div>';
let l_ft = 0;
let s_v = 1, b_v = 1;

//idkkkk
function is_night() {
  const h = new Date().getHours();
  return h >= 20 || h < 7;
}

//light/dark theme depending on timezone
function tg_autodark() {
  const auto = document.getElementById('set_autodark')?.checked;
  if (!auto) return;
  const dark = is_night();
  document.body.classList.toggle('dark', dark);
  document.getElementById('set_dark').checked = dark;
}

// ok
function showToast(message) {
  document.getElementById('p_succ_txt').innerHTML = message;
  p_on('p_succ', 'success');
}

// settings
function ld_s() {
  try {
    const s = JSON.parse(localStorage.getItem('mii_settings') || '{}');
    if (s.dark) { document.body.classList.add('dark'); document.getElementById('set_dark').checked = true; }
    if (s.cursor === false) { document.body.classList.add('nc'); document.getElementById('set_cursor').checked = false; }
    if (s.accent) { document.getElementById('set_accent').value = s.accent; chg_accent(); }
    if (s.changelog === false) document.getElementById('set_changelog').checked = false;
    if (s.sfx === false) document.getElementById('set_sfx').checked = false;
    if (s.bgm === false) document.getElementById('set_bgm').checked = false;
    if (s.sfx_vol !== undefined) { s_v = s.sfx_vol; document.getElementById('set_sfx_vol').value = s.sfx_vol; }
    if (s.bgm_vol !== undefined) { b_v = s.bgm_vol; document.getElementById('set_bgm_vol').value = s.bgm_vol; }
    if (s.bgm_mode) document.getElementById('set_bgm_mode').value = s.bgm_mode;
    if (s.remember) document.getElementById('set_remember').checked = true;
    if (s.url && document.getElementById('set_url')) document.getElementById('set_url').checked = true;
    if (s.autocopy) document.getElementById('set_autocopy').checked = true;
    if (s.autodownload) document.getElementById('set_autodownload').checked = true;
    if (s.autoclear) document.getElementById('set_autoclear').checked = true;
    if (s.autodark) { document.getElementById('set_autodark').checked = true; tg_autodark(); }
  } catch(e) {}
}

function sv_s() {
  try {
    const s = {
      dark: document.getElementById('set_dark').checked,
      cursor: document.getElementById('set_cursor').checked,
      accent: document.getElementById('set_accent').value,
      changelog: document.getElementById('set_changelog').checked,
      sfx: document.getElementById('set_sfx').checked,
      bgm: document.getElementById('set_bgm').checked,
      sfx_vol: parseFloat(document.getElementById('set_sfx_vol').value),
      bgm_vol: parseFloat(document.getElementById('set_bgm_vol').value),
      bgm_mode: document.getElementById('set_bgm_mode').value,
      remember: document.getElementById('set_remember').checked,
      url: document.getElementById('set_url')?.checked ?? false,
      autocopy: document.getElementById('set_autocopy').checked,
      autodownload: document.getElementById('set_autodownload').checked,
      autoclear: document.getElementById('set_autoclear').checked,
      autodark: document.getElementById('set_autodark').checked,
    };
    localStorage.setItem('mii_settings', JSON.stringify(s));
  } catch(e) {}
}

const tg_d = () => { document.body.classList.toggle('dark', document.getElementById('set_dark').checked); sv_s(); };
const tg_cursor = () => { document.body.classList.toggle('nc', !document.getElementById('set_cursor').checked); sv_s(); };

function chg_accent() {
  const col = document.getElementById('set_accent').value;
  const darks = {
    '#2596be': '#176580',
    '#FF9A18': '#a86000',
    '#4CAF50': '#2e7d32',
    '#e91e63': '#ad1457',
    '#fbc02d': '#c79100',
    '#9c27b0': '#6a1b9a',
    '#f44336': '#b71c1c',
    '#ff5722': '#bf360c',
    '#ffeb3b': '#b8a000',
    '#8bc34a': '#558b2f',
    '#009688': '#00695c',
    '#00bcd4': '#00838f',
    '#3f51b5': '#283593',
    '#673ab7': '#4527a0',
    '#ff4081': '#c51162',
    '#795548': '#4e342e',
    '#607d8b': '#37474f'
  };
  document.documentElement.style.setProperty('--accent-color', col);
  document.documentElement.style.setProperty('--accent-dark', darks[col] || col);
  sv_s();
}

function u_vol() {
  s_v = parseFloat(document.getElementById('set_sfx_vol').value);
  b_v = parseFloat(document.getElementById('set_bgm_vol').value);
  if (bgm) bgm.volume = document.getElementById('set_bgm')?.checked !== false ? b_v : 0;
  sv_s();
}

const tg_b = () => { bgm.volume = document.getElementById('set_bgm').checked ? b_v : 0; sv_s(); };
const s_on = () => document.getElementById('set_sfx')?.checked !== false;

function play_sfx(audioObj) {
  if (!s_on()) return;
  const snd = audioObj.cloneNode();
  snd.volume = s_v;
  snd.play().catch(()=>{});
}

function show_warn(txt, cb) {
  document.getElementById('p_warn_txt').innerHTML = txt;
  const btn = document.getElementById('p_warn_btn');
  btn.onclick = () => {
    p_off();
    cb();
  };
  p_on('p_warn', 'warn');
}

function rst_s() {
  show_warn('Are you sure you want to reset all settings to default?', () => {
    localStorage.removeItem('mii_settings');
    document.getElementById('set_dark').checked = false;
    document.getElementById('set_cursor').checked = true;
    document.getElementById('set_changelog').checked = true;
    document.getElementById('set_sfx').checked = true;
    document.getElementById('set_bgm').checked = true;
    document.getElementById('set_sfx_vol').value = 1;
    document.getElementById('set_bgm_vol').value = 1;
    document.getElementById('set_bgm_mode').value = 'auto';
    document.getElementById('set_accent').value = '#2596be';
    document.getElementById('set_remember').checked = false;
    if (document.getElementById('set_url')) document.getElementById('set_url').checked = false;
    document.getElementById('set_autoclear').checked = false;
    document.getElementById('set_autocopy').checked = false;
    document.getElementById('set_autodownload').checked = false;

    tg_d();
    tg_cursor();
    chg_accent();
    u_vol();
    chg_bgm_mode();

    setTimeout(() => {
      document.getElementById('p_succ_txt').innerHTML = 'Settings reset to default values.';
      p_on('p_succ', 'success');
    }, 400);
  });
}

// cache
const g_cc = () => { try { return Object.keys(localStorage).filter(k => k.startsWith(cp)).length; } catch(e) { return 0; } };

const u_cc = () => {
  const l = document.getElementById('cl');
  const list = document.getElementById('cl_list');
  const query = (document.getElementById('cl_search')?.value || '').toLowerCase().trim();
  if (l) l.innerHTML = `Cached Miis: <b>${g_cc()}</b>`;
  if (!list) return;

  list.innerHTML = '';
  const sort = document.getElementById('cl_sort')?.value || 'newest';
let keys = Object.keys(localStorage).filter(k => k.startsWith(cp));
keys.sort((a, b) => {
  const ia = c_g(a.replace(cp, ''));
  const ib = c_g(b.replace(cp, ''));
  if (sort === 'newest') return (ib?.cachedAt || 0) - (ia?.cachedAt || 0);
  if (sort === 'oldest') return (ia?.cachedAt || 0) - (ib?.cachedAt || 0);
  if (sort === 'name_az') return (ia?.name || '').localeCompare(ib?.name || '');
  if (sort === 'name_za') return (ib?.name || '').localeCompare(ia?.name || '');
  return 0;
});
  if (keys.length === 0) {
    list.innerHTML = '<div style="font-size:13px; color:#aaa; padding:6px;">No cached Miis</div>';
    return;
  }

  let matches = 0;
  keys.forEach(k => {
    const uid = k.replace(cp, '');
    const item = c_g(uid);
    if (!item) return;

    if (query) {
      const nameMatch = (item.name || '').toLowerCase().includes(query);
      const uidMatch = uid.toLowerCase().includes(query);
      if (!nameMatch && !uidMatch) return;
    }

    matches++;
    const div = document.createElement('div');
    div.className = 'cli';
    const escapedName = (item.name || 'N/A').replace(/'/g, "\\'");
    div.innerHTML = `
      <div class="cnf" onclick="ld_c_mii('${uid}')" title="Click to load">
        <img class="cim" src="${item.img}" alt="" onclick="show_mii_img_pop('${item.img}', '${escapedName}', '${uid}', event)" title="Click to preview image" />
        <div class="ctx">
          <div class="cnm">${item.name || 'N/A'}</div>
          <div class="cud">${uid}${item.cachedAt ? ` · ${time_ago(item.cachedAt)}` : ''}</div>
        </div>
      </div>
      <div class="cbt">
        <button class="cbn crf" onclick="ref_c_mii('${uid}', event)" title="Refresh Mii from API">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
          </svg>
        </button>
        <button class="cbn cdl" onclick="del_c_mii('${uid}')" title="Delete from cache">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `;
    list.appendChild(div);
  });

  if (query && matches === 0) {
    list.innerHTML = '<div style="font-size:13px; color:#aaa; padding:6px;">No matching Miis found</div>';
  }
};

// history
const hp = 'mii_history';
const max_h = 10;

function g_h() {
  try { return JSON.parse(localStorage.getItem(hp) || '[]'); } catch(e) { return []; }
}

function add_h(uid) {
  try {
    let h = g_h().filter(x => x !== uid);
    h.unshift(uid);
    if (h.length > max_h) h = h.slice(0, max_h);
    localStorage.setItem(hp, JSON.stringify(h));
  } catch(e) {}
}

function clr_h() {
  show_warn('Are you sure you want to clear your UID history?', () => {
    try {
      localStorage.removeItem(hp);
      u_hl();
      setTimeout(() => {
        document.getElementById('p_succ_txt').innerHTML = 'UID history cleared.';
        p_on('p_succ', 'success');
      }, 400);
    } catch(e) {}
  });
}

function u_hl() {
  const h = g_h();
  const lbl = document.getElementById('hl');
  const list = document.getElementById('hl_list');
  if (lbl) lbl.innerHTML = `Recent UIDs: <b>${h.length}</b>`;
  if (!list) return;

  list.innerHTML = '';
  if (h.length === 0) {
    list.innerHTML = '<div style="font-size:13px; color:#aaa; padding:6px;">No history yet</div>';
    return;
  }

h.forEach(uid => {
    const cached = c_g(uid);
    const name = cached ? (cached.name || 'N/A') : null;
    const img = cached ? cached.img : null;
    const escapedName = name ? name.replace(/'/g, "\\'") : null;

    const div = document.createElement('div');
    div.className = 'cli';
    div.innerHTML = `
      <div class="cnf" onclick="ld_h_uid('${uid}')" title="Click to load">
        ${img ? `<img class="cim" src="${img}" alt="" onclick="show_mii_img_pop('${img}', '${escapedName}', '${uid}', event)" title="Click to preview image" />` : `<div class="cim" style="display:flex;align-items:center;justify-content:center;font-size:16px;color:#fff;">?</div>`}
        <div class="ctx">
          ${name ? `<div class="cnm">${name}</div>` : ''}
          <div class="cud">${uid}</div>
        </div>
      </div>
      <button class="cbn cdl" onclick="del_h_uid('${uid}')" title="Remove from history">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;
    list.appendChild(div);
  });
}

function ld_h_uid(uid) {
  document.getElementById('uid').value = uid;
  p_off();
  l_m();
}

function del_h_uid(uid) {
  try {
    const h = g_h().filter(x => x !== uid);
    localStorage.setItem(hp, JSON.stringify(h));
    u_hl();
  } catch(e) {}
}
//

function show_mii_img_pop(imgUrl, name, uid, event) {
  if (event) event.stopPropagation();
  play_sfx(a_t);
  document.getElementById('p_img_src').src = imgUrl;
  document.getElementById('p_img_name').textContent = name || 'Mii Preview';
  document.getElementById('p_img_uid').textContent = uid ? `${uid}` : '';
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
  const diff = now - l_ft;
  if (diff < 5000) {
    const rem = Math.ceil((5000 - diff) / 1000);
    err(`Please wait ${rem} second${rem !== 1 ? 's' : ''} before refreshing from the API.`, '801-0020-0001');
    return;
  }

  const btn = event ? event.target.closest('.cbn') : null;
  if (btn) { btn.disabled = true; btn.style.opacity = '0.5'; }

  try {
    l_ft = Date.now();
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

    if (s_u === uid) {
      s_m(base64, uid, co.name, true);
    } else {
      u_cc();
    }
    showToast("Mii refreshed successfully!");
  } catch(e) {
    err(`Failed to refresh cached Mii.<br><br><span style="font-size:14px; color:#999;">${e.message}</span>`, '801-0021-0001');
  } finally {
    if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
  }
}

function del_c_mii(uid) {
  const item = c_g(uid);
  const name = item ? (item.name || uid) : uid;
  show_warn(`Are you sure you want to delete <span style="font-family:'Miitomo'">${name}</span> from cache?`, () => {
    try {
      localStorage.removeItem(cp + uid);
      u_cc();
      setTimeout(() => {
        document.getElementById('p_del_succ_txt').innerHTML = `<span style="font-family:'Miitomo'">${name}</span> was removed from cache.`;
        p_on('p_del_succ', 'success');
      }, 400);
    } catch(e) {}
  });
}

function clr_c() {
  const count = g_cc();
  if (count === 0) { p_off(); setTimeout(() => err('No cached Miis to clear.', '801-0030-0001'), 400); return; }
  show_warn(`Are you sure you want to delete all <b>${count}</b> cached Miis?`, () => {
    try {
      const k = Object.keys(localStorage).filter(x => x.startsWith(cp));
      k.forEach(x => localStorage.removeItem(x));
      u_cc();
      showToast(`Cleared ${k.length} cached Mii(s)!`);
    } catch(e) { setTimeout(() => err('Could not clear cache.', '801-0031-0001'), 400); }
  });
}

function exp_c() {
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(cp));
    if (keys.length === 0) { p_off(); setTimeout(() => err('No cached Miis to export.', '801-0040-0001'), 400); return; }
    
    const data = {};
    keys.forEach(k => {
      const uid = k.replace(cp, '');
      data[uid] = c_g(uid);
    });

    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tomiimo_mii_cache_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    p_off();
    showToast(`Exported ${keys.length} cached Mii(s)!`);
  } catch(e) {
    p_off(); setTimeout(() => err('Failed to export cache.', '801-0041-0001'), 400);
  }
}

function imp_c() {
  document.getElementById('p_warn_txt').innerHTML = 'Importing a JSON file will <b>add or overwrite</b> cached Miis.<br><br>Make sure you trust the file before importing.';
  document.getElementById('p_warn_btn').onclick = () => { p_off(); setTimeout(() => document.getElementById('imp_file').click(), 300); };
  p_on('p_warn', 'warn');
}

function imp_c_file(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const data = JSON.parse(evt.target.result);
      if (typeof data !== 'object' || data === null) throw new Error('Invalid JSON format');
      
      let count = 0;
      Object.keys(data).forEach(uid => {
        if (data[uid] && data[uid].img) {
          c_s(uid, { name: data[uid].name || 'N/A', img: data[uid].img });
          count++;
        }
      });

      u_cc();
      p_off();
      showToast(`Successfully imported ${count} Mii(s)!`);
    } catch(err_e) {
      p_off();
      setTimeout(() => err('Failed to import.<br><br><span style="font-size:14px; color:#999;">Invalid or corrupted JSON file.</span>', '801-0042-0001'), 400);
    } finally {
      e.target.value = '';
    }
  };
  reader.readAsText(file);
}

window.addEventListener('beforeunload', () => {
  try {
    const s = JSON.parse(localStorage.getItem('mii_settings') || '{}');
    if (s.autoclear) Object.keys(localStorage).filter(k => k.startsWith(cp)).forEach(k => localStorage.removeItem(k));
  } catch(e) {}
});

// audio
const sd_p = '/assets/sounds/se_button_select_sink.mp3',
      su_p = '/assets/sounds/se_button_orange_decide_small.mp3',
      st_p = '/assets/sounds/se_button_orange_decide.mp3',
      sp_p = '/assets/sounds/se_appear_dialog_normal.mp3',
      ss_p = '/assets/sounds/se_appear_dialog_check.mp3',
      se_p = '/assets/sounds/se_appear_dialog_alert.mp3',
      sw_p = '/assets/sounds/se_appear_dialog_answer.mp3',
      sd_m = '/assets/audio/BGM_MiiWatch_Normal_Day.mp3',
      sn_m = '/assets/audio/BGM_MiiWatch_Normal_Night.mp3';

const a_d = new Audio(sd_p), a_u = new Audio(su_p), a_t = new Audio(st_p), a_po = new Audio(sp_p),
      a_ps = new Audio(ss_p), a_pe = new Audio(se_p), a_pw = new Audio(sw_p), bgm = new Audio();

a_d.preload = a_u.preload = a_t.preload = a_po.preload = a_ps.preload = a_pe.preload = a_pw.preload = bgm.preload = 'auto';
bgm.loop = true;

let t_t = 0, sk_u = false;

const sd = (e) => {
  if (e && e.type === 'touchstart') t_t = Date.now();
  if (e && e.type === 'mousedown' && Date.now() - t_t < 500) return;
  play_sfx(a_d);
};

const su = (e) => {
  if (e && e.type === 'mouseup' && Date.now() - t_t < 500) return;
  if (sk_u) return;
  play_sfx(a_u);
};

function sp(type) {
  sk_u = true;
  setTimeout(() => { sk_u = false; }, 500);
  let p = a_po;
  if (type === 'success') p = a_ps;
  else if (type === 'error') p = a_pe;
  else if (type === 'warn') p = a_pw;
  play_sfx(p);
}

function p_bgm() {
  if (!bgm.paused) return;
  const mode = document.getElementById('set_bgm_mode')?.value || 'auto';
  let useNight = false;
  if (mode === 'day') useNight = false;
  else if (mode === 'night') useNight = true;
  else {
    const h = new Date().getHours();
    useNight = (h < 6 || h >= 18);
  }
  bgm.src = useNight ? sn_m : sd_m;
  bgm.volume = document.getElementById('set_bgm')?.checked !== false ? b_v : 0;
  bgm.play().catch(() => {
    const ib = () => { bgm.play().catch(()=>{}); window.removeEventListener('click', ib); window.removeEventListener('keydown', ib); };
    window.addEventListener('click', ib); window.addEventListener('keydown', ib);
  });
}

function chg_bgm_mode() {
  if (!bgm.paused) {
    bgm.pause();
  }
  p_bgm();
  sv_s();
}

function at_s(el) {
  el.addEventListener('mousedown', sd); el.addEventListener('touchstart', sd, { passive: true });
  el.addEventListener('mouseup', su); el.addEventListener('touchend', su, { passive: true });
}

function at_tg(el) {
  el.addEventListener('change', () => {
    play_sfx(a_t);
  });
}

// popups
let ap_id = null;

function p_on(id, type = 'normal') {
  if (ap_id) document.getElementById(ap_id).classList.remove('act');
  ap_id = id;
  document.getElementById('ov').classList.add('act');
  document.getElementById(id).classList.add('act');
  if (type === 'normal') {
    if (id === 'p_succ' || id === 'p_dl_succ') type = 'success';
    else if (id === 'p_err' || id === 'p_offline') type = 'error';
    else if (id === 'p_warn') type = 'warn';
  }
  if (id === 'p_settings') { u_cc(); u_hl(); }
  sp(type);
}

function p_off() {
  if (ap_id) { document.getElementById(ap_id).classList.remove('act'); ap_id = null; }
  document.getElementById('ov').classList.remove('act');
}

const off = () => p_on('p_offline', 'error');
function err(h, code) {
  document.getElementById('p_err_txt').innerHTML = h;
  document.getElementById('p_err_code').textContent = code ? `(Support code: ${code})` : '';
  p_on('p_err', 'error');
}

// storage
const cp = 'mii_cache_';
const c_g = u => { try { const v = localStorage.getItem(cp + u); return v ? JSON.parse(v) : null; } catch(e) { return null; } };
function c_s(u, o) {
  try { 
    if (!o.cachedAt) o.cachedAt = Date.now();
    localStorage.setItem(cp + u, JSON.stringify(o)); 
  }
  catch(e) {
    try { Object.keys(localStorage).filter(k => k.startsWith(cp)).forEach(k => localStorage.removeItem(k)); localStorage.setItem(cp + u, JSON.stringify(o)); } catch(e2) {}
  }
}

//time_ago
function time_ago(ts) {
  if (!ts) return '';
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) { const m = Math.floor(diff / 60); return `${m}m ago`; }
  if (diff < 86400) { const h = Math.floor(diff / 3600); return `${h}h ago`; }
  const d = Math.floor(diff / 86400);
  return `${d}d ago`;
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

let s_b = null, s_u = null, s_tm = null;

function s_m(b, u, n, c) {
  s_b = b; s_u = u;
  document.getElementById('m_img').src = b;
  document.getElementById('n_lbl').textContent = n || 'N/A';
  document.getElementById('u_lbl').textContent = u;
  document.getElementById('c_lbl').textContent = c ? '(loaded from local cache)' : '';
  document.getElementById('pv').style.display = 'block';

  const st = document.getElementById('st');
  st.style.opacity = '1'; st.innerHTML = '<font color="green">Loaded successfully!</font>';

  if (s_tm) clearTimeout(s_tm);
  s_tm = setTimeout(() => {
    st.style.opacity = '0';
    setTimeout(() => { if (st.style.opacity === '0') st.innerHTML = ''; }, 500);
  }, 3000);

  add_h(u);
  try { if (document.getElementById('set_remember')?.checked) localStorage.setItem('mii_last_uid', u); } catch(e) {}

  const _autocp = document.getElementById('set_autocopy')?.checked;
  const _autodl = document.getElementById('set_autodownload')?.checked;

  if (_autocp && _autodl) {
    document.getElementById('p_succ_txt').innerHTML = 'Your Mii image was loaded, saved to your device, and copied to clipboard!';
    p_on('p_succ', 'success');
  } else if (_autocp) {
    document.getElementById('p_succ_txt').innerHTML = 'Your Mii image was loaded and copied to clipboard!';
    p_on('p_succ', 'success');
  } else if (_autodl) {
    document.getElementById('p_succ_txt').innerHTML = 'Your Mii image was loaded and saved to your device!';
    p_on('p_succ', 'success');
  } else {
    document.getElementById('p_succ_txt').innerHTML = 'Your Mii image was loaded successfully and is ready to preview.';
    p_on('p_succ', 'success');
  }

  if (_autodl) sv_m();
  if (_autocp) cp_m();
}

// load mii
async function l_m() {
  const u = document.getElementById('uid').value.trim();

  if (!navigator.onLine) {
    const cached = c_g(u);
    if (cached && u && /^[a-zA-Z0-9]+$/.test(u)) { s_m(cached.img, u, cached.name, true); return; }
    off(); return;
  }

  if (!u) { err('Please enter a User ID before loading a Mii.', '801-0010-0001'); return; }
  if (!/^[a-zA-Z0-9]+$/.test(u)) { err('The User ID contains invalid characters.<br><br>Only letters and numbers are allowed.', '801-0011-0001'); return; }

  const cached = c_g(u);
  if (cached) {
    document.getElementById('pv').style.display = 'none';
    s_b = null;
    s_m(cached.img, u, cached.name, true);
    return;
  }

  const now = Date.now();
  const diff = now - l_ft;
  if (diff < 5000) {
    const rem = Math.ceil((5000 - diff) / 1000);
    err(`Please wait ${rem} second${rem !== 1 ? 's' : ''} before loading another User ID.`, '801-0012-0001');
    return;
  }

  l_ft = now;

  document.getElementById('pv').style.display = 'none';
  const st = document.getElementById('st');
  st.style.opacity = '1'; 
  st.innerHTML = dl_h; 
  s_b = null;

  try {
    const res = await fetch(`https://api.tomiimo.online/${encodeURIComponent(u)}`);
    if (!res.ok) { err(`User ID not found.<br><br><span style="font-size:14px; color:#999;">HTTP ${res.status}</span>`, '801-0013-0001'); st.innerHTML = ''; return; }

    const data = await res.json();
    if (!data || !data.head_image) { err('The API did not return valid Mii data.<br><br>Double-check your User ID and try again.', '801-0014-0001'); st.innerHTML = ''; return; }

    const imgRes = await fetch(data.head_image);
    if (!imgRes.ok) { err('Failed to load Mii head image.', '801-0015-0001'); st.innerHTML = ''; return; }

    const blob = await imgRes.blob();
    const base64 = await b_b(blob);
    await v_im(base64);

    const co = { name: data.name || 'N/A', img: base64 };
    c_s(u, co); s_m(base64, u, co.name, false);
  } catch (e) {
    st.innerHTML = '';
    if (!navigator.onLine) off();
    else if (e.message === 'not_found') err('User ID not found.<br><br>Make sure you copied it correctly.', '801-0016-0001');
    else if (e.message === 'bad_image') err('The image data was invalid or corrupted.<br><br>Try again in a moment.', '801-0017-0001');
    else err(`Something went wrong.<br><br><span style="font-size:14px; color:#999;">${e.message}</span>`, '801-0018-0001');
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
  if (!s_b) return;
  const a = document.createElement('a');
  a.href = s_b; a.download = `mii_${s_u}.png`; a.click();
}

// copy mii image to clipboard
async function cp_m() {
  if (!s_b) return;
  try {
    const res = await fetch(s_b);
    const blob = await res.blob();
    await navigator.clipboard.write([
      new ClipboardItem({ [blob.type]: blob })
    ]);
    showToast('Mii image copied to clipboard!');
  } catch(e) {
    err('Could not copy image.<br><br><span style="font-size:14px; color:#999;">Your browser may not support clipboard image writing.</span>', '801-0050-0001');
  }
}

// copy share link
function shr_m() {
  if (!s_u) return;
  const url = `${location.origin}${location.pathname}?uid=${encodeURIComponent(s_u)}`;
  navigator.clipboard.writeText(url)
    .then(() => p_on('p_shr_succ', 'success'))
    .catch(() => err('Could not copy link to clipboard.', '801-0051-0001'));
}

// check uid link
function chk_uid_url() {
  try {
    const uu = new URLSearchParams(location.search).get('uid');
    if (uu) { document.getElementById('uid').value = uu; setTimeout(l_m, 300); }
  } catch(e) {}
}

// init
document.addEventListener('DOMContentLoaded', () => {
  const ls = document.getElementById('ls');

  ld_s();

document.addEventListener('keydown', e => { if (e.key === 'Escape') p_off(); });

setInterval(() => { if (document.getElementById('set_autodark')?.checked) tg_autodark(); }, 60000);

  const f = [
    new FontFace('Miitomo', "url('/assets/font/SeuratPro-B.otf') format('truetype')"),
    new FontFace('Message', "url('/assets/font/FOT-Seurat%20Pro%20M.otf') format('truetype')"),
  ];
 
  Promise.allSettled(f.map(x => x.load().then(ld => document.fonts.add(ld))))
    .then(() => {
      setTimeout(() => {
        ls.classList.add('fade-out');
        setTimeout(() => {
          ls.style.display = 'none';
          const s = JSON.parse(localStorage.getItem('mii_settings') || '{}');
          if (s.changelog !== false) {
            setTimeout(() => p_on('p_changelog', 'normal'), 100);
          } else {
            p_bgm();
          }
        }, 520);
      }, 500);
    });

  // pause/resume bgm on mobile when user is not on the tab 
  document.addEventListener('visibilitychange', () => {
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (!isMobile) return;

    if (document.hidden) {
      bgm.pause();
    } else {
      if (document.getElementById('set_bgm')?.checked !== false) {
        bgm.play().catch(() => {});
      }
    }
  });

  const clk = 'input[type="button"], #btn_back, .cbn';
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
    if (s.url && s.changelog === false) { const uu = new URLSearchParams(location.search).get('uid'); if (uu) { document.getElementById('uid').value = uu; setTimeout(l_m, 900); } }
  } catch(e) {}

  if (!navigator.onLine) off();
  window.addEventListener('offline', off);
});
