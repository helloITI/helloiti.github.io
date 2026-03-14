import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
// TSTTTTTTTTTTTTTTTTTS PMOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO 😂😂😂
// i love and hate firebase at the same time.
// well firebase is easier than... other stuff such as cloudflare, even if it has 1GB of storage its still easy 🥹
const firebaseConfig = {
  apiKey: "AIzaSyDGSMqVYXnhuOZdyKXgeQ7KxFhOncHb-ho",
  authDomain: "mii-storage.firebaseapp.com",
  databaseURL: "https://mii-storage-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "mii-storage",
  storageBucket: "mii-storage.firebasestorage.app",
  messagingSenderId: "974344318870",
  appId: "1:974344318870:web:3037dc6620f656ef67f7b7"
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