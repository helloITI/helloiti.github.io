/*  */
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";import { getDatabase, ref, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";const [_a,_b,_c,_d,_e,_f,_g,_h] = ["QUl6YVN5QVFnSGVEWjQzXzlKY2lRTjFTUlNDR0JTSlVaMkJnRFQ4","c2VhbGNsLmZpcmViYXNlYXBwLmNvbQ","aHR0cHM6Ly9zZWFsY2wtZGVmYXVsdC1ydGRiLmV1cm9wZS13ZXN0MS5maXJlYmFzZWRhdGFiYXNlLmFwcA","c2VhbGNs","c2VhbGNsLmZpcmViYXNlc3RvcmFnZS5hcHA","MTM2OTg1ODkzNjk3","MToxMzY5ODU4OTM2OTc6d2ViOjQ3OTJjMmE2NDU4NDFiZTA2N2RmYzA","Ry1STjhCRFBaWFg0"].map(atob);const firebaseConfig = {apiKey:_a,authDomain:_b,databaseURL:_c,projectId:_d,storageBucket:_e,messagingSenderId:_f,appId:_g,measurementId:_h};
const app = initializeApp(firebaseConfig); const db = getDatabase(app); const auth = getAuth(app); signInAnonymously(auth);const counterRef = ref(db, "tictac");let currentClicks = 0;
window.updateCounterText = function() { const lang = window.currentLang || 'en';const trans = window.translations[lang];document.getElementById("fuck").textContent = ` ${currentClicks} ${trans.clicks} `; };
onValue(counterRef, (snapshot) => {
const val = snapshot.val() ?? 0;
currentClicks = val;
window.updateCounterText(); });
const YapYoo = document.getElementById("YapYoo"); const MarioKar = document.getElementById("MarioKar");
YapYoo.addEventListener("click", () => {
MarioKar.currentTime = 0; MarioKar.play().catch(() => {});
runTransaction(counterRef, (current) => (current || 0) + 1);
if (sealModel) { targetScale.set(1.4, 0.7, 1.4); }
if (!window.specialTriggered && window.flyRegex.test(window.chosenText)) { window.triggerSealFly(); } });
