/*
code that helps the swf load avatars from the website
and saves your edits to the browser's localStorage
*/

const MAE_NS = "https://helloiti.github.io/mae/xml/avatar/1"; // new
const OLD_NS = "http://www.myavatareditor.com/xml/avatar/1"; // old

function cleanXML(text) {
  return text
    .replace(/<\?xml[^>]*\?>/gi, "")
    .replace(/<!DOCTYPE[^>]*>/gi, "")
    .replace(/<\?xml-stylesheet[^>]*\?>/gi, "")
    .split(OLD_NS).join(MAE_NS);
}

// defaultBoy
const DEFAULT_AVATAR = "000000640065006600610075006c00740042006f0079404080807f5fc242899800044240318028a2088c08401448b88d008a008a25040000000000000000000000000000000000000000";

function idgaf() {
  const params = new URLSearchParams(window.location.search);
  // ?avatar= ?mii= ?wii=
  return params.get("avatar") || params.get("mii") || params.get("wii");
}

function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

// XML
function cleanXML(text) {
  return text
    .replace(/<!DOCTYPE[^>]*>/gi, "")
    .replace(/<\?xml-stylesheet[^>]*\?>/gi, "")
    .split(OLD_NS).join(MAE_NS);
}

window.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("editorSWFContainer");
  const urlAvatar = idgaf();
  const startHex = urlAvatar || safeGet("avatar") || DEFAULT_AVATAR;

  // if (urlAvatar) safeSet("avatar", urlAvatar);

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

  // xml file loader
const xmlInput = document.getElementById("xmlLoader");
if (xmlInput) {
  xmlInput.addEventListener("change", async () => {
    const file = xmlInput.files[0];
    if (!file) return;
    try {
      const rawText = await file.text();
      const text = cleanXML(rawText);
      
      if (typeof player.setAvatarXML === "function") {
        player.setAvatarXML(text);
        
        await new Promise(r => setTimeout(r, 300));
        const newHex = player.getAvatarHex();
        if (newHex) {
          safeSet("avatar", newHex);
          lastSaved = newHex;
        }
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

  let lastSaved = startHex;
  let appliedStart = false;

  setInterval(() => {
    try {
      if (typeof player.getAvatarHex !== "function") return; // SWF not ready yet
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
    } catch (e) {

    }
  }, 1000);
});

/*
https://helloiti.github.io/mae/
*/
