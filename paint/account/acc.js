import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app-check.js";

import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBVpaaiwzHah24ugYMXPS8F5l_oWi5sdLI",
  authDomain: "draw-e5ea1.firebaseapp.com",
  databaseURL: "https://draw-e5ea1-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "draw-e5ea1",
  storageBucket: "draw-e5ea1.appspot.com",
  messagingSenderId: "749520633273",
  appId: "1:749520633273:web:7150347948e8fcf37c8a68"
};

const app = initializeApp(firebaseConfig);

// Replace with your reCAPTCHA v3 site key from the reCAPTCHA admin console (https://www.google.com/recaptcha/admin)
const siteKey = 'YOUR_RECAPTCHA_V3_SITE_KEY_HERE';

const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider(siteKey),
  isTokenAutoRefreshEnabled: true
});

const auth = getAuth(app);
const db = getDatabase(app);

// DOM elements
const suUsername = document.getElementById("suUsername");
const suPassword = document.getElementById("suPassword");
const suConfirmPassword = document.getElementById("suConfirmPassword");
const suShowPass = document.getElementById("suShowPass");
const signupMsg = document.getElementById("signupMsg");

const liUsername = document.getElementById("liUsername");
const liPassword = document.getElementById("liPassword");
const liShowPass = document.getElementById("liShowPass");
const loginMsg = document.getElementById("loginMsg");

const btnSignUp = document.getElementById("btnSignUp");
const btnLogin = document.getElementById("btnLogin");
const btnLogout = document.getElementById("btnLogout");

const accountCard = document.getElementById("accountCard");
const accountInfo = document.getElementById("accountInfo");

const loginCard = document.getElementById("loginCard");
const signupCard = document.getElementById("signupCard");
const showSignup = document.getElementById("showSignup");
const showLoginP = document.getElementById("showLogin");
const showLoginLink = document.getElementById("showLoginLink");

// Helper function to convert username to email for Firebase Auth
function usernameToEmail(username) {
  return username.trim().toLowerCase() + "@app.local";
}

// Toggle password visibility
suShowPass.onchange = () => {
  suPassword.type = suShowPass.checked ? "text" : "password";
  suConfirmPassword.type = suShowPass.checked ? "text" : "password";
};
liShowPass.onchange = () => {
  liPassword.type = liShowPass.checked ? "text" : "password";
};

// Toggle between login and signup
showSignup.onclick = () => {
  loginCard.style.display = "none";
  showSignup.parentElement.style.display = "none";
  signupCard.style.display = "flex";
  showLoginP.style.display = "block";
  document.querySelector('h2').textContent = "※⁜ register your paint account! ⁜※";
};

showLoginLink.onclick = () => {
  signupCard.style.display = "none";
  showLoginP.style.display = "none";
  loginCard.style.display = "flex";
  showSignup.parentElement.style.display = "block";
  document.querySelector('h2').textContent = "※⁜ log in your paint account! ⁜※";
};

