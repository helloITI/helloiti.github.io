const [_a,_b,_c,_d,_e,_f,_g,_h] = ["QUl6YVN5Qmx6WG45YnlnZU5fMEF5RFFIWURmMlQydk82NldBemZ3","cGFpbnQtcHJvamVjdC1lM2VjZC5maXJlYmFzZWFwcC5jb20","aHR0cHM6Ly9wYWludC1wcm9qZWN0LWUzZWNkLWRlZmF1bHQtcnRkYi5ldXJvcGUtd2VzdDEuZmlyZWJhc2VkYXRhYmFzZS5hcHA","cGFpbnQtcHJvamVjdC1lM2VjZA","cGFpbnQtcHJvamVjdC1lM2VjZC5maXJlYmFzZXN0b3JhZ2UuYXBw","MTQxMTE0MTc3MzE3","MToxNDExMTQxNzczMTc6d2ViOmQ2Yzc4MTU1ZjI4MzdlN2I0YTBjY2M","Ry0yNTNDMUhaQjFW"].map(atob);
const firebaseConfig = {apiKey:_a,authDomain:_b,databaseURL:_c,projectId:_d,storageBucket:_e,messagingSenderId:_f,appId:_g,measurementId:_h};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

function getDeviceId(){
  var id = localStorage.getItem('pdid');
  if(!id){
    id = (crypto.randomUUID ? crypto.randomUUID() : (Date.now().toString(36) + Math.random().toString(36).slice(2)));
    localStorage.setItem('pdid', id);
  }
  return id;
}
var deviceId = getDeviceId();

var isBanned = false;
var unsubBan = null;

function checkBanData(u){
  if(!u) return false;
  if(u.bannedUntil && u.bannedUntil > 0 && Date.now() < u.bannedUntil) return true;
  if(u.banned === true && (!u.bannedUntil || u.bannedUntil === 0)) return true;
  return false;
}

function getBanMessage(uv){
  var reason = uv.banReason || uv.reason;
  var reasonStr = reason ? " Reason: " + reason : "";
  if(uv.bannedUntil && uv.bannedUntil > 0 && Date.now() < uv.bannedUntil){
    return "※ Your account has been banned until: " + new Date(uv.bannedUntil).toLocaleString() + "." + reasonStr + " ※";
  }
  return "※ Your account has been banned." + reasonStr + " ※";
}

var banMsg = document.createElement("p");
banMsg.style.cssText = "color:#ff6b6b;font-size:14px;margin-top:20px;display:none;";
document.body.appendChild(banMsg);

var r_u = document.getElementById("r_u");
var r_e = document.getElementById("r_e");
var r_p = document.getElementById("r_p");
var r_cp = document.getElementById("r_cp");
var r_sp = document.getElementById("r_sp");
var r_msg = document.getElementById("r_msg");

var l_u = document.getElementById("l_u");
var l_e = document.getElementById("l_e");
var l_p = document.getElementById("l_p");
var l_cp = document.getElementById("l_cp");
var l_sp = document.getElementById("l_sp");
var l_msg = document.getElementById("l_msg");

var b_sup = document.getElementById("b_sup");
var b_lg = document.getElementById("b_lg");
var b_lt = document.getElementById("b_lt");
var b_gl = document.getElementById("b_gl");

var act_c = document.getElementById("act_c");
var act_i = document.getElementById("act_i");

var l_cd = document.getElementById("l_cd");
var s_cd = document.getElementById("s_cd");

var g_div = document.getElementById("g_div");
var g_u = document.getElementById("g_u");
var b_gus = document.getElementById("b_gus");
var g_msg = document.getElementById("g_msg");

var pendingGoogleUser = null;

var b_ssup = document.getElementById("b_ssup");
var b_slg = document.getElementById("b_slg");
var b_slgl = document.getElementById("b_slgl");
var st_p = document.getElementById("st_p");
var b_sto = document.getElementById("b_sto");
var b_stc = document.getElementById("b_stc");

var st_nu = document.getElementById("st_nu");
var b_stu = document.getElementById("b_stu");
var st_um = document.getElementById("st_um");

var st_ne = document.getElementById("st_ne");
var st_cp_e = document.getElementById("st_cp_e");
var b_ste = document.getElementById("b_ste");
var st_em = document.getElementById("st_em");

