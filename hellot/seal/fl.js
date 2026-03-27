import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
// TSTTTTTTTTTTTTTTTTTS PMOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO 😂😂😂
// i love and hate firebase at the same time.
// well firebase is easier than... other stuff such as cloudflare, even if it has 1GB of storage its still easy 🥹
  const firebaseConfig = {
    apiKey: "AIzaSyBMBAlA_yAXxzeos2xQGrvGRh05UaxomjM",
    authDomain: "son-im-crine.firebaseapp.com",
    databaseURL: "https://son-im-crine-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "son-im-crine",
    storageBucket: "son-im-crine.firebasestorage.app",
    messagingSenderId: "826626917380",
    appId: "1:826626917380:web:66e2e78d9d7f92cc25a151",
    measurementId: "G-T2YGTXMVSF"
  };
const app = initializeApp(firebaseConfig); const db = getDatabase(app); const auth = getAuth(app); signInAnonymously(auth);
const counterRef = ref(db, "tictac");
let currentClicks = 0;
window.updateCounterText = function() {
  const lang = window.currentLang || 'en';
  const trans = window.translations[lang];
  document.getElementById("fuck").textContent = `※⁜ ${currentClicks} ${trans.clicks} ⁜※`;
};
onValue(counterRef, (snapshot) => {
  const val = snapshot.val() ?? 0;
  currentClicks = val;
  window.updateCounterText();
});
const YapYoo = document.getElementById("YapYoo"); const MarioKar = document.getElementById("MarioKar"); // Wait... Did HE just say is last name, is MarioKar?! /ref
YapYoo.addEventListener("click", () => {
  MarioKar.currentTime = 0; MarioKar.play().catch(() => {});
  runTransaction(counterRef, (current) => (current || 0) + 1);
  if (sealModel) {
    targetScale.set(1.4, 0.7, 1.4);
  }
  if (!window.specialTriggered && window.flyRegex.test(window.chosenText)) {
    window.triggerSealFly();
  }
});
