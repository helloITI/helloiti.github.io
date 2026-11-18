/*
code that helps the swf load avatars from the website
and saves your edits to the browser's localStorage
*/



function idgaf() {
  const params = new URLSearchParams(window.location.search);
  // ?avatar= ?mii= ?wii=
  return params.get("avatar") || params.get("mii") || params.get("wii");
}

// defaultBoy
const DEFAULT_AVATAR = "000000640065006600610075006c00740042006f0079404080807f5fc242899800044240318028a2088c08401448b88d008a008a25040000000000000000000000000000000000000000";

function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

window.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("editorSWFContainer");
  const urlAvatar = idgaf();
  const startHex = urlAvatar || safeGet("avatar") || DEFAULT_AVATAR;

  if (urlAvatar) safeSet("avatar", urlAvatar);

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



/*
https://helloiti.github.io/mae/
*/
