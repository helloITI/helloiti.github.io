/*
helps the website load avatars, especially XML files
*/

const MAE_NS = "https://helloiti.github.io/mae/xml/avatar/1";
const OLD_NS = "http://www.myavatareditor.com/xml/avatar/1";

// defaultBoy
const DEFAULT_AVATAR = "000000640065006600610075006c00740042006f0079404080807f5fc242899800044240318028a2088c08401448b88d008a008a25040000000000000000000000000000000000000000";

const OUT_OF_RANGE = "clamp";

const FILE_DESCRIPTIONS = {
  allAvatars: "All avatar files",
  mae:        "MAE - My Avatar Editor format",
  mii:        "Mii - Wii Format",
  miigx:      "MiiGX - Wii Format",
  rcd:        "RCD - Wii Format",
  xml:        "XML - My Avatar Editor format",
};

// each format gets its own made-up type so browsers won't get confused
const FILE_TYPE_INFO = {
  mae:   { mime: "application/x-mae-avatar", ext: ".mae"   },
  mii:   { mime: "application/x-mii-wii",    ext: ".mii"   },
  miigx: { mime: "application/x-miigx-wii",  ext: ".miigx" },
  rcd:   { mime: "application/x-rcd-wii",    ext: ".rcd"   },
  xml:   { mime: "text/xml",                 ext: ".xml"   },
};

function fileType(key) {
  const t = FILE_TYPE_INFO[key];
  return { description: FILE_DESCRIPTIONS[key], accept: { [t.mime]: [t.ext] } };
}

function allAvatarsType() {
  const accept = {};
  for (const key of Object.keys(FILE_TYPE_INFO)) {
    const t = FILE_TYPE_INFO[key];
    accept[t.mime] = [t.ext];
  }
  return { description: FILE_DESCRIPTIONS.allAvatars, accept };
}

let maePlayer = null;
let lastSaved = DEFAULT_AVATAR;
let currentHex = DEFAULT_AVATAR;
let ignoreIntervalUntil = 0;
let appliedStart = false;
let loadToken = 0;

const ME_MS = 0;
const BATCH = 1000;
const STEP_MS = 0;
const SETTLE_MS = 30;

const LOAD_EXTS = /\.(rcd|mii|miigx|mae|xml)$/i;

function idgaf() {
  const params = new URLSearchParams(window.location.search);
  return params.get("avatar") || params.get("mii") || params.get("wii");
}
function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

function showInvalidFilePopup(msg) {
  alert(msg || "Invalid file.\nPlease use the valid file options.");
}

function cleanXML(text) {
  return text
    .replace(/^\uFEFF/, "")
    .replace(/<!DOCTYPE[^>]*>/gi, "")
    .replace(/<\?xml-stylesheet[^>]*\?>/gi, "")
    .split(OLD_NS).join(MAE_NS);
}

