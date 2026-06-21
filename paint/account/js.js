// hi skibibi!!! 🤣🤣🤣
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
getAuth,createUserWithEmailAndPassword,signInWithEmailAndPassword,signOut,setPersistence,browserSessionPersistence,onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";const [_a,_b,_c,_d,_e,_f,_g,_h] = ["QUl6YVN5Qmx6WG45YnlnZU5fMEF5RFFIWURmMlQydk82NldBemZ3","cGFpbnQtcHJvamVjdC1lM2VjZC5maXJlYmFzZWFwcC5jb20","aHR0cHM6Ly9wYWludC1wcm9qZWN0LWUzZWNkLWRlZmF1bHQtcnRkYi5ldXJvcGUtd2VzdDEuZmlyZWJhc2VkYXRhYmFzZS5hcHA","cGFpbnQtcHJvamVjdC1lM2VjZA","cGFpbnQtcHJvamVjdC1lM2VjZC5maXJlYmFzZXN0b3JhZ2UuYXBw","MTQxMTE0MTc3MzE3","MToxNDExMTQxNzczMTc6d2ViOmQ2Yzc4MTU1ZjI4MzdlN2I0YTBjY2M","Ry0yNTNDMUhaQjFW"].map(atob);
const firebaseConfig = {apiKey:_a,authDomain:_b,databaseURL:_c,projectId:_d,storageBucket:_e,messagingSenderId:_f,appId:_g,measurementId:_h};const app = initializeApp(firebaseConfig);const auth = getAuth(app);const db = getDatabase(app);
// idk
const rk = atob("NkxkS1Zpd3RBQUFBQUw2TW1TWVFXOGE3M0phTHhmX2kxMGxNTWxrRQ");
// hi guys
const sUS = document.getElementById("sUS");const sPA = document.getElementById("sPA");const sCOPA = document.getElementById("sCOPA");const sSP = document.getElementById("sSP");const sMsg = document.getElementById("sMsg");
// wow
const liUS = document.getElementById("liUS");const liPA = document.getElementById("liPA");const liSP = document.getElementById("liSP");const lMsg = document.getElementById("lMsg");
// buttons!
const btnSUP = document.getElementById("btnSUP");const btnLG = document.getElementById("btnLG");const btnLT = document.getElementById("btnLT");
// account stuff
const actC = document.getElementById("actC");const actI = document.getElementById("actI");
// idk
const lCD = document.getElementById("lCD");const sCD = document.getElementById("sCD");
// i also don't know
const sSUP = document.getElementById("sSUP");const sLG = document.getElementById("sLG");const sLGL = document.getElementById("sLGL");
// widget ids
let lCid = null;let sCid = null;
let liVerified = false; let sVerified = false;
function rCap() {
document.getElementById("liCaptcha").setAttribute("data-sitekey", rk);document.getElementById("sCaptcha").setAttribute("data-sitekey", rk);
if (window.grecaptcha && window.grecaptcha.render) {
lCid = grecaptcha.render("liCaptcha", { sitekey: rk, callback: () => { liVerified = true; } });
sCid = grecaptcha.render("sCaptcha", { sitekey: rk, callback: () => { sVerified = true; } });
} else {
setTimeout(rCap, 300);
} }
rCap();
// ok
function usernameToEmail(username) { return username.trim().toLowerCase() + "@app.local"; }
// flag
let manualAuthInProgress = false;
// dih
sSP.onchange = () => { sPA.type = sSP.checked ? "text" : "password"; sCOPA.type = sSP.checked ? "text" : "password"; }; liSP.onchange = () => { liPA.type = liSP.checked ? "text" : "password"; };
sSUP.onclick = () => { lCD.style.display = "none"; sCD.style.display = "flex"; sSUP.parentElement.style.display = "none"; sLG.style.display = "block"; document.querySelector("h2").textContent = "※ Register your very own Paint Account! ※"; };
sLGL.onclick = () => { sCD.style.display = "none"; lCD.style.display = "flex"; sSUP.parentElement.style.display = "block"; sLG.style.display = "none"; document.querySelector("h2").textContent = "※ Log in your Paint Account! ※"; };
function showLoggedInUI(uname) {
actI.textContent = "※ Welcome, " + uname + "! ※";actC.style.display = "block";lCD.style.display = "none";sCD.style.display = "none";sSUP.parentElement.style.display = "none";sLG.style.display = "none";document.querySelector("h2").style.display = "none";
}
function showLoggedOutUI() {
actC.style.display = "none";lCD.style.display = "flex";sCD.style.display = "none";sSUP.parentElement.style.display = "block";sLG.style.display = "none";const h = document.querySelector("h2");h.style.display = "block";h.textContent = "※ Log in your paint account! ※";
}
btnSUP.onclick = async () => {
const username = sUS.value.trim().toLowerCase();const password = sPA.value;const confirmPassword = sCOPA.value;sMsg.textContent = "";
if (!username || !password || !confirmPassword) { sMsg.textContent = "Please fill out all fields."; return; }
if (password !== confirmPassword) { sMsg.textContent = "Passwords do not match."; return; }
const usernameRegex = /^[a-z0-9_]+$/;
if (username.length === 0 || username.length > 20 || !usernameRegex.test(username)) {
sMsg.textContent = "Username must be 1-20 characters long and contain only lowercase letters, numbers, or underscores!";
return;
}
if (!sVerified) {
sMsg.textContent = "Please complete the reCAPTCHA before registering!";return;
}
manualAuthInProgress = true;
try {
if (auth.currentUser && auth.currentUser.isAnonymous) await signOut(auth);const emailAlias = usernameToEmail(username);const cred = await createUserWithEmailAndPassword(auth, emailAlias, password);const userUid = cred.user.uid;
await set(ref(db, "usernames/" + username), { uid: userUid });
await set(ref(db, "users/" + userUid), { username, drawingCount: 0 });
sMsg.textContent = "※ Successfully created your Paint Account, enjoy! :D ※ " + username;showLoggedInUI(username);
} catch (err) {
let errorMessage = "An error has occurred...";
if (err.code === "auth/email-already-in-use") {
errorMessage = "This username is already in use. Try logging in or use a different username.";
} else if (err.code === "auth/weak-password") {
errorMessage = "Your password is too weak. Please choose a stronger password.";
} else if (err.message && err.message.includes("Permission denied")) {
errorMessage = "Username has already been taken! Please choose another one.";
} else {
errorMessage = "Unexpected error: " + err.message;
}
sMsg.textContent = "※ " + errorMessage + " ※";console.error("Signup error:", err);
} finally {
manualAuthInProgress = false;if (sCid !== null) { grecaptcha.reset(sCid); sVerified = false; }
} };
btnLG.onclick = async () => {
const username = liUS.value.trim().toLowerCase();const password = liPA.value;lMsg.textContent = "";
if (!username || !password) { lMsg.textContent = "Please enter your username and password!"; return; }
if (!liVerified) {
lMsg.textContent = "Please complete the reCAPTCHA before logging in!";return;
}
manualAuthInProgress = true;
try {
if (auth.currentUser && auth.currentUser.isAnonymous) await signOut(auth);await setPersistence(auth, browserSessionPersistence);const emailAlias = usernameToEmail(username);const cred = await signInWithEmailAndPassword(auth, emailAlias, password);lMsg.textContent = "※ Successfully logged in your Paint Account! ※";
showLoggedInUI(username);
} catch (err) {
let errorMessage = "An error has occurred...";
if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
errorMessage = "Invalid username or password.";
} else if (err.code === "auth/invalid-email") {
errorMessage = "Invalid email format.";
}
lMsg.textContent = "※ " + errorMessage + " Error: " + err.message;console.error("Login error:", err);
} finally {
manualAuthInProgress = false;if (lCid !== null) { grecaptcha.reset(lCid); liVerified = false; }
} };
btnLT.onclick = async () => {
await signOut(auth);sMsg.textContent = "";lMsg.textContent = "";
};
onAuthStateChanged(auth, async (user) => {
if (manualAuthInProgress) return;
if (user && user.isAnonymous) {
await signOut(auth);return;
}
if (user) {
const snap = await get(child(ref(db), "users/" + user.uid));const uname = snap.exists() ? snap.val().username : "(unknown)";showLoggedInUI(uname);
} else {
showLoggedOutUI();
}
});
document.addEventListener("click", function playMusic() {
const audio = document.getElementById("bgm");if (audio) { audio.play().catch(err => console.log("Audio play failed:", err)); }document.removeEventListener("click", playMusic);
}, { once: true });
// sigh...
