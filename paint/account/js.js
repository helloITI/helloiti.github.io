// hi skibibi!!! 🤣🤣🤣
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth,createUserWithEmailAndPassword,signInWithEmailAndPassword,signOut,setPersistence,browserSessionPersistence,onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";const [_a,_b,_c,_d,_e,_f,_g,_h] = ["QUl6YVN5Qmx6WG45YnlnZU5fMEF5RFFIWURmMlQydk82NldBemZ3","cGFpbnQtcHJvamVjdC1lM2VjZC5maXJlYmFzZWFwcC5jb20","aHR0cHM6Ly9wYWludC1wcm9qZWN0LWUzZWNkLWRlZmF1bHQtcnRkYi5ldXJvcGUtd2VzdDEuZmlyZWJhc2VkYXRhYmFzZS5hcHA","cGFpbnQtcHJvamVjdC1lM2VjZA","cGFpbnQtcHJvamVjdC1lM2VjZC5maXJlYmFzZXN0b3JhZ2UuYXBw","MTQxMTE0MTc3MzE3","MToxNDExMTQxNzczMTc6d2ViOmQ2Yzc4MTU1ZjI4MzdlN2I0YTBjY2M","Ry0yNTNDMUhaQjFW"].map(atob);
const firebaseConfig = {apiKey:_a,authDomain:_b,databaseURL:_c,projectId:_d,storageBucket:_e,messagingSenderId:_f,appId:_g,measurementId:_h};const app = initializeApp(firebaseConfig);const auth = getAuth(app);const db = getDatabase(app);
const rk = atob("NkxkS1Zpd3RBQUFBQUw2TW1TWVFXOGE3M0phTHhmX2kxMGxNTWxrRQ");
const sUS = document.getElementById("sUS");const sPA = document.getElementById("sPA");const sCOPA = document.getElementById("sCOPA");const sSP = document.getElementById("sSP");const sMsg = document.getElementById("sMsg");
const liUS = document.getElementById("liUS");const liPA = document.getElementById("liPA");const liSP = document.getElementById("liSP");const lMsg = document.getElementById("lMsg");
const btnSUP = document.getElementById("btnSUP");const btnLG = document.getElementById("btnLG");const btnLT = document.getElementById("btnLT");
const actC = document.getElementById("actC");const actI = document.getElementById("actI");
const lCD = document.getElementById("lCD");const sCD = document.getElementById("sCD");
const sSUP = document.getElementById("sSUP");const sLG = document.getElementById("sLG");const sLGL = document.getElementById("sLGL");
let lCid = null;let sCid = null;
function rCap() {
if (window.grecaptcha && window.grecaptcha.render) {
lCid = grecaptcha.render("liCaptcha", { sitekey: rk });sCid = grecaptcha.render("sCaptcha", { sitekey: rk });
} else { setTimeout(rCap, 300); } }
rCap();
function usernameToEmail(username) { return username.trim().toLowerCase() + "@app.local"; }
let manualAuthInProgress = false;
sSP.onchange = () => { sPA.type = sSP.checked ? "text" : "password"; sCOPA.type = sSP.checked ? "text" : "password"; }; liSP.onchange = () => { liPA.type = liSP.checked ? "text" : "password"; };
sSUP.onclick = () => { lCD.style.display = "none"; sCD.style.display = "flex"; sSUP.parentElement.style.display = "none"; sLG.style.display = "block"; document.querySelector("h2").textContent = "※ Register your very own Paint Account! ※"; };
sLGL.onclick = () => { sCD.style.display = "none"; lCD.style.display = "flex"; sSUP.parentElement.style.display = "block"; sLG.style.display = "none"; document.querySelector("h2").textContent = "※ Log in your Paint Account! ※"; };
function showLoggedInUI(uname) { actI.textContent = "※ Welcome, " + uname + "! ※";actC.style.display = "block";lCD.style.display = "none";sCD.style.display = "none";sSUP.parentElement.style.display = "none";sLG.style.display = "none";document.querySelector("h2").style.display = "none"; }
function showLoggedOutUI() { actC.style.display = "none";lCD.style.display = "flex";sCD.style.display = "none";sSUP.parentElement.style.display = "block";sLG.style.display = "none";const h = document.querySelector("h2");h.style.display = "block";h.textContent = "※ Log in your paint account! ※"; }
btnSUP.onclick = async () => {
const username = sUS.value.trim().toLowerCase();const password = sPA.value;const confirmPassword = sCOPA.value;sMsg.textContent = "";
if (!username || !password || !confirmPassword) { sMsg.textContent = "Please fill out all fields."; return; }
if (!grecaptcha.getResponse(sCid)) { sMsg.textContent = "Please complete the reCAPTCHA!"; return; }
manualAuthInProgress = true;
try {
if (auth.currentUser && auth.currentUser.isAnonymous) await signOut(auth);const cred = await createUserWithEmailAndPassword(auth, usernameToEmail(username), password);
await set(ref(db, "usernames/" + username), { uid: cred.user.uid });
await set(ref(db, "users/" + cred.user.uid), { username, drawingCount: 0 });
showLoggedInUI(username);
} catch (err) { sMsg.textContent = "※ Error: " + err.message + " ※"; } finally { manualAuthInProgress = false; grecaptcha.reset(sCid); } };
btnLG.onclick = async () => {
const username = liUS.value.trim().toLowerCase();const password = liPA.value;lMsg.textContent = "";
if (!grecaptcha.getResponse(lCid)) { lMsg.textContent = "Please complete the reCAPTCHA!"; return; }
manualAuthInProgress = true;
try {
await signInWithEmailAndPassword(auth, usernameToEmail(username), password);
showLoggedInUI(username);
} catch (err) { lMsg.textContent = "※ Error: " + err.message + " ※"; } finally { manualAuthInProgress = false; grecaptcha.reset(lCid); } };
btnLT.onclick = async () => { await signOut(auth); };
onAuthStateChanged(auth, async (user) => {
if (manualAuthInProgress) return;
if (user) { const snap = await get(child(ref(db), "users/" + user.uid)); showLoggedInUI(snap.exists() ? snap.val().username : "(unknown)"); } else { showLoggedOutUI(); }
});
document.addEventListener("click", function playMusic() { const audio = document.getElementById("bgm"); if (audio) audio.play().catch(console.error); document.removeEventListener("click", playMusic); }, { once: true });
// sigh...