// xml fields
const XML_FIELDS = [
  ["", "id", "id", "hex", null], ["", "clientID", "clientID", "hex", null],
  ["", "name", "name", "str", 10], ["", "creatorName", "creatorName", "str", 10],
  ["", "birthDay", "birthDay", "int", 31], ["", "birthMonth", "birthMonth", "int", 12],
  ["", "gender", "gender", "int", 1], ["", "mingles", "mingles", "int", 1],
  ["Body", "height", "height", "int", 127], ["Body", "weight", "weight", "int", 127],
  ["Beard", "type", "beardType", "int", 3], ["Beard", "color", "beardColor", "color", 7],
  ["Eye", "type", "eyeType", "int", 47], ["Eye", "rotation", "eyeRotation", "int", 7],
  ["Eye", "color", "eyeColor", "color", 5], ["Eye", "size", "eyeSize", "int", 7],
  ["Eye", "x", "eyeX", "int", 12], ["Eye", "y", "eyeY", "int", 18],
  ["Eyebrow", "type", "eyebrowType", "int", 23], ["Eyebrow", "rotation", "eyebrowRotation", "int", 11],
  ["Eyebrow", "color", "eyebrowColor", "color", 7], ["Eyebrow", "size", "eyebrowSize", "int", 8],
  ["Eyebrow", "x", "eyebrowX", "int", 12], ["Eyebrow", "y", "eyebrowY", "int", 18],
  ["Face", "type", "faceType", "int", 11],
  ["Glasses", "type", "glassesType", "int", 8], ["Glasses", "color", "glassesColor", "color", 5],
  ["Glasses", "size", "glassesSize", "int", 7], ["Glasses", "y", "glassesY", "int", 20],
  ["Hair", "type", "hairType", "int", 71], ["Hair", "color", "hairColor", "color", 7],
  ["Hair", "part", "hairPart", "int", 1],
  ["Head", "type", "headType", "int", 7],
  ["Mole", "type", "moleType", "int", 1], ["Mole", "size", "moleSize", "int", 8],
  ["Mole", "x", "moleX", "int", 16], ["Mole", "y", "moleY", "int", 30],
  ["Mouth", "type", "mouthType", "int", 23], ["Mouth", "color", "mouthColor", "color", 2],
  ["Mouth", "size", "mouthSize", "int", 8], ["Mouth", "y", "mouthY", "int", 18],
  ["Mustache", "type", "mustacheType", "int", 3], ["Mustache", "size", "mustacheSize", "int", 8],
  ["Mustache", "y", "mustacheY", "int", 16],
  ["Nose", "type", "noseType", "int", 11], ["Nose", "size", "noseSize", "int", 8],
  ["Nose", "y", "noseY", "int", 18],
  ["Shirt", "color", "favoriteColor", "color", 11],
  ["Skin", "color", "skinColor", "color", 5],
];

