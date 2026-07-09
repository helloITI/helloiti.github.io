// hi skibibi!!! 🤣🤣🤣
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth,createUserWithEmailAndPassword,signInWithEmailAndPassword,signOut,setPersistence,browserSessionPersistence,onAuthStateChanged,GoogleAuthProvider,signInWithPopup } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getDatabase, ref, set, get, child, update } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";const [_a,_b,_c,_d,_e,_f,_g,_h] = ["QUl6YVN5Qmx6WG45YnlnZU5fMEF5RFFIWURmMlQydk82NldBemZ3","cGFpbnQtcHJvamVjdC1lM2VjZC5maXJlYmFzZWFwcC5jb20","aHR0cHM6Ly9wYWludC1wcm9qZWN0LWUzZWNkLWRlZmF1bHQtcnRkYi5ldXJvcGUtd2VzdDEuZmlyZWJhc2VkYXRhYmFzZS5hcHA","cGFpbnQtcHJvamVjdC1lM2VjZA","cGFpbnQtcHJvamVjdC1lM2VjZC5maXJlYmFzZXN0b3JhZ2UuYXBw","MTQxMTE0MTc3MzE3","MToxNDExMTQxNzczMTc6d2ViOmQ2Yzc4MTU1ZjI4MzdlN2I0YTBjY2M","Ry0yNTNDMUhaQjFW"].map(atob);
const firebaseConfig = {apiKey:_a,authDomain:_b,databaseURL:_c,projectId:_d,storageBucket:_e,messagingSenderId:_f,appId:_g,measurementId:_h};const app = initializeApp(firebaseConfig);const auth = getAuth(app);const db = getDatabase(app);
const rk = atob("NkxkS1Zpd3RBQUFBQUw2TW1TWVFXOGE3M0phTHhmX2kxMGxNTWxrRQ");const sUS = document.getElementById("sUS");const sEM = document.getElementById("sEM");const sPA = document.getElementById("sPA");const sCOPA = document.getElementById("sCOPA");const sSP = document.getElementById("sSP");const sMsg = document.getElementById("sMsg");
const liUS = document.getElementById("liUS");const liPA = document.getElementById("liPA");const liSP = document.getElementById("liSP");const lMsg = document.getElementById("lMsg");
const btnSUP = document.getElementById("btnSUP");const btnLG = document.getElementById("btnLG");const btnLT = document.getElementById("btnLT");const btnGL = document.getElementById("btnGL");
const actC = document.getElementById("actC");const actI = document.getElementById("actI");
const lCD = document.getElementById("lCD");const sCD = document.getElementById("sCD");
const gUD = document.getElementById("gUD");const gUS = document.getElementById("gUS");const btnGUS = document.getElementById("btnGUS");const gMsg = document.getElementById("gMsg");let pendingGoogleUser = null;
const sSUP = document.getElementById("sSUP");const sLG = document.getElementById("sLG");const sLGL = document.getElementById("sLGL");let lCid = null;let sCid = null;
function rCap() {
if (window.grecaptcha && window.grecaptcha.render) {
lCid = grecaptcha.render("liCaptcha", { sitekey: rk });sCid = grecaptcha.render("sCaptcha", { sitekey: rk });
} else { setTimeout(rCap, 300); } }
rCap();
function usernameToEmail(username) { return username.trim().toLowerCase() + "@app.local"; }
function emailKey(email) { return email.trim().toLowerCase().replace(/\./g, ","); } // '.' isn't allowed in a firebase key.. ok?
function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
let manualAuthInProgress = false;
sSP.onchange = () => { sPA.type = sSP.checked ? "text" : "password"; sCOPA.type = sSP.checked ? "text" : "password"; }; liSP.onchange = () => { liPA.type = liSP.checked ? "text" : "password"; };
sSUP.onclick = () => { lCD.style.display = "none"; sCD.style.display = "flex"; sSUP.parentElement.style.display = "none"; sLG.style.display = "block"; document.querySelector("h2").textContent = "※ Register your very own Paint Account! ※"; };
sLGL.onclick = () => { sCD.style.display = "none"; lCD.style.display = "flex"; sSUP.parentElement.style.display = "block"; sLG.style.display = "none"; document.querySelector("h2").textContent = "※ Log in your Paint Account! ※"; };const orb = document.getElementById("orb);
function showLoggedInUI(uname) { actI.textContent = "※ Welcome, " + uname + "! ※";actC.style.display = "block";lCD.style.display = "none";sCD.style.display = "none";orb.style.display = "none";sSUP.parentElement.style.display = "none";sLG.style.display = "none";btnGL.style.display = "none";gUD.style.display = "none";document.querySelector("h2").style.display = "none"; }
function showLoggedOutUI() { actC.style.display = "none";lCD.style.display = "flex";sCD.style.display = "none";orb.style.display = "block";sSUP.parentElement.style.display = "block";sLG.style.display = "none";btnGL.style.display = "block";gUD.style.display = "none";const h = document.querySelector("h2");h.style.display = "block";h.textContent = "※ Log in your Paint Account! ※"; }
btnSUP.onclick = async () => {
const username = sUS.value.trim().toLowerCase();const email = sEM.value.trim().toLowerCase();const password = sPA.value;const confirmPassword = sCOPA.value;sMsg.textContent = "";
if (!username || !email || !password || !confirmPassword) { sMsg.textContent = "Please fill out all fields."; return; }
if (!isValidEmail(email)) { sMsg.textContent = "Please enter a valid email address."; return; }
if (password !== confirmPassword) { sMsg.textContent = "Passwords don't match."; return; }
if (!grecaptcha.getResponse(sCid)) { sMsg.textContent = "Please complete the reCAPTCHA!"; return; }
manualAuthInProgress = true;
let cred;
try {
if (auth.currentUser && auth.currentUser.isAnonymous) await signOut(auth);
cred = await createUserWithEmailAndPassword(auth, usernameToEmail(username), password);
await update(ref(db), { ["usernames/" + username]: { uid: cred.user.uid }, ["emails/" + emailKey(email)]: { uid: cred.user.uid }, ["users/" + cred.user.uid]: { username, email, drawingCount: 0 } });
showLoggedInUI(username);
} catch (err) {
if (cred && cred.user) { try { await cred.user.delete(); } catch {} }
if (err.message && err.message.includes("PERMISSION_DENIED")) { sMsg.textContent = "※ That username or email is already taken. ※"; }
else { sMsg.textContent = "※ Error: " + err.message + " ※"; }
} finally { manualAuthInProgress = false; grecaptcha.reset(sCid); } };
btnLG.onclick = async () => {
const username = liUS.value.trim().toLowerCase();const password = liPA.value;lMsg.textContent = "";
if (!grecaptcha.getResponse(lCid)) { lMsg.textContent = "Please complete the reCAPTCHA, ok?"; return; }
manualAuthInProgress = true;
try {
await signInWithEmailAndPassword(auth, usernameToEmail(username), password);showLoggedInUI(username);
} catch (err) { lMsg.textContent = "※ Error: " + err.message + " ※"; } finally { manualAuthInProgress = false; grecaptcha.reset(lCid); } };
btnGL.onclick = async () => {
lMsg.textContent = ""; sMsg.textContent = "";
manualAuthInProgress = true;
try {
if (auth.currentUser && auth.currentUser.isAnonymous) await signOut(auth);
const cred = await signInWithPopup(auth, new GoogleAuthProvider());
pendingGoogleUser = cred.user;
const snap = await get(child(ref(db), "users/" + cred.user.uid));
if (snap.exists() && snap.val().username) {
manualAuthInProgress = false;
showLoggedInUI(snap.val().username);
} else {
// https://google.com
lCD.style.display = "none"; sCD.style.display = "none"; sSUP.parentElement.style.display = "none"; sLG.style.display = "none"; btnGL.style.display = "none";
document.querySelector("h2").textContent = "※ One more step! ※";
gUS.value = ""; gMsg.textContent = ""; gUD.style.display = "flex";
}
} catch (err) {
manualAuthInProgress = false;
if (err.code !== "auth/popup-closed-by-user" && err.code !== "auth/cancelled-popup-request") {
(lCD.style.display !== "none" ? lMsg : sMsg).textContent = "※ Error: " + err.message + " ※";
}
} };
btnGUS.onclick = async () => {
const username = gUS.value.trim().toLowerCase();gMsg.textContent = "";
if (!username) { gMsg.textContent = "Please choose a username."; return; }
if (username.length < 3 || username.length > 20 || !/^[a-z0-9_]+$/.test(username)) { gMsg.textContent = "Usernames must be 3-20 characters: letters, numbers, underscores only."; return; }
const user = pendingGoogleUser || auth.currentUser;
if (!user) { gMsg.textContent = "※ Something went wrong, please try signing in again. ※"; return; }
const email = (user.email || "").trim().toLowerCase();
try {
await update(ref(db), { ["usernames/" + username]: { uid: user.uid }, ["emails/" + emailKey(email)]: { uid: user.uid }, ["users/" + user.uid]: { username, email, drawingCount: 0 } });
manualAuthInProgress = false;
showLoggedInUI(username);
} catch (err) {
if (err.message && err.message.includes("PERMISSION_DENIED")) { gMsg.textContent = "※ That username is taken, or this Google account's email is already linked to another account. ※"; }
else { gMsg.textContent = "※ Error: " + err.message + " ※"; }
} };
btnLT.onclick = async () => { await signOut(auth); };
onAuthStateChanged(auth, async (user) => {
if (manualAuthInProgress) return; if (user) { console.log("[auth] restored user:", user.uid, user.email);let snap;
try { snap = await get(child(ref(db), "users/" + user.uid));
} catch (err) { console.error("[auth] users/<uid> lookup threw:", err);await new Promise(r => setTimeout(r, 800));
try { snap = await get(child(ref(db), "users/" + user.uid));
} catch (err2) {
console.error("[auth] users/<uid> retry also failed:", err2);showLoggedInUI(user.email ? user.email.split("@")[0] : "(unknown)");return;
} }
console.log("[auth] snap.exists():", snap.exists(), "value:", snap.val());
if (snap.exists() && snap.val().username) {
showLoggedInUI(snap.val().username);
} else {
const fallbackName = user.email ? user.email.split("@")[0] : "(unknown)";console.warn("[auth] users/" + user.uid + " missing in DB, recreating with username:", fallbackName);
try { await set(ref(db, "users/" + user.uid), { username: fallbackName, drawingCount: 0 }); await set(ref(db, "usernames/" + fallbackName), { uid: user.uid });
} catch (err3) {
console.error("[auth] self-heal write failed:", err3); }
showLoggedInUI(fallbackName); }
} else { showLoggedOutUI(); }
});
document.addEventListener("click", function playMusic() { const audio = document.getElementById("bgm"); if (audio) audio.play().catch(console.error); document.removeEventListener("click", playMusic); }, { once: true });
// sigh...
