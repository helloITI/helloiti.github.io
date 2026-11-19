/*
code that helps the swf load avatars from the website
and saves your edits to the browser's localStorage
*/

const MAE_NS = "https://helloiti.github.io/mae/xml/avatar/1";
const OLD_NS = "http://www.myavatareditor.com/xml/avatar/1";
// defaultBoy
const DEFAULT_AVATAR = "000000640065006600610075006c00740042006f0079404080807f5fc242899800044240318028a2088c08401448b88d008a008a25040000000000000000000000000000000000000000";

let maePlayer = null;
let lastSaved = DEFAULT_AVATAR;
let currentHex = DEFAULT_AVATAR;
let ignoreIntervalUntil = 0;
let appliedStart = false;
let loadToken = 0;


const DEBOUNCE_MS = 0;
const BATCH = 1000;
const STEP_MS = 0;
const SETTLE_MS = 30;

function idgaf() {
  const params = new URLSearchParams(window.location.search);
  return params.get("avatar") || params.get("mii") || params.get("wii");
}
function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

function cleanXML(text) {
  return text
    .replace(/<!DOCTYPE[^>]*>/gi, "")
    .replace(/<\?xml-stylesheet[^>]*\?>/gi, "")
    .split(OLD_NS).join(MAE_NS);
}

// xml fields
const XML_FIELDS = [
  // [group, tag, property, kind]
  ["", "id", "id", "hex"], ["", "clientID", "clientID", "hex"],
  ["", "name", "name", "str"], ["", "creatorName", "creatorName", "str"],
  ["", "birthDay", "birthDay", "int"], ["", "birthMonth", "birthMonth", "int"],
  ["", "gender", "gender", "int"], ["", "mingles", "mingles", "int"],
  ["Body", "height", "height", "int"], ["Body", "weight", "weight", "int"],
  ["Beard", "type", "beardType", "int"], ["Beard", "color", "beardColor", "color"],
  ["Eye", "type", "eyeType", "int"], ["Eye", "rotation", "eyeRotation", "int"],
  ["Eye", "color", "eyeColor", "color"], ["Eye", "size", "eyeSize", "int"],
  ["Eye", "x", "eyeX", "int"], ["Eye", "y", "eyeY", "int"],
  ["Eyebrow", "type", "eyebrowType", "int"], ["Eyebrow", "rotation", "eyebrowRotation", "int"],
  ["Eyebrow", "color", "eyebrowColor", "color"], ["Eyebrow", "size", "eyebrowSize", "int"],
  ["Eyebrow", "x", "eyebrowX", "int"], ["Eyebrow", "y", "eyebrowY", "int"],
  ["Face", "type", "faceType", "int"],
  ["Glasses", "type", "glassesType", "int"], ["Glasses", "color", "glassesColor", "color"],
  ["Glasses", "size", "glassesSize", "int"], ["Glasses", "y", "glassesY", "int"],
  ["Hair", "type", "hairType", "int"], ["Hair", "color", "hairColor", "color"],
  ["Hair", "part", "hairPart", "int"],
  ["Head", "type", "headType", "int"],
  ["Mole", "type", "moleType", "int"], ["Mole", "size", "moleSize", "int"],
  ["Mole", "x", "moleX", "int"], ["Mole", "y", "moleY", "int"],
  ["Mouth", "type", "mouthType", "int"], ["Mouth", "color", "mouthColor", "color"],
  ["Mouth", "size", "mouthSize", "int"], ["Mouth", "y", "mouthY", "int"],
  ["Mustache", "type", "mustacheType", "int"], ["Mustache", "size", "mustacheSize", "int"],
  ["Mustache", "y", "mustacheY", "int"],
  ["Nose", "type", "noseType", "int"], ["Nose", "size", "noseSize", "int"],
  ["Nose", "y", "noseY", "int"],
  ["Shirt", "color", "favoriteColor", "color"],
  ["Skin", "color", "skinColor", "color"],
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

function applyXmlToEditor(xmlText) {
  const p = maePlayer;
  if (!p || typeof p.setAvatarValue !== "function") {
    throw new Error("Editor not ready");
  }

  const doc = new DOMParser().parseFromString(cleanXML(xmlText).trim(), "text/xml");
  if (doc.querySelector("parsererror")) throw new Error("Invalid XML");

  let root = doc.documentElement;
  if (root.localName === "avatar-collection") {
    root = root.getElementsByTagName("Avatar")[0];
  }
  if (!root || root.localName !== "Avatar") throw new Error("No <Avatar> element");

  const child = (parent, tag) => {
    for (const c of parent.children) if (c.localName === tag) return c;
    return null;
  };

  const updates = [];
  for (const [group, tag, prop, kind] of XML_FIELDS) {
    const parent = group ? child(root, group) : root;
    const el = parent ? child(parent, tag) : null;
    if (!el) continue;
    const raw = el.textContent.trim();
    let value;
    if (kind === "str") value = raw;
    else if (raw === "") continue;
    else if (kind === "hex") value = parseInt(raw, 16);
    else if (kind === "color") value = parseColor(raw);
    else value = parseInt(raw, 10);
    if (kind !== "str" && Number.isNaN(value)) continue;
    updates.push([prop, value]);
  }

  const token = ++loadToken;   // a newer load cancels this one
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
  const isXml = (b) => b && /\.xml$/i.test(b.name || "");
  let timer = null;
  const schedule = (text) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      try { applyXmlToEditor(text); }
      catch (e) { console.error("[xml] apply failed:", e); }
    }, DEBOUNCE_MS);
  };

  const origAB = Blob.prototype.arrayBuffer;
  Blob.prototype.arrayBuffer = async function () {
    const buf = await origAB.call(this);
    if (!isXml(this)) return buf;
    const text = new TextDecoder("utf-8").decode(buf);
    console.log("[xml patch] file read via arrayBuffer:", this.name);
    schedule(text);
    return new TextEncoder().encode(cleanXML(text)).buffer;
  };

  const origRead = FileReader.prototype.readAsArrayBuffer;
  FileReader.prototype.readAsArrayBuffer = function (blob) {
    if (!isXml(blob)) return origRead.call(this, blob);
    console.log("[xml patch] file read via FileReader:", blob.name);
    origAB.call(blob).then((buf) => {
      const text = new TextDecoder("utf-8").decode(buf);
      schedule(text);
      origRead.call(this, new File([cleanXML(text)], blob.name, { type: blob.type }));
    });
  };
})();

window.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("editorSWFContainer");
  const urlAvatar = idgaf();
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
    polyfills: true,
    allowNetworking: "all",
    parameters: { avatar: startHex, mii: startHex, wii: startHex },
  });

  /* TEST */
  const xmlInput = document.getElementById("xmlLoader");
  if (xmlInput) {
    xmlInput.addEventListener("change", async () => {
      const file = xmlInput.files[0];
      if (!file) return;
      try {
        applyXmlToEditor(await file.text());
      } catch (e) {
        console.error("XML load failed:", e);
        alert("Couldn't load that XML file. Check the console for details.");
      }
      xmlInput.value = "";
    });
  }

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
