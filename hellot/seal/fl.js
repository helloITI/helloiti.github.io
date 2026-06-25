/* hi skibibi!!! 🤣🤣🤣 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAQgHeDZ43_9JciQN1SRSCGBSJUZ2BgDT8",
  authDomain: "sealcl.firebaseapp.com",
  databaseURL: "https://sealcl-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "sealcl",
  storageBucket: "sealcl.firebasestorage.app",
  messagingSenderId: "136985893697",
  appId: "1:136985893697:web:4792c2a645841be067dfc0",
  measurementId: "G-RN8BDPZXX4"
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
