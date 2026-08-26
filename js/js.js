const [_a, _b, _c, _d, _e, _f, _g, _h] = ["QUl6YVN5QW91aW02a2R1U05kYXpIWkxMVUJ0ZmdJamUwVUExaHg0","aGVsbG90LWE2Mjc3LmZpcmViYXNlYXBwLmNvbQ==","aHR0cHM6Ly9oZWxsb3QtYTYyNzctZGVmYXVsdC1ydGRiLmV1cm9wZS13ZXN0MS5maXJlYmFzZWRhdGFiYXNlLmFwcA==","aGVsbG90LWE2Mjc3","aGVsbG90LWE2Mjc3LmZpcmViYXNlc3RvcmFnZS5hcHA","MTA1NTI0OTQ1NTc4NA","MToxMDU1MjQ5NDU1Nzg0OndlYjpjNGY2MjIzNzQzOWVmZGVkZWEwMDlk","Ry02MVE1UzBGMDMw"].map(atob);
const firebaseConfig = {apiKey: _a,authDomain: _b,databaseURL: _c,projectId: _d,storageBucket: _e,messagingSenderId: _f,appId: _g,measurementId: _h};
firebase.initializeApp(firebaseConfig);  const db = firebase.database();

  let isFollowing = localStorage.getItem("helloT") === "true";

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

function updateButtonUI() {
  const btn = document.getElementById("f-btn");
  if (!btn) return;
  if (isFollowing) {
    btn.textContent = "Following";
    btn.style.background = "#2e6830";
    btn.style.borderColor = "#1e4720";
  } else {
    btn.textContent = "Follow Website";
    btn.style.background = "#9e2222";
    btn.style.borderColor = "#7a1818";
  }
}

  function initStatus() {
    updateButtonUI();
    const visitsRef = db.ref("stats/visits");
    visitsRef.transaction((currentVisits) => {
      return (currentVisits || 0) + 1;
    });

    visitsRef.on("value", (snapshot) => {
      const val = snapshot.val() || 0;
      setText("v-c", val.toLocaleString());
    });

    const followersRef = db.ref("stats/followers");
    followersRef.on("value", (snapshot) => {
      const val = snapshot.val() || 0;
      setText("f-c", val.toLocaleString());
    });
  }

  function toggleFollow() {
    const btn = document.getElementById("f-btn");
    if (btn) btn.disabled = true;

    const followersRef = db.ref("stats/followers");

    followersRef.transaction((currentFollowers) => {
      const count = currentFollowers || 0;
      return isFollowing ? Math.max(0, count - 1) : count + 1;
    }, (error, committed) => {
      if (committed) {
        isFollowing = !isFollowing;
        localStorage.setItem("helloT", isFollowing);
        updateButtonUI();
      } else if (error) {
        alert("Could not update follow status!");
      }
      if (btn) btn.disabled = false;
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initStatus);
  } else {
    initStatus();
  }
