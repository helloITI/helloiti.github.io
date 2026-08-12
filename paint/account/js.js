import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInAnonymously, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getDatabase, ref, set, get, child, update, remove, onValue, query, orderByChild, equalTo, limitToFirst } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

const [_a,_b,_c,_d,_e,_f,_g,_h] = ["QUl6YVN5Qmx6WG45YnlnZU5fMEF5RFFIWURmMlQydk82NldBemZ3","cGFpbnQtcHJvamVjdC1lM2VjZC5maXJlYmFzZWFwcC5jb20","aHR0cHM6Ly9wYWludC1wcm9qZWN0LWUzZWNkLWRlZmF1bHQtcnRkYi5ldXJvcGUtd2VzdDEuZmlyZWJhc2VkYXRhYmFzZS5hcHA","cGFpbnQtcHJvamVjdC1lM2VjZA","cGFpbnQtcHJvamVjdC1lM2VjZC5maXJlYmFzZXN0b3JhZ2UuYXBw","MTQxMTE0MTc3MzE3","MToxNDExMTQxNzczMTc6d2ViOmQ2Yzc4MTU1ZjI4MzdlN2I0YTBjY2M","Ry0yNTNDMUhaQjFW"].map(atob);
const firebaseConfig = {apiKey:_a,authDomain:_b,databaseURL:_c,projectId:_d,storageBucket:_e,messagingSenderId:_f,appId:_g,measurementId:_h};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

function getDeviceId(){
  let id = localStorage.getItem('pdid');
  if(!id){
    id = (crypto.randomUUID ? crypto.randomUUID() : (Date.now().toString(36) + Math.random().toString(36).slice(2)));
    localStorage.setItem('pdid', id);
  }
  return id;
}
const deviceId = getDeviceId();

let isBanned = false;
let unsubBan = null;

function checkBanData(u){
  if(!u) return false;
  if(u.bannedUntil && u.bannedUntil > 0 && Date.now() < u.bannedUntil) return true;
  if(u.banned === true && (!u.bannedUntil || u.bannedUntil === 0)) return true;
  return false;
}

function getBanMessage(uv){
  const reason = uv.banReason || uv.reason;
  const reasonStr = reason ? " Reason: " + reason : "";
  if(uv.bannedUntil && uv.bannedUntil > 0 && Date.now() < uv.bannedUntil){
    return "※ Your account has been banned until: " + new Date(uv.bannedUntil).toLocaleString() + "." + reasonStr + " ※";
  }
  return "※ Your account has been banned." + reasonStr + " ※";
}

const banMsg = document.createElement("p");
banMsg.style.cssText = "color:#ff6b6b;font-size:14px;margin-top:20px;display:none;";
document.body.appendChild(banMsg);

const r_u = document.getElementById("r_u");
const r_e = document.getElementById("r_e");
const r_p = document.getElementById("r_p");
const r_cp = document.getElementById("r_cp");
const r_sp = document.getElementById("r_sp");
const r_msg = document.getElementById("r_msg");

const l_u = document.getElementById("l_u");
const l_e = document.getElementById("l_e");
const l_p = document.getElementById("l_p");
const l_cp = document.getElementById("l_cp");
const l_sp = document.getElementById("l_sp");
let l_msg = document.getElementById("l_msg");

const b_sup = document.getElementById("b_sup");
const b_lg = document.getElementById("b_lg");
const b_lt = document.getElementById("b_lt");
const b_gl = document.getElementById("b_gl");

const act_c = document.getElementById("act_c");
const act_i = document.getElementById("act_i");

const l_cd = document.getElementById("l_cd");
const s_cd = document.getElementById("s_cd");

const g_div = document.getElementById("g_div");
const g_u = document.getElementById("g_u");
const b_gus = document.getElementById("b_gus");
const g_msg = document.getElementById("g_msg");

let pendingGoogleUser = null;

