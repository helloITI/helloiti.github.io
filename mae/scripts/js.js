/*
code that helps the swf load avatars from the website
and saves your edits to the browser's localStorage
*/

const DEFAULT_AVATAR = "000000640065006600610075006c00740042006f0079404080807f5fc242899800044240318028a2088c08401448b88d008a008a25040000000000000000000000000000000000000000";

function idgaf() {
  const params = new URLSearchParams(window.location.search);
  return params.get("avatar") || params.get("mii") || params.get("wii");
}

function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

// my avatar editor load xml file (i hope this works)
function xmlToMiiHex(xmlText) {
  const doc = new DOMParser().parseFromString(xmlText, "text/xml");
  if (doc.querySelector("parsererror")) throw new Error("Invalid XML");

  const root = doc.documentElement;
  const num = (parent, tag, def = 0) => {
    const el = parent ? parent.getElementsByTagName(tag)[0] : null;
    const v = el ? parseInt(el.textContent.trim(), 10) : NaN;
    return Number.isNaN(v) ? def : v;
  };
  const str = (parent, tag) => {
    const el = parent ? parent.getElementsByTagName(tag)[0] : null;
    return el ? el.textContent.trim() : "";
  };
  const node = (tag) => root.getElementsByTagName(tag)[0];

  const buf = new Uint8Array(74);
  const view = new DataView(buf.buffer);

  // 0x00: gender, birthMonth, birthDay, favoriteColor/shirt, mingles
  const gender = num(root, "gender") & 1;
  const bMonth = num(root, "birthMonth") & 0xF;
  const bDay = num(root, "birthDay") & 0x1F;
  const shirt = num(node("Shirt"), "color") & 0xF;
  const mingles = num(root, "mingles", 1) ? 0 : 1;
  view.setUint16(0x00, (gender << 14) | (bMonth << 10) | (bDay << 5) | (shirt << 1) | mingles);

  // 0x02..0x15: Name (10 chars UTF-16BE)
  const name = str(root, "name").slice(0, 10);
  for (let i = 0; i < 10; i++) {
    const code = i < name.length ? name.charCodeAt(i) : 0;
    view.setUint16(0x02 + i * 2, code);
  }

  // 0x16..0x17: Body Height & Weight
  buf[0x16] = num(node("Body"), "height", 64) & 0x7F;
  buf[0x17] = num(node("Body"), "weight", 64) & 0x7F;

  // 0x18..0x1F: IDs (Avatar ID & Client ID as 4-byte integers)
  const parseHexOrDec = (valStr) => {
    if (!valStr) return 0;
    if (valStr.startsWith("0x") || valStr.length === 8) {
      return parseInt(valStr, 16) || 0;
    }
    return parseInt(valStr, 10) || 0;
  };
  view.setUint32(0x18, parseHexOrDec(str(root, "id")));
  view.setUint32(0x1C, parseHexOrDec(str(root, "clientID")));

  // 0x20: Face, Skin, Expression
  const face = num(node("Face"), "type") & 0x7;
  const skin = num(node("Skin"), "color") & 0x7;
  view.setUint16(0x20, (face << 13) | (skin << 10));

  // 0x22: Hair
  const hair = node("Hair");
  view.setUint16(0x22, ((num(hair, "type") & 0x7F) << 9) | ((num(hair, "color") & 0x7) << 6) | ((num(hair, "part") & 1) << 5));

  // 0x24..0x27: Eyebrow
  const brow = node("Eyebrow");
  view.setUint16(0x24, ((num(brow, "type") & 0x1F) << 11) | ((num(brow, "rotation") & 0xF) << 6));
  view.setUint16(0x26, ((num(brow, "color") & 0x7) << 13) | ((num(brow, "size", 4) & 0xF) << 9) | ((num(brow, "y", 10) & 0x1F) << 4) | (num(brow, "x", 2) & 0xF));

  // 0x28..0x2B: Eye
  const eye = node("Eye");
  view.setUint16(0x28, ((num(eye, "type") & 0x3F) << 10) | ((num(eye, "rotation") & 0x7) << 5));
  view.setUint16(0x2A, ((num(eye, "color") & 0x7) << 13) | ((num(eye, "size", 4) & 0x7) << 9) | ((num(eye, "y", 12) & 0x1F) << 4) | (num(eye, "x", 2) & 0xF));

  // 0x2C: Nose
  const nose = node("Nose");
  view.setUint16(0x2C, ((num(nose, "type") & 0xF) << 12) | ((num(nose, "size", 4) & 0xF) << 8) | ((num(nose, "y", 9) & 0x1F) << 3));

  // 0x2E: Mouth
  const mouth = node("Mouth");
  view.setUint16(0x2E, ((num(mouth, "type") & 0x1F) << 11) | ((num(mouth, "color") & 0x3) << 9) | ((num(mouth, "size", 4) & 0xF) << 5) | (num(mouth, "y", 13) & 0x1F));

  // 0x30: Glasses
  const glasses = node("Glasses");
  view.setUint16(0x30, ((num(glasses, "type") & 0xF) << 12) | ((num(glasses, "color") & 0x7) << 9) | ((num(glasses, "size", 4) & 0x7) << 5) | (num(glasses, "y", 10) & 0x1F));

  // 0x32: Mustache & Beard
  const stache = node("Mustache");
  const beard = node("Beard");
  view.setUint16(0x32, ((num(stache, "type") & 0x3) << 14) | ((num(beard, "type") & 0x3) << 12) | ((num(beard, "color") & 0x7) << 9) | ((num(stache, "size", 4) & 0xF) << 5) | (num(stache, "y", 10) & 0x1F));

  // 0x34: Mole
  const mole = node("Mole");
  view.setUint16(0x34, ((num(mole, "type") & 1) << 15) | ((num(mole, "size", 4) & 0xF) << 11) | ((num(mole, "y", 20) & 0x1F) << 6) | ((num(mole, "x", 2) & 0x1F) << 1));

  // 0x36..0x49: Creator Name (10 chars UTF-16BE)
  const creator = str(root, "creatorName").slice(0, 10);
  for (let i = 0; i < 10; i++) {
    const code = i < creator.length ? creator.charCodeAt(i) : 0;
    view.setUint16(0x36 + i * 2, code);
  }

  return Array.from(buf, b => b.toString(16).padStart(2, "0")).join("");
}