function parseColor(s) {
  if (s.length <= 2) return parseInt(s, 10) || 0;
  let hex = false;
  if (s.indexOf("0x") === 0) { s = s.substr(2); hex = true; }
  if (s.indexOf("#") === 0) s = s.substr(1);
  s = s.toUpperCase();
  if (!hex && s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
  return parseInt(s, 16) || 0;
}

function fitRange(prop, value, max) {
  if (max == null || (value >= 0 && value <= max)) return value;
  if (OUT_OF_RANGE === "ignore") {
    console.warn("[xml] ignored out-of-range", prop, value, "(allowed 0-" + max + ")");
    return null;
  }
  const fixed = Math.min(Math.max(value, 0), max);
  console.warn("[xml] clamped", prop, value, "->", fixed, "(allowed 0-" + max + ")");
  return fixed;
}

function applyXmlToEditor(xmlText) {
  const p = maePlayer;
  if (!p || typeof p.setAvatarValue !== "function") {
    throw new Error("Editor not ready");
  }

  const doc = new DOMParser().parseFromString(cleanXML(xmlText).trim(), "text/xml");
  if (doc.querySelector("parsererror")) throw new Error("Invalid XML");

  const docRoot = doc.documentElement;
  let root = docRoot;
  if (root.localName.toLowerCase() !== "avatar") {
    root = [...doc.getElementsByTagName("*")].find(
      (e) => e.localName.toLowerCase() === "avatar"
    ) || null;
  }
  if (!root) {
    throw new Error("No <Avatar> element found on the XML. \n Are you sure this is a valid My Avatar Editor XML file?");
  }

  const child = (parent, tag) => {
    for (const c of parent.children) if (c.localName === tag) return c;
    return null;
  };

  const updates = [];
  for (const [group, tag, prop, kind, max] of XML_FIELDS) {
    const parent = group ? child(root, group) : root;
    const el = parent ? child(parent, tag) : null;
    if (!el) continue;
    const raw = el.textContent.trim();
    let value;

    if (kind === "str") {
      value = raw;
      if (max != null && value.length > max) {
        console.warn("[xml] shortened", prop, "to", max, "characters");
        value = value.slice(0, max);
      }
    } else {
      if (raw === "") continue;
      if (kind === "hex") {
        value = parseInt(raw, 16);
        if (Number.isNaN(value)) continue;
        value = value >>> 0; // 32-bit id
      } else if (kind === "color") {
        value = parseColor(raw);
        
        if (raw.length <= 2) {
          value = fitRange(prop, value, max);
          if (value === null) continue;
        }
      } else {
        value = parseInt(raw, 10);
        if (Number.isNaN(value)) continue;
        value = fitRange(prop, value, max);
        if (value === null) continue;
      }
    }
    updates.push([prop, value]);
  }

  const token = ++loadToken; // a newer load cancels this one
  appliedStart = true;
  let i = 0;

  function step() {
    if (token !== loadToken) return;
    const end = Math.min(i + BATCH, updates.length);
    for (; i < end; i++) {
      const [prop, value] = updates[i];
      try { p.setAvatarValue(prop, value); }
      catch (e) { console.warn("[xml] couldn't set", prop, e); }
    }
    if (i < updates.length) {
      setTimeout(step, STEP_MS);
      return;
    }

    setTimeout(() => {
      if (token !== loadToken) return;
      const hex = typeof p.getAvatarHex === "function" ? p.getAvatarHex() : null;
      if (!hex) return;
      console.log("[xml] applied", updates.length, "fields");
      currentHex = hex;
      lastSaved = hex;
      safeSet("avatar", hex);
      ignoreIntervalUntil = Date.now() + 1500;
      if (typeof p.setAvatarHex === "function") p.setAvatarHex(hex);
    }, SETTLE_MS);
  }
  step();
}

// myavatareditor.swf xml loader
(function () {
  const isCandidate = (b) => b && /\.xml$/i.test(b.name || "");
  const looksLikeXml = (text) => /^\uFEFF?\s*</.test(text);
  let timer = null;
  const schedule = (text) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      try {
        applyXmlToEditor(text);
      } catch (e) {
        console.error("[xml] apply failed:", e);
        showInvalidFilePopup("Invalid XML file: " + (e && e.message ? e.message : "Could not load file."));
      }
    }, ME_MS);
  };

  const origAB = Blob.prototype.arrayBuffer;
  Blob.prototype.arrayBuffer = async function () {
    const buf = await origAB.call(this);
    if (!isCandidate(this)) return buf;
    const text = new TextDecoder("utf-8").decode(buf);
    if (!looksLikeXml(text)) return buf;
    console.log("[xml patch] file read via arrayBuffer:", this.name);
    schedule(text);
    return new TextEncoder().encode(cleanXML(text)).buffer;
  };

  const origRead = FileReader.prototype.readAsArrayBuffer;
  FileReader.prototype.readAsArrayBuffer = function (blob) {
    if (!isCandidate(blob)) return origRead.call(this, blob);
    origAB.call(blob).then((buf) => {
      const text = new TextDecoder("utf-8").decode(buf);
      if (!looksLikeXml(text)) {
        origRead.call(this, blob);
        return;
      }
      console.log("[xml patch] file read via FileReader:", blob.name);
      schedule(text);
      origRead.call(this, new File([cleanXML(text)], blob.name, { type: blob.type }));
    });
  };
})();