// Sign up logic
btnSignUp.onclick = async () => {
  const username = suUsername.value.trim().toLowerCase();
  const password = suPassword.value;
  const confirmPassword = suConfirmPassword.value;

  signupMsg.textContent = ""; // Clear previous messages

  if (!username || !password || !confirmPassword) {
    signupMsg.textContent = "Please fill out all fields.";
    return;
  }

  if (password !== confirmPassword) {
    signupMsg.textContent = "Passwords do not match.";
    return;
  }

  // --- Client-Side Username Validation ---
  const usernameRegex = /^[a-z0-9_]+$/;
  if (username.length === 0 || username.length > 20 || !usernameRegex.test(username)) {
    signupMsg.textContent = "※⁜ username must be 1-20 characters long and contain only lowercase letters, numbers, or underscores! ⁜※";
    return;
  }

  try {
    // 1. Create user in Firebase Authentication
    // This action also automatically signs in the user.
    const emailAlias = usernameToEmail(username);
    const cred = await createUserWithEmailAndPassword(auth, emailAlias, password);
    const userUid = cred.user.uid; // Get the UID of the newly created and authenticated user.

    // 2. Attempt to write username mapping to Realtime Database.
    // Your RTDB rule `!data.exists()` will ensure uniqueness.
    // If the username is already taken, this `set` operation will be denied by the RTDB rules.
    await set(ref(db, "usernames/" + username), { uid: userUid });

    // 3. If username mapping succeeds, write user profile.
    // This will also be protected by your `auth.uid === $uid` rule.
    await set(ref(db, "users/" + userUid), { username });

    signupMsg.textContent = "※⁜ successfully created your paint account! ⁜※ " + username;

  } catch (err) {
    let errorMessage = "an error has occurred...";

    if (err.code && err.code.startsWith('auth/')) {
      // Handle Firebase Authentication specific errors (e.g., weak password, email already in use)
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = "※⁜ this email (username alias) is already in use. Try logging in or use a different username. ⁜※";
      } else if (err.code === 'auth/weak-password') {
        errorMessage = "※⁜ password is too weak. Please choose a stronger password. ⁜※";
      } else {
        errorMessage = `Authentication error: ${err.message}`;
      }
    } else if (err.message && err.message.includes("Permission denied")) {
        // This specific "Permission denied" error after successful Firebase Auth
        // indicates that the Realtime Database `set` operation failed.
        // Given your rules, this most likely means the username was already taken
        // (because `!data.exists()` in your `usernames` rule failed).
        errorMessage = "※⁜ username has already been taken! please choose another one. ⁜※";
        // OPTIONAL: If the username 'set' fails, you might want to delete the Firebase Auth user
        // that was just created to keep things consistent. Be cautious with this.
        // await auth.currentUser.delete();
    } else {
      // General unexpected errors
      errorMessage = `Unexpected error: ${err.message}`;
    }
    signupMsg.textContent = `※⁜ ${errorMessage} ⁜※`;
    console.error("Signup error:", err);
  }
};

// Login logic
btnLogin.onclick = async () => {
  const username = liUsername.value.trim().toLowerCase();
  const password = liPassword.value;

  loginMsg.textContent = ""; // Clear previous messages

  if (!username || !password) {
    loginMsg.textContent = "※⁜ please enter your username and password! ⁜※";
    return;
  }

  try {
    // Set persistence (session means login lasts until browser close)
    await setPersistence(auth, browserSessionPersistence);

    // Sign in with email/password (using alias)
    const emailAlias = usernameToEmail(username);
    await signInWithEmailAndPassword(auth, emailAlias, password);

    loginMsg.textContent = "※⁜ successfully logged in your paint account! ⁜※";
  } catch (err) {
    // Handle login errors
    let errorMessage = "an error has occurred...";
    if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
      errorMessage = "※⁜ invalid username or password. ⁜※";
    } else if (err.code === 'auth/invalid-email') {
      errorMessage = "※⁜ invalid email format. ⁜※";
    }
    loginMsg.textContent = `※⁜ ${errorMessage} ⁜※ error: ${err.message}`;
    console.error("Login error:", err);
  }
};

// Logout logic
btnLogout.onclick = async () => {
  await signOut(auth);
  signupMsg.textContent = ""; // Clear messages on logout
  loginMsg.textContent = "";
};

// Auth state change listener (updates UI based on login status)
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // User is signed in, fetch their username from RTDB
    // NOTE: This `get` is allowed because it's to `users/{uid}/username`, which has `.read: "auth != null && auth.uid === $uid"`
    const snap = await get(child(ref(db), "users/" + user.uid));
    const uname = snap.exists() ? snap.val().username : "(unknown)";
    accountInfo.textContent = "※⁜ welcome, " + uname + "! ⁜※";
    accountCard.style.display = "block";
    loginCard.style.display = "none";
    signupCard.style.display = "none";
    showSignup.parentElement.style.display = "none";
    showLoginP.style.display = "none";
    document.querySelector('h2').style.display = "none";
  } else {
    // User is signed out
    accountCard.style.display = "none";
    loginCard.style.display = "flex";
    signupCard.style.display = "none";
    showSignup.parentElement.style.display = "block";
    showLoginP.style.display = "none";
    document.querySelector('h2').style.display = "block";
    document.querySelector('h2').textContent = "※⁜ log in your paint account! ⁜※";
  }
});

// Autoplay background music on first user interaction
document.addEventListener("click", function playMusic() {
  const audio = document.getElementById("bgm");
  audio.play().catch(err => console.log("Audio play failed:", err)); // Log error if audio fails to play
  document.removeEventListener("click", playMusic); // Remove listener after first click
}, { once: true }); // Ensure listener runs only once