var st_cp = document.getElementById("st_cp");
var st_np = document.getElementById("st_np");
var st_cop = document.getElementById("st_cop");
var b_stp = document.getElementById("b_stp");
var st_pm = document.getElementById("st_pm");

var st_es = document.getElementById("st_es");
var st_ps = document.getElementById("st_ps");

var currentUsername = null;
var currentIsGoogle = false;

function enforceBan(msg){
  isBanned = true;
  if(unsubBan){ unsubBan(); unsubBan = null; }
  st_p.style.display = "none";
  act_c.style.display = "none";
  l_cd.style.display = "none";
  s_cd.style.display = "none";
  b_gl.style.display = "none";
  var orb = document.getElementById("orb");
  if(orb) orb.style.display = "none";
  g_div.style.display = "none";
  var ps = document.querySelectorAll("p");
  for(var i = 0; i < ps.length; i++){ if(ps[i] !== banMsg) ps[i].style.display = "none"; }
  var h2 = document.querySelector("h2");
  if(h2) h2.style.display = "none";
  banMsg.textContent = msg;
  banMsg.style.display = "block";
}

function startBanListener(uid){
  if(unsubBan){ unsubBan(); unsubBan = null; }
  unsubBan = db.ref("users/" + uid).on("value", function(s){
    if(!s.exists()) return;
    var uv = s.val();
    if(checkBanData(uv)){
      if(unsubBan){ db.ref("users/" + uid).off("value", unsubBan); unsubBan = null; }
      enforceBan(getBanMessage(uv));
    }
  }, function(){});
}

function emailKey(email){
  return email.trim().toLowerCase().replace(/\./g, ",");
}

function isValidEmail(email){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

var manualAuthInProgress = false;

if(r_sp) r_sp.onchange = function(){ r_p.type = r_sp.checked ? "text" : "password"; r_cp.type = r_sp.checked ? "text" : "password"; };
if(l_sp) l_sp.onchange = function(){ l_p.type = l_sp.checked ? "text" : "password"; l_cp.type = l_sp.checked ? "text" : "password"; };

if(b_ssup) b_ssup.onclick = function(){
  l_cd.style.display = "none";
  s_cd.style.display = "flex";
  b_ssup.parentElement.style.display = "none";
  b_slg.style.display = "block";
  document.querySelector("h2").textContent = "※ Register your very own Paint Account! ※";
};

if(b_slgl) b_slgl.onclick = function(){
  s_cd.style.display = "none";
  l_cd.style.display = "flex";
  b_ssup.parentElement.style.display = "block";
  b_slg.style.display = "none";
  document.querySelector("h2").textContent = "※ Log in your Paint Account! ※";
};

var orb = document.getElementById("orb");

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
  var h = document.querySelector("h2");
  h.style.display = "block";
  h.textContent = "※ Log in your Paint Account! ※";
}