const b_ssup = document.getElementById("b_ssup");
const b_slg = document.getElementById("b_slg");
const b_slgl = document.getElementById("b_slgl");
const st_p = document.getElementById("st_p");
const b_sto = document.getElementById("b_sto");
const b_stc = document.getElementById("b_stc");

const st_nu = document.getElementById("st_nu");
const b_stu = document.getElementById("b_stu");
const st_um = document.getElementById("st_um");

const st_ne = document.getElementById("st_ne");
const st_cp_e = document.getElementById("st_cp_e");
const b_ste = document.getElementById("b_ste");
const st_em = document.getElementById("st_em");

const st_cp = document.getElementById("st_cp");
const st_np = document.getElementById("st_np");
const st_cop = document.getElementById("st_cop");
const b_stp = document.getElementById("b_stp");
const st_pm = document.getElementById("st_pm");

const st_es = document.getElementById("st_es");
const st_ps = document.getElementById("st_ps");

let currentUsername = null;
let currentIsGoogle = false;

function enforceBan(msg){
  isBanned = true;
  if(unsubBan){ unsubBan(); unsubBan = null; }
  st_p.style.display = "none";
  act_c.style.display = "none";
  l_cd.style.display = "none";
  s_cd.style.display = "none";
  b_gl.style.display = "none";
  if(document.getElementById("orb")) document.getElementById("orb").style.display = "none";
  g_div.style.display = "none";
  document.querySelectorAll("p").forEach(p => { if(p !== banMsg) p.style.display = "none"; });
  document.querySelector("h2").style.display = "none";
  banMsg.textContent = msg;
  banMsg.style.display = "block";
}

function startBanListener(uid){
  if(unsubBan){ unsubBan(); unsubBan = null; }
  unsubBan = onValue(ref(db, "users/" + uid), (s) => {
    if(!s.exists()) return;
    const uv = s.val();
    if(checkBanData(uv)){
      if(unsubBan){ unsubBan(); unsubBan = null; }
      enforceBan(getBanMessage(uv));
    }
  }, () => {});
}

function emailKey(email){
  return email.trim().toLowerCase().replace(/\./g, ",");
}