(function () {
  const AVATAR_ACCEPT = ".rcd,.mii,.miigx,.mae,.xml";

  const origClick = HTMLInputElement.prototype.click;

  function plainPicker(input, args) {
    if (!input.accept) input.accept = AVATAR_ACCEPT;
    input.addEventListener(
      "change",
      (ev) => {
        const file = input.files && input.files[0];
        if (!file) return;
        if (!LOAD_EXTS.test(file.name || "")) {
          ev.stopImmediatePropagation();
          input.value = "";
          showInvalidFilePopup("Invalid file type: " + (file.name || "unknown"));
        }
      },
      { once: true, capture: true }
    );
    return origClick.apply(input, args);
  }

  HTMLInputElement.prototype.click = function () {
    const input = this;
    const args = arguments;
    if (input.type !== "file") return origClick.apply(input, args);

    if (typeof window.showOpenFilePicker !== "function" || input.multiple) {
      return plainPicker(input, args);
    }

    let pickerPromise;
    try {
      pickerPromise = window.showOpenFilePicker({
        multiple: false,
        excludeAcceptAllOption: true,
        types: [
          allAvatarsType(),
          fileType("mae"),
          fileType("mii"),
          fileType("miigx"),
          fileType("rcd"),
          fileType("xml"),
        ],
      });
    } catch (e) {
      return plainPicker(input, args);
    }

    (async () => {
      try {
        const [handle] = await pickerPromise;
        const file = await handle.getFile();
        if (!LOAD_EXTS.test(file.name || "")) {
          showInvalidFilePopup("Invalid file type: " + (file.name || "unknown"));
          return;
        }
        const dt = new DataTransfer();
        dt.items.add(file);
        input.files = dt.files;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      } catch (e) {
        if (e && e.name === "AbortError") return; // user cancelled the window
        console.warn("[load] falling back to normal file picker:", e);
        plainPicker(input, args);
      }
    })();
  };
})();

(function () {
  function typesFor(ext) {
    if (ext === "mae") return [fileType("mae"), fileType("mii"), fileType("miigx")]; // pick the avatar format
    if (ext === "xml") return [fileType("xml")];
    return undefined;
  }

  const origAnchorClick = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () {
    const link = this;
    const args = arguments;
    const isFileDownload =
      link.hasAttribute("download") && /^(blob|data):/i.test(link.href || "");

    if (
      !isFileDownload ||
      typeof window.showSaveFilePicker !== "function" ||
      /\.(png|jpe?g)$/i.test(link.download || "")
    ) {
      return origAnchorClick.apply(link, args);
    }

    const name = link.download || "avatar.mae";
    const ext = ((name.match(/\.([^.]+)$/) || [])[1] || "").toLowerCase();
    const opts = { suggestedName: name };
    const types = typesFor(ext);
    if (types) {
      opts.types = types;
      opts.excludeAcceptAllOption = true;
    }

    let handlePromise;
    try {
      handlePromise = window.showSaveFilePicker(opts);
    } catch (e) {
      return origAnchorClick.apply(link, args);
    }

    (async () => {
      try {
        const handle = await handlePromise;
        const blob = await (await fetch(link.href)).blob();
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
      } catch (e) {
        if (e && e.name === "AbortError") return; // user cancelled the window
        console.warn("[save] falling back to normal download:", e);
        origAnchorClick.apply(link, args);
      }
    })();
  };
})();

window.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("editorSWFContainer");
  const urlAvatar = idgaf();
  if (urlAvatar) safeSet("avatar", urlAvatar);
  const startHex = urlAvatar || safeGet("avatar") || DEFAULT_AVATAR;
  currentHex = startHex;
  lastSaved = startHex;

  const ruffle = window.RufflePlayer.newest();
  const player = ruffle.createPlayer();
  maePlayer = player;
  player.style.width = "640px";
  player.style.height = "500px";
  container.appendChild(player);

  // adobe M.A.E swf
  player.load({
    url: "myavatareditor.swf",
    autoplay: "on",
    unmuteOverlay: "hidden",
    allowScriptAccess: true,
    parameters: { avatar: startHex, mii: startHex, wii: startHex, mae: startHex },
  });

  setInterval(() => {
    try {
      if (Date.now() < ignoreIntervalUntil) return;
      if (typeof player.getAvatarHex !== "function") return;
      const hex = player.getAvatarHex();
      if (!hex) return;

      if (!appliedStart) {
        appliedStart = true;
        if (hex.toLowerCase() !== currentHex.toLowerCase() && typeof player.setAvatarHex === "function") {
          player.setAvatarHex(currentHex);
          return;
        }
      }

      if (hex !== lastSaved) {
        lastSaved = hex;
        currentHex = hex;
        safeSet("avatar", hex);
      }
    } catch (e) {}
  }, 1000);
});

/*
https://helloiti.github.io/mae/
*/
