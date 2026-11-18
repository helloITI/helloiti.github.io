/*
code that helps the swf load avatars from the website
and saves your edits to the browser's localStorage
*/

(function () {
  const OLD_NS = "http://www.myavatareditor.com/xml/avatar/1";
  const MAE_NS = "https://helloiti.github.io/mae/xml/avatar/1";
  const isXml = (b) => b && /\.xml$/i.test(b.name || "");
  const clean = (t) =>
    t.replace(/<!DOCTYPE[^>]*>/gi, "")
     .replace(/<\?xml-stylesheet[^>]*\?>/gi, "")
     .split(OLD_NS).join(MAE_NS);

  // file.arrayBuffer()
  const origAB = Blob.prototype.arrayBuffer;
  Blob.prototype.arrayBuffer = async function () {
    const buf = await origAB.call(this);
    if (!isXml(this)) return buf;
    console.log("[xml patch] cleaned via arrayBuffer:", this.name);
    return new TextEncoder().encode(clean(new TextDecoder("utf-8").decode(buf))).buffer;
  };

  // FileReader.readAsArrayBuffer(file)
  const origRead = FileReader.prototype.readAsArrayBuffer;
  FileReader.prototype.readAsArrayBuffer = function (blob) {
    if (!isXml(blob)) return origRead.call(this, blob);
    console.log("[xml patch] cleaned via FileReader:", blob.name);
    origAB.call(blob).then((buf) => {
      const cleaned = clean(new TextDecoder("utf-8").decode(buf));
      origRead.call(this, new File([cleaned], blob.name, { type: blob.type }));
    });
  };
})();

const MAE_NS = "https://helloiti.github.io/mae/xml/avatar/1";
const OLD_NS = "http://www.myavatareditor.com/xml/avatar/1";

const DEFAULT_AVATAR = "000000640065006600610075006c00740042006f0079404080807f5fc242899800044240318028a2088c08401448b88d008a008a25040000000000000000000000000000000000000000";

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
    url: "myavatareditor.swf?v=3",
    autoplay: "on",
    unmuteOverlay: "hidden",
    allowScriptAccess: true,
    parameters: { avatar: startHex, mii: startHex, wii: startHex },
  });

  let lastSaved = startHex;
  let appliedStart = false;

  // test
  const xmlInput = document.getElementById("xmlLoader");
  if (xmlInput) {
    xmlInput.addEventListener("change", async () => {
      const file = xmlInput.files[0];
      if (!file) return;
      try {
        if (typeof player.setAvatarXML !== "function") {
          alert("The editor isn't ready yet, try again in a second.");
        } else {
          player.setAvatarXML(cleanXML(await file.text()));
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