window.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("editorSWFContainer");
  const urlAvatar = idgaf();
  const startHex = urlAvatar || safeGet("avatar") || DEFAULT_AVATAR;

  const ruffle = window.RufflePlayer.newest();
  const player = ruffle.createPlayer();
  player.style.width = "640px";
  player.style.height = "500px";
  container.appendChild(player);

  // adobe M.A.E swf
  player.load({
    url: "myavatareditor.swf",
    autoplay: "on",
    unmuteOverlay: "hidden",
    allowScriptAccess: true,
    parameters: { avatar: startHex, mii: startHex, wii: startHex },
  });

  let lastSaved = startHex;
  let appliedStart = false;

  // xml file loader
  const xmlInput = document.getElementById("xmlLoader");
  if (xmlInput) {
    xmlInput.addEventListener("change", async () => {
      const file = xmlInput.files[0];
      if (!file) return;
      try {
        const hex = xmlToMiiHex(await file.text());
        if (typeof player.setAvatarHex === "function") {
          player.setAvatarHex(hex);
          lastSaved = hex;
          safeSet("avatar", hex);
        } else {
          alert("Flash player is not ready yet.");
        }
      } catch (e) {
        console.error("XML load failed:", e);
        alert("Couldn't load that XML file. Check the console for details.");
      }
      xmlInput.value = "";
    });
  }

  setInterval(() => {
    try {
      if (typeof player.getAvatarHex !== "function") return;
      const hex = player.getAvatarHex();
      if (!hex) return;

      if (!appliedStart) {
        appliedStart = true;
        if (hex.toLowerCase() !== startHex.toLowerCase() && typeof player.setAvatarHex === "function") {
          player.setAvatarHex(startHex);
          return;
        }
      }

      if (hex !== lastSaved) {
        lastSaved = hex;
        safeSet("avatar", hex);
      }
    } catch (e) {}
  }, 1000);
});

/*
https://helloiti.github.io/mae/
*/