b_sto.onclick = function(){
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

b_stc.onclick = function(){ st_p.style.display = "none"; act_c.style.display = "block"; };

b_stu.onclick = function(){
  var newUN = st_nu.value.trim().toLowerCase();
  st_um.textContent = "";
  if(!newUN){ st_um.textContent = "Please enter a new username."; return; }
  if(newUN === currentUsername){ st_um.textContent = "That's already your username 😭✌️"; return; }
  if(newUN.length < 3 || newUN.length > 20 || !/^[a-z0-9_]+$/.test(newUN)){
    st_um.textContent = "Usernames must be 3-20 characters: letters, numbers, underscores only.";
    return;
  }
  var user = auth.currentUser;
  if(!user) return;
  db.ref("usernames/" + newUN).once("value").then(function(taken){
    if(taken.exists()){ st_um.textContent = "※ That username is already taken. ※"; return; }
    var oldUN = currentUsername;
    var updates = {};
    updates["usernames/" + newUN] = { uid: user.uid };
    updates["usernames/" + oldUN] = null;
    updates["users/" + user.uid + "/username"] = newUN;
    return db.ref().update(updates).then(function(){
      currentUsername = newUN;
      act_i.textContent = "※ Welcome, @" + newUN + "! ※";
      st_um.textContent = "※ Username updated! ※";
      st_nu.value = "";
    });
  }).catch(function(err){
    st_um.textContent = "※ Error: " + err.message + " ※";
  });
};

b_ste.onclick = function(){
  var newEM = st_ne.value.trim().toLowerCase();
  var curPA = st_cp_e.value;
  st_em.textContent = "";
  if(!newEM || !curPA){ st_em.textContent = "Please fill out all fields."; return; }
  if(!isValidEmail(newEM)){ st_em.textContent = "Please enter a valid email address."; return; }
  var user = auth.currentUser;
  if(!user) return;
  var cred = firebase.auth.EmailAuthProvider.credential(user.email, curPA);
  user.reauthenticateWithCredential(cred).then(function(){
    return db.ref("users/" + user.uid).once("value");
  }).then(function(snap){
    var oldEmail = snap.exists() ? snap.val().email : null;
    return user.updateEmail(newEM).then(function(){
      var dbUp = {};
      dbUp["emails/" + emailKey(newEM)] = { uid: user.uid };
      dbUp["users/" + user.uid + "/email"] = newEM;
      if(oldEmail) dbUp["emails/" + emailKey(oldEmail)] = null;
      return db.ref().update(dbUp);
    });
  }).then(function(){
    st_em.textContent = "※ Email updated! ※";
    st_ne.value = "";
    st_cp_e.value = "";
  }).catch(function(err){
    if(err.code === "auth/wrong-password"){ st_em.textContent = "※ Wrong password. ※"; }
    else if(err.code === "auth/email-already-in-use"){ st_em.textContent = "※ That email is already in use. ※"; }
    else{ st_em.textContent = "※ Error: " + err.message + " ※"; }
  });
};

b_stp.onclick = function(){
  var curPA = st_cp.value;
  var newPA = st_np.value;
  var coPA = st_cop.value;
  st_pm.textContent = "";
  if(!curPA || !newPA || !coPA){ st_pm.textContent = "Please fill out all fields."; return; }
  if(newPA !== coPA){ st_pm.textContent = "New passwords don't match."; return; }
  if(newPA.length < 6){ st_pm.textContent = "Password must be at least 6 characters."; return; }
  var user = auth.currentUser;
  if(!user) return;
  var cred = firebase.auth.EmailAuthProvider.credential(user.email, curPA);
  user.reauthenticateWithCredential(cred).then(function(){
    return user.updatePassword(newPA);
  }).then(function(){
    st_pm.textContent = "※ Password updated! ※";
    st_cp.value = "";
    st_np.value = "";
    st_cop.value = "";
  }).catch(function(err){
    if(err.code === "auth/wrong-password"){ st_pm.textContent = "※ Wrong password. ※"; }
    else{ st_pm.textContent = "※ Error: " + err.message + " ※"; }
  });
};

var _supBusy = false;
b_sup.onclick = function(){
  if(_supBusy) return;
  _supBusy = true;
  setTimeout(function(){ _supBusy = false; }, 5000);

  db.ref("deviceBans/" + deviceId).once("value").then(function(devSnap){
    if(devSnap.exists() && devSnap.val() === true){
      r_msg.textContent = "This device has been banned.";
      _supBusy = false;
      return;
    }

    var username = r_u.value.trim().toLowerCase();
    var email = r_e.value.trim().toLowerCase();
    var password = r_p.value;
    var confirmPassword = r_cp.value;
    r_msg.textContent = "";

    if(!username || !email || !password || !confirmPassword){ r_msg.textContent = "Please fill out all fields."; return; }
    if(username.length < 3 || username.length > 20 || !/^[a-z0-9_]+$/.test(username)){
      r_msg.textContent = "Usernames must be 3-20 characters: letters, numbers, underscores only.";
      return;
    }
    if(!isValidEmail(email)){ r_msg.textContent = "Please enter a valid email address."; return; }
    if(password !== confirmPassword){ r_msg.textContent = "Passwords don't match."; return; }

    manualAuthInProgress = true;
    var createdUser = null;
    var p = Promise.resolve();
    if(auth.currentUser && auth.currentUser.isAnonymous) p = auth.signOut();

    p.then(function(){
      return auth.createUserWithEmailAndPassword(email, password);
    }).then(function(cred){
      createdUser = cred.user;
      var updates = {};
      updates["usernames/" + username] = { uid: cred.user.uid };
      updates["emails/" + emailKey(email)] = { uid: cred.user.uid };
      updates["users/" + cred.user.uid] = { username: username, email: email, deviceId: deviceId };
      updates["devices/" + deviceId + "/uids/" + cred.user.uid] = true;
      return db.ref().update(updates);
    }).then(function(){
      showLoggedInUI(username, false, false);
      startBanListener(auth.currentUser.uid);
    }).catch(function(err){
      if(createdUser){ createdUser.delete().catch(function(){}); }
      if(err.code === "auth/email-already-in-use"){
        r_msg.textContent = "That email is already in use by another account.";
      } else if(err.message && err.message.indexOf("PERMISSION_DENIED") !== -1){
        r_msg.textContent = "That username or email is already taken.";
      } else {
        r_msg.textContent = "※ Error: " + err.message + " ※";
      }
    }).then(function(){
      manualAuthInProgress = false;
    });
  });
};

var _lgBusy = false;
b_lg.onclick = function(){
  if(_lgBusy) return;
  _lgBusy = true;
  setTimeout(function(){ _lgBusy = false; }, 5000);

  db.ref("deviceBans/" + deviceId).once("value").catch(function(){ return null; }).then(function(devSnap){
    if(devSnap && devSnap.exists() && devSnap.val() === true){
      l_msg.textContent = "This device has been banned.";
      return;
    }

    var email = l_e.value.trim().toLowerCase();
    var password = l_p.value;
    var confirmPassword = l_cp.value;
    l_msg.textContent = "";

    if(!email || !password || !confirmPassword){ l_msg.textContent = "Please fill out all fields."; return; }
    if(password !== confirmPassword){ l_msg.textContent = "Passwords don't match."; return; }

    manualAuthInProgress = true;
    auth.signInWithEmailAndPassword(email, password).then(function(cred){
      return db.ref("users/" + cred.user.uid).once("value").then(function(snap){
        var uv = snap.exists() ? snap.val() : null;
        if(uv && checkBanData(uv)){
          manualAuthInProgress = false;
          enforceBan(getBanMessage(uv));
          return;
        }
        var updates = {};
        updates["users/" + cred.user.uid + "/deviceId"] = deviceId;
        updates["devices/" + deviceId + "/uids/" + cred.user.uid] = true;
        return db.ref().update(updates).then(function(){
          var username = uv ? uv.username : email.split("@")[0];
          showLoggedInUI(username, false, false);
          startBanListener(cred.user.uid);
        });
      });
    }).catch(function(err){
      console.error("[login error]", err.code, err);
      l_msg.textContent = "※ Error: " + err.message + " ※";
    }).then(function(){
      manualAuthInProgress = false;
    });
  });
};

var _glBusy = false;
b_gl.onclick = function(){
  if(_glBusy) return;
  _glBusy = true;
  setTimeout(function(){ _glBusy = false; }, 5000);

  db.ref("deviceBans/" + deviceId).once("value").catch(function(){ return null; }).then(function(devSnap){
    if(devSnap && devSnap.exists() && devSnap.val() === true){
      l_msg.textContent = "This device has been banned.";
      return;
    }

    l_msg.textContent = "";
    r_msg.textContent = "";
    manualAuthInProgress = true;

    var p = Promise.resolve();
    if(auth.currentUser && auth.currentUser.isAnonymous) p = auth.signOut();

    p.then(function(){
      return auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    }).then(function(cred){
      pendingGoogleUser = cred.user;
      return db.ref("users/" + cred.user.uid).once("value").then(function(snap){
        if(snap.exists() && snap.val().username){
          var uv = snap.val();
          if(checkBanData(uv)){
            manualAuthInProgress = false;
            enforceBan(getBanMessage(uv));
            return;
          }
          var updates = {};
          updates["users/" + cred.user.uid + "/deviceId"] = deviceId;
          updates["devices/" + deviceId + "/uids/" + cred.user.uid] = true;
          return db.ref().update(updates).then(function(){
            manualAuthInProgress = false;
            showLoggedInUI(uv.username, true, false);
            startBanListener(cred.user.uid);
          });
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
      });
    }).catch(function(err){
      manualAuthInProgress = false;
      if(err.code !== "auth/popup-closed-by-user" && err.code !== "auth/cancelled-popup-request"){
        (l_cd.style.display !== "none" ? l_msg : r_msg).textContent = "※ Error: " + err.message + " ※";
      }
    });
  });
};

var _gusBusy = false;
b_gus.onclick = function(){
  if(_gusBusy) return;
  _gusBusy = true;
  setTimeout(function(){ _gusBusy = false; }, 5000);

  db.ref("deviceBans/" + deviceId).once("value").catch(function(){ return null; }).then(function(devSnap){
    if(devSnap && devSnap.exists() && devSnap.val() === true){
      g_msg.textContent = "This device has been banned.";
      return;
    }

    var username = g_u.value.trim().toLowerCase();
    g_msg.textContent = "";
    if(!username){ g_msg.textContent = "Please choose a username."; return; }
    if(username.length < 3 || username.length > 20 || !/^[a-z0-9_]+$/.test(username)){
      g_msg.textContent = "Usernames must be 3-20 characters: letters, numbers, underscores only.";
      return;
    }

    var user = pendingGoogleUser || auth.currentUser;
    if(!user){ g_msg.textContent = "※ Something went wrong, please try signing in again. ※"; return; }
    var email = (user.email || ("google_" + user.uid + "@app.local")).trim().toLowerCase();

    var updates = {};
    updates["usernames/" + username] = { uid: user.uid };
    updates["emails/" + emailKey(email)] = { uid: user.uid };
    updates["users/" + user.uid] = { username: username, email: email, deviceId: deviceId };
    updates["devices/" + deviceId + "/uids/" + user.uid] = true;

    db.ref().update(updates).then(function(){
      manualAuthInProgress = false;
      showLoggedInUI(username, true, false);
      startBanListener(user.uid);
    }).catch(function(err){
      manualAuthInProgress = false;
      if(err.message && err.message.indexOf("PERMISSION_DENIED") !== -1){
        g_msg.textContent = "That username is taken, or this Google account's email is already linked to another account.";
      } else {
        g_msg.textContent = "※ Error: " + err.message + " ※";
      }
    });
  });
};

b_lt.onclick = function(){
  auth.signOut().then(function(){
    auth.signInAnonymously().catch(function(){});
  });
};

auth.onAuthStateChanged(function(user){
  if(manualAuthInProgress) return;
  if(user && !user.isAnonymous){
    db.ref("deviceBans/" + deviceId).once("value").catch(function(){ return null; }).then(function(devSnap){
      if(devSnap && devSnap.exists() && devSnap.val() === true){
        enforceBan("This device has been banned.");
        return;
      }
      return db.ref("users/" + user.uid).once("value").catch(function(){
        return new Promise(function(res){ setTimeout(function(){ res(db.ref("users/" + user.uid).once("value").catch(function(){ return null; })); }, 800); });
      }).then(function(snap){
        if(!snap){ showLoggedInUI(user.email ? user.email.split("@")[0] : "Anonymous", false, false); return; }
        if(snap.exists() && snap.val().username){
          var uv = snap.val();
          if(checkBanData(uv)){ enforceBan(getBanMessage(uv)); return; }
          var isGoogle = user.providerData.some(function(p){ return p.providerId === "google.com"; });
          showLoggedInUI(uv.username, isGoogle, false);
          startBanListener(user.uid);
        } else {
          auth.signOut().then(function(){ auth.signInAnonymously().catch(function(){}); });
          showLoggedOutUI();
        }
      });
    });
  } else {
    db.ref("deviceBans/" + deviceId).once("value").catch(function(){ return null; }).then(function(devSnap){
      if(devSnap && devSnap.exists() && devSnap.val() === true){
        enforceBan("This device has been banned.");
        return;
      }
      if(!user){
        auth.signInAnonymously().catch(function(){});
      } else {
        showLoggedOutUI();
      }
    });
  }
});

var b_da1 = document.getElementById("b_da1");
var ds1 = document.getElementById("ds1");
var ds2 = document.getElementById("ds2");
var ds3 = document.getElementById("ds3");
var b_dy1 = document.getElementById("b_dy1");
var b_dn1 = document.getElementById("b_dn1");
var b_dy2 = document.getElementById("b_dy2");
var b_dn2 = document.getElementById("b_dn2");
var b_df = document.getElementById("b_df");
var b_dn3 = document.getElementById("b_dn3");
var d_e = document.getElementById("d_e");
var d_p = document.getElementById("d_p");
var d_msg = document.getElementById("d_msg");

function resetDelSteps(){
  ds1.style.display = "none";
  ds2.style.display = "none";
  ds3.style.display = "none";
  if(d_e) d_e.value = "";
  if(d_p) d_p.value = "";
  d_msg.textContent = "";
}

if(b_da1) b_da1.onclick = function(){ resetDelSteps(); ds1.style.display = "block"; };
if(b_dn1) b_dn1.onclick = function(){ resetDelSteps(); };
if(b_dy1) b_dy1.onclick = function(){ ds1.style.display = "none"; ds2.style.display = "block"; };
if(b_dn2) b_dn2.onclick = function(){ resetDelSteps(); };
if(b_dy2) b_dy2.onclick = function(){ ds2.style.display = "none"; ds3.style.display = "block"; };
if(b_dn3) b_dn3.onclick = function(){ resetDelSteps(); };

b_df.onclick = function(){
  d_msg.textContent = "";
  var user = auth.currentUser;
  if(!user){ d_msg.textContent = "※ Something went wrong. ※"; return; }

  var getCredPromise;
  if(currentIsGoogle){
    manualAuthInProgress = true;
    getCredPromise = auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then(function(result){
      return firebase.auth.GoogleAuthProvider.credentialFromResult(result);
    });
  } else {
    var email = d_e.value.trim().toLowerCase();
    var password = d_p.value;
    if(!email || !password){ d_msg.textContent = "Please fill out all fields."; return; }
    getCredPromise = Promise.resolve(firebase.auth.EmailAuthProvider.credential(email, password));
  }

  getCredPromise.then(function(cred){
    if(!cred){ d_msg.textContent = "※ Authentication failed. ※"; manualAuthInProgress = false; return Promise.reject("no cred"); }
    return user.reauthenticateWithCredential(cred);
  }).then(function(){
    var uid = user.uid;
    return db.ref("users/" + uid).once("value").then(function(snap){
      var uv = snap.exists() ? snap.val() : null;
      var username = uv ? uv.username : null;
      var userEmail = uv ? uv.email : (user.email || "");

      var contentUpdates = {};
      return db.ref("drawings").orderByChild("authorId").equalTo(uid).limitToFirst(50).once("value").then(function(drawingsSnap){
        if(drawingsSnap.exists()) drawingsSnap.forEach(function(c){ contentUpdates["drawings/" + c.key] = null; });
        return db.ref("galleryDrawings").orderByChild("authorId").equalTo(uid).limitToFirst(50).once("value");
      }).then(function(gallerySnap){
        if(gallerySnap.exists()) gallerySnap.forEach(function(c){ contentUpdates["galleryDrawings/" + c.key] = null; });
        if(Object.keys(contentUpdates).length > 0) return db.ref().update(contentUpdates);
      }).then(function(){
        var userUpdates = {};
        userUpdates["users/" + uid] = null;
        if(username) userUpdates["usernames/" + username] = null;
        if(userEmail) userUpdates["emails/" + emailKey(userEmail)] = null;
        if(deviceId) userUpdates["devices/" + deviceId + "/uids/" + uid] = null;
        return db.ref().update(userUpdates);
      }).then(function(){
        return user.delete();
      }).then(function(){
        showLoggedOutUI();
        manualAuthInProgress = false;
      });
    });
  }).catch(function(err){
    manualAuthInProgress = false;
    if(err === "no cred") return;
    if(err.code === "auth/wrong-password" || err.code === "auth/invalid-credential"){
      d_msg.textContent = "※ Wrong email or password. ※";
    } else if(err.code === "auth/popup-closed-by-user"){
      d_msg.textContent = "Re-authentication canceled.";
    } else {
      d_msg.textContent = "※ Error: " + err.message + " ※";
    }
  });
};