function isValidEmail(email){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

let manualAuthInProgress = false;

if(r_sp) r_sp.onchange = () => { r_p.type = r_sp.checked ? "text" : "password"; r_cp.type = r_sp.checked ? "text" : "password"; };
if(l_sp) l_sp.onchange = () => { l_p.type = l_sp.checked ? "text" : "password"; l_cp.type = l_sp.checked ? "text" : "password"; };

if(b_ssup) b_ssup.onclick = () => {
  l_cd.style.display = "none";
  s_cd.style.display = "flex";
  b_ssup.parentElement.style.display = "none";
  b_slg.style.display = "block";
  document.querySelector("h2").textContent = "※ Register your very own Paint Account! ※";
};

if(b_slgl) b_slgl.onclick = () => {
  s_cd.style.display = "none";
  l_cd.style.display = "flex";
  b_ssup.parentElement.style.display = "block";
  b_slg.style.display = "none";
  document.querySelector("h2").textContent = "※ Log in your Paint Account! ※";
};

const orb = document.getElementById("orb");

function showLoggedInUI(uname, isGoogle, banned){
  currentUsername = uname;
  currentIsGoogle = !!isGoogle;
  act_i.textContent = "※ Welcome, @" + uname + "! ※";
  act_c.style.display = "block";
  l_cd.style.display = "none";
  s_cd.style.display = "none";
  if(orb) orb.style.display = "none";
  if(b_ssup) b_ssup.parentElement.style.display = "none";
  if(b_slg) b_slg.style.display = "none";
  b_gl.style.display = "none";
  g_div.style.display = "none";
  document.querySelector("h2").style.display = "none";
  st_p.style.display = "none";
  st_es.style.display = isGoogle ? "none" : "block";
  st_ps.style.display = isGoogle ? "none" : "block";
  b_lt.style.display = banned ? "none" : "block";
  b_sto.style.display = banned ? "none" : "block";
}

function showLoggedOutUI(){
  if(isBanned) return;
  currentUsername = null;
  if(unsubBan){ unsubBan(); unsubBan = null; }
  st_p.style.display = "none";
  act_c.style.display = "none";
  l_cd.style.display = "flex";
  s_cd.style.display = "none";
  if(orb) orb.style.display = "block";
  if(b_ssup) b_ssup.parentElement.style.display = "block";
  if(b_slg) b_slg.style.display = "none";
  b_gl.style.display = "block";
  g_div.style.display = "none";
  const h = document.querySelector("h2");
  h.style.display = "block";
  h.textContent = "※ Log in your Paint Account! ※";
}

b_sto.onclick = () => {
  act_c.style.display = "none";
  st_p.style.display = "flex";
  st_um.textContent = "";
  st_em.textContent = "";
  st_pm.textContent = "";
  st_nu.value = "";
  st_ne.value = "";
  st_cp_e.value = "";
  st_cp.value = "";
  st_np.value = "";
  st_cop.value = "";
  st_es.style.display = currentIsGoogle ? "none" : "block";
  st_ps.style.display = currentIsGoogle ? "none" : "block";
  document.getElementById("ds1").style.display = "none";
  document.getElementById("ds2").style.display = "none";
  document.getElementById("ds3").style.display = "none";
  document.getElementById("d_e").value = "";
  document.getElementById("d_p").value = "";
  document.getElementById("d_msg").textContent = "";
  if(currentIsGoogle){
    if(document.getElementById("d_e")) document.getElementById("d_e").style.display = "none";
    if(document.getElementById("d_p")) document.getElementById("d_p").style.display = "none";
    b_df.textContent = "Sign in with Google to Delete";
  } else {
    if(document.getElementById("d_e")) document.getElementById("d_e").style.display = "block";
    if(document.getElementById("d_p")) document.getElementById("d_p").style.display = "block";
    b_df.textContent = "※ Permanently Delete Account ※";
  }
};

b_stc.onclick = () => { st_p.style.display = "none"; act_c.style.display = "block"; };

b_stu.onclick = async () => {
  const newUN = st_nu.value.trim().toLowerCase();
  st_um.textContent = "";
  if(!newUN){ st_um.textContent = "Please enter a new username."; return; }
  if(newUN === currentUsername){ st_um.textContent = "That's already your username 😭✌️"; return; }
  if(newUN.length < 3 || newUN.length > 20 || !/^[a-z0-9_]+$/.test(newUN)){
    st_um.textContent = "Usernames must be 3-20 characters: letters, numbers, underscores only.";
    return;
  }
  const user = auth.currentUser;
  if(!user) return;
  try{
    const taken = await get(child(ref(db), "usernames/" + newUN));
    if(taken.exists()){ st_um.textContent = "※ That username is already taken. ※"; return; }
    const oldUN = currentUsername;
    await update(ref(db), {
      ["usernames/" + newUN]: { uid: user.uid },
      ["usernames/" + oldUN]: null,
      ["users/" + user.uid + "/username"]: newUN
    });
    currentUsername = newUN;
    act_i.textContent = "※ Welcome, @" + newUN + "! ※";
    st_um.textContent = "※ Username updated! ※";
    st_nu.value = "";
  } catch(err){
    st_um.textContent = "※ Error: " + err.message + " ※";
  }
};

b_ste.onclick = async () => {
  const newEM = st_ne.value.trim().toLowerCase();
  const curPA = st_cp_e.value;
  st_em.textContent = "";
  if(!newEM || !curPA){ st_em.textContent = "Please fill out all fields."; return; }
  if(!isValidEmail(newEM)){ st_em.textContent = "Please enter a valid email address."; return; }
  const user = auth.currentUser;
  if(!user) return;
  try{
    const cred = EmailAuthProvider.credential(user.email, curPA);
    await reauthenticateWithCredential(user, cred);
    const snap = await get(child(ref(db), "users/" + user.uid));
    const oldEmail = snap.exists() ? snap.val().email : null;
    await updateEmail(user, newEM);
    const dbUp = {
      ["emails/" + emailKey(newEM)]: { uid: user.uid },
      ["users/" + user.uid + "/email"]: newEM
    };
    if(oldEmail) dbUp["emails/" + emailKey(oldEmail)] = null;
    await update(ref(db), dbUp);
    st_em.textContent = "※ Email updated! ※";
    st_ne.value = "";
    st_cp_e.value = "";
  } catch(err){
    if(err.code === "auth/wrong-password"){ st_em.textContent = "※ Wrong password. ※"; }
    else if(err.code === "auth/email-already-in-use"){ st_em.textContent = "※ That email is already in use. ※"; }
    else{ st_em.textContent = "※ Error: " + err.message + " ※"; }
  }
};

b_stp.onclick = async () => {
  const curPA = st_cp.value;
  const newPA = st_np.value;
  const coPA = st_cop.value;
  st_pm.textContent = "";
  if(!curPA || !newPA || !coPA){ st_pm.textContent = "Please fill out all fields."; return; }
  if(newPA !== coPA){ st_pm.textContent = "New passwords don't match."; return; }
  if(newPA.length < 6){ st_pm.textContent = "Password must be at least 6 characters."; return; }
  const user = auth.currentUser;
  if(!user) return;
  try{
    const cred = EmailAuthProvider.credential(user.email, curPA);
    await reauthenticateWithCredential(user, cred);
    await updatePassword(user, newPA);
    st_pm.textContent = "※ Password updated! ※";
    st_cp.value = "";
    st_np.value = "";
    st_cop.value = "";
  } catch(err){
    if(err.code === "auth/wrong-password"){ st_pm.textContent = "※ Wrong password. ※"; }
    else{ st_pm.textContent = "※ Error: " + err.message + " ※"; }
  }
};

let _supBusy = false;
b_sup.onclick = async () => {
  if(_supBusy) return;
  _supBusy = true;
  setTimeout(() => _supBusy = false, 5000);

  const [devSnap] = await Promise.all([get(child(ref(db), "deviceBans/" + deviceId))]);
  if(devSnap.exists() && devSnap.val() === true){
    r_msg.textContent = "This device has been banned.";
    return;
  }

  const username = r_u.value.trim().toLowerCase();
  const email = r_e.value.trim().toLowerCase();
  const password = r_p.value;
  const confirmPassword = r_cp.value;
  r_msg.textContent = "";

  if(!username || !email || !password || !confirmPassword){ r_msg.textContent = "Please fill out all fields."; return; }
  if(username.length < 3 || username.length > 20 || !/^[a-z0-9_]+$/.test(username)){
    r_msg.textContent = "Usernames must be 3-20 characters: letters, numbers, underscores only.";
    return;
  }
  if(!isValidEmail(email)){ r_msg.textContent = "Please enter a valid email address."; return; }
  if(password !== confirmPassword){ r_msg.textContent = "Passwords don't match."; return; }

  manualAuthInProgress = true;
  let cred;
  try{
    if(auth.currentUser && auth.currentUser.isAnonymous) await signOut(auth);
    cred = await createUserWithEmailAndPassword(auth, email, password);

    const updates = {};
    updates["usernames/" + username] = { uid: cred.user.uid };
    updates["emails/" + emailKey(email)] = { uid: cred.user.uid };
    updates["users/" + cred.user.uid] = { username, email, deviceId };
    updates["devices/" + deviceId + "/uids/" + cred.user.uid] = true;

    await update(ref(db), updates);

    showLoggedInUI(username, false, false);
    startBanListener(cred.user.uid);
  } catch(err){
    if(cred && cred.user){ try{ await cred.user.delete(); } catch{} }
    if(err.code === "auth/email-already-in-use"){
      r_msg.textContent = "That email is already in use by another account.";
    } else if(err.message && err.message.includes("PERMISSION_DENIED")){
      r_msg.textContent = "That username or email is already taken.";
    } else {
      r_msg.textContent = "※ Error: " + err.message + " ※";
    }
  } finally {
    manualAuthInProgress = false;
  }
};

let _lgBusy = false;
b_lg.onclick = async () => {
  if(_lgBusy) return;
  _lgBusy = true;
  setTimeout(() => _lgBusy = false, 5000);

  const devSnap = await get(child(ref(db), "deviceBans/" + deviceId)).catch(() => null);
  if(devSnap && devSnap.exists() && devSnap.val() === true){
    l_msg.textContent = "This device has been banned.";
    return;
  }

  const email = l_e.value.trim().toLowerCase();
  const password = l_p.value;
  const confirmPassword = l_cp.value;
  l_msg.textContent = "";

  if(!email || !password || !confirmPassword){ l_msg.textContent = "Please fill out all fields."; return; }
  if(password !== confirmPassword){ l_msg.textContent = "Passwords don't match."; return; }

  manualAuthInProgress = true;
  try{
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const snap = await get(child(ref(db), "users/" + cred.user.uid));
    const uv = snap.exists() ? snap.val() : null;

    if(uv && checkBanData(uv)){
      manualAuthInProgress = false;
      enforceBan(getBanMessage(uv));
      return;
    }

    const updates = {};
    updates["users/" + cred.user.uid + "/deviceId"] = deviceId;
    updates["devices/" + deviceId + "/uids/" + cred.user.uid] = true;
    await update(ref(db), updates);

    const username = uv ? uv.username : email.split("@")[0];
    showLoggedInUI(username, false, false);
    startBanListener(cred.user.uid);
  } catch(err){
    console.error("[login error]", err.code, err);
    l_msg.textContent = "※ Error: " + err.message + " ※";
  } finally {
    manualAuthInProgress = false;
  }
};

let _glBusy = false;
b_gl.onclick = async () => {
  if(_glBusy) return;
  _glBusy = true;
  setTimeout(() => _glBusy = false, 5000);

  const devSnap = await get(child(ref(db), "deviceBans/" + deviceId)).catch(() => null);
  if(devSnap && devSnap.exists() && devSnap.val() === true){
    l_msg.textContent = "This device has been banned.";
    return;
  }

  l_msg.textContent = "";
  r_msg.textContent = "";
  manualAuthInProgress = true;
  try{
    if(auth.currentUser && auth.currentUser.isAnonymous) await signOut(auth);
    const cred = await signInWithPopup(auth, new GoogleAuthProvider());
    pendingGoogleUser = cred.user;
    const snap = await get(child(ref(db), "users/" + cred.user.uid));

    if(snap.exists() && snap.val().username){
      const uv = snap.val();
      if(checkBanData(uv)){
        manualAuthInProgress = false;
        enforceBan(getBanMessage(uv));
        return;
      }
      const updates = {};
      updates["users/" + cred.user.uid + "/deviceId"] = deviceId;
      updates["devices/" + deviceId + "/uids/" + cred.user.uid] = true;
      await update(ref(db), updates);

      manualAuthInProgress = false;
      showLoggedInUI(uv.username, true, false);
      startBanListener(cred.user.uid);
    } else {
      l_cd.style.display = "none";
      s_cd.style.display = "none";
      if(b_ssup) b_ssup.parentElement.style.display = "none";
      if(b_slg) b_slg.style.display = "none";
      b_gl.style.display = "none";
      if(orb) orb.style.display = "none";
      document.querySelector("h2").textContent = "※ One more step! ※";
      g_u.value = "";
      g_msg.textContent = "";
      g_div.style.display = "flex";
    }
  } catch(err){
    manualAuthInProgress = false;
    if(err.code !== "auth/popup-closed-by-user" && err.code !== "auth/cancelled-popup-request"){
      (l_cd.style.display !== "none" ? l_msg : r_msg).textContent = "※ Error: " + err.message + " ※";
    }
  }
};

let _gusBusy = false;
b_gus.onclick = async () => {
  if(_gusBusy) return;
  _gusBusy = true;
  setTimeout(() => _gusBusy = false, 5000);

  const devSnap = await get(child(ref(db), "deviceBans/" + deviceId)).catch(() => null);
  if(devSnap && devSnap.exists() && devSnap.val() === true){
    g_msg.textContent = "This device has been banned.";
    return;
  }

  const username = g_u.value.trim().toLowerCase();
  g_msg.textContent = "";
  if(!username){ g_msg.textContent = "Please choose a username."; return; }
  if(username.length < 3 || username.length > 20 || !/^[a-z0-9_]+$/.test(username)){
    g_msg.textContent = "Usernames must be 3-20 characters: letters, numbers, underscores only.";
    return;
  }

  const user = pendingGoogleUser || auth.currentUser;
  if(!user){ g_msg.textContent = "※ Something went wrong, please try signing in again. ※"; return; }
  const email = (user.email || `google_${user.uid}@app.local`).trim().toLowerCase();

  try{
    const updates = {};
    updates["usernames/" + username] = { uid: user.uid };
    updates["emails/" + emailKey(email)] = { uid: user.uid };
    updates["users/" + user.uid] = { username, email, deviceId };
    updates["devices/" + deviceId + "/uids/" + user.uid] = true;

    await update(ref(db), updates);

    manualAuthInProgress = false;
    showLoggedInUI(username, true, false);
    startBanListener(user.uid);
  } catch(err){
    manualAuthInProgress = false;
    if(err.message && err.message.includes("PERMISSION_DENIED")){
      g_msg.textContent = "That username is taken, or this Google account's email is already linked to another account.";
    } else {
      g_msg.textContent = "※ Error: " + err.message + " ※";
    }
  }
};

b_lt.onclick = async () => {
  await signOut(auth);
  signInAnonymously(auth).catch(() => {});
};

onAuthStateChanged(auth, async (user) => {
  if(manualAuthInProgress) return;
  if(user && !user.isAnonymous){
    const devSnap = await get(child(ref(db), "deviceBans/" + deviceId)).catch(() => null);
    if(devSnap && devSnap.exists() && devSnap.val() === true){
      enforceBan("This device has been banned.");
      return;
    }
    let snap;
    try{
      snap = await get(child(ref(db), "users/" + user.uid));
    } catch(err){
      await new Promise(r => setTimeout(r, 800));
      try{ snap = await get(child(ref(db), "users/" + user.uid)); }
      catch(err2){
        showLoggedInUI(user.email ? user.email.split("@")[0] : "Anonymous", false, false);
        return;
      }
    }
    if(snap.exists() && snap.val().username){
      const uv = snap.val();
      if(checkBanData(uv)){
        enforceBan(getBanMessage(uv));
        return;
      }
      const isGoogle = user.providerData.some(p => p.providerId === "google.com");
      showLoggedInUI(uv.username, isGoogle, false);
      startBanListener(user.uid);
    } else {
      await signOut(auth);
      signInAnonymously(auth).catch(() => {});
      showLoggedOutUI();
    }
  } else {
    const devSnap = await get(child(ref(db), "deviceBans/" + deviceId)).catch(() => null);
    if(devSnap && devSnap.exists() && devSnap.val() === true){
      enforceBan("This device has been banned.");
      return;
    }
    if(!user){
      signInAnonymously(auth).catch(() => {});
    } else {
      showLoggedOutUI();
    }
  }
});

const b_da1 = document.getElementById("b_da1");
const ds1 = document.getElementById("ds1");
const ds2 = document.getElementById("ds2");
const ds3 = document.getElementById("ds3");
const b_dy1 = document.getElementById("b_dy1");
const b_dn1 = document.getElementById("b_dn1");
const b_dy2 = document.getElementById("b_dy2");
const b_dn2 = document.getElementById("b_dn2");
const b_df = document.getElementById("b_df");
const b_dn3 = document.getElementById("b_dn3");
const d_e = document.getElementById("d_e");
const d_p = document.getElementById("d_p");
const d_msg = document.getElementById("d_msg");

function resetDelSteps(){
  ds1.style.display = "none";
  ds2.style.display = "none";
  ds3.style.display = "none";
  if(d_e) d_e.value = "";
  if(d_p) d_p.value = "";
  d_msg.textContent = "";
}

if(b_da1) b_da1.onclick = () => { resetDelSteps(); ds1.style.display = "block"; };
if(b_dn1) b_dn1.onclick = () => { resetDelSteps(); };
if(b_dy1) b_dy1.onclick = () => { ds1.style.display = "none"; ds2.style.display = "block"; };
if(b_dn2) b_dn2.onclick = () => { resetDelSteps(); };
if(b_dy2) b_dy2.onclick = () => { ds2.style.display = "none"; ds3.style.display = "block"; };
if(b_dn3) b_dn3.onclick = () => { resetDelSteps(); };

b_df.onclick = async () => {
  d_msg.textContent = "";
  const user = auth.currentUser;
  if(!user){ d_msg.textContent = "※ Something went wrong. ※"; return; }
  try{
    let cred;
    if(currentIsGoogle){
      manualAuthInProgress = true;
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      cred = GoogleAuthProvider.credentialFromResult(result);
    } else {
      const email = d_e.value.trim().toLowerCase();
      const password = d_p.value;
      if(!email || !password){ d_msg.textContent = "Please fill out all fields."; return; }
      cred = EmailAuthProvider.credential(email, password);
    }
    if(!cred){ d_msg.textContent = "※ Authentication failed. ※"; manualAuthInProgress = false; return; }
    await reauthenticateWithCredential(user, cred);

    const uid = user.uid;
    const snap = await get(child(ref(db), "users/" + uid));
    const uv = snap.exists() ? snap.val() : null;
    const username = uv ? uv.username : null;
    const userEmail = uv ? uv.email : (user.email || "");

    const contentUpdates = {};
    const drawingsQuery = query(ref(db, "drawings"), orderByChild("authorId"), equalTo(uid), limitToFirst(50));
    const drawingsSnap = await get(drawingsQuery);
    const galleryQuery = query(ref(db, "galleryDrawings"), orderByChild("authorId"), equalTo(uid), limitToFirst(50));
    const gallerySnap = await get(galleryQuery);

    if(drawingsSnap.exists()){
      drawingsSnap.forEach((childSnap) => { contentUpdates["drawings/" + childSnap.key] = null; });
    }
    if(gallerySnap.exists()){
      gallerySnap.forEach((childSnap) => { contentUpdates["galleryDrawings/" + childSnap.key] = null; });
    }
    if(Object.keys(contentUpdates).length > 0){
      await update(ref(db), contentUpdates);
    }

    const userUpdates = {};
    userUpdates["users/" + uid] = null;
    if(username) userUpdates["usernames/" + username] = null;
    if(userEmail) userUpdates["emails/" + emailKey(userEmail)] = null;
    if(deviceId) userUpdates["devices/" + deviceId + "/uids/" + uid] = null;

    await update(ref(db), userUpdates);
    await user.delete();
    showLoggedOutUI();
    manualAuthInProgress = false;
  } catch(err){
    manualAuthInProgress = false;
    if(err.code === "auth/wrong-password" || err.code === "auth/invalid-credential"){
      d_msg.textContent = "※ Wrong email or password. ※";
    } else if(err.code === "auth/popup-closed-by-user"){
      d_msg.textContent = "Re-authentication canceled.";
    } else {
      d_msg.textContent = "※ Error: " + err.message + " ※";
    }
  }
};
