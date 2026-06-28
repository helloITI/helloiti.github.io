let easterEggActive = false;
    let resetTimeout = null;
    let shockSound = new Audio("https://helloiti.github.io/hellot/seal/clicker/miscassets/wii-sports-bowling-strike.mp3");
    const secretCode = "wiisports";
    let typedKeys = "";
    window.addEventListener("keydown", (e) => {
      const key = e.key.toLowerCase();
      if (/^[a-z]$/.test(key)) {
        typedKeys += key;
        if (typedKeys.length > secretCode.length) typedKeys = typedKeys.slice(-secretCode.length);
        if (typedKeys === secretCode && !easterEggActive) triggerEasterEgg();
      }
    });

    const [_a,_b,_c,_d,_e,_f,_g,_h] = ["QUl6YVN5Q0YyTmMzZWhyaFZkMXNBSjdwS3lJTGhEZHlCRy1iVXZN","b2xkc2VhbGNsLmZpcmViYXNlYXBwLmNvbQ","aHR0cHM6Ly9vbGRzZWFsY2wtZGVmYXVsdC1ydGRiLmV1cm9wZS13ZXN0MS5maXJlYmFzZWRhdGFiYXNlLmFwcA","b2xkc2VhbGNs","b2xkc2VhbGNsLmZpcmViYXNlc3RvcmFnZS5hcHA","NjMzMDcyMzU0MjI2","MTY2MzMwNzIzNTQyMjY6d2ViOjI3ZTk3YzUzY2JjMTgwNmVmMTVhYWI","Ry02WUdSNzZHUkYw"].map(atob);
    const firebaseConfig = {apiKey:_a,authDomain:_b,databaseURL:_c,projectId:_d,storageBucket:_e,messagingSenderId:_f,appId:_g,measurementId:_h};
    firebase.initializeApp(firebaseConfig);
    const authReady = new Promise(resolve => {
      firebase.auth().onAuthStateChanged(user => { if (user) resolve(user); });
    });
    firebase.auth().signInAnonymously();
    const db = firebase.database();

    let miiDataResolve;
    window.miiDataReady = new Promise(res => { miiDataResolve = res; });
    function getMyMiiData() { return localStorage.getItem("customMiiData") || null; }
    window.getMyMiiData = getMyMiiData;

    (function initMiiPopup() {
      const overlay = document.getElementById("mii-modal-overlay");
      const input = document.getElementById("mii-modal-input");
      const errorEl = document.getElementById("mii-modal-error");
      const saveBtn = document.getElementById("mii-modal-save");
      const skipBtn = document.getElementById("mii-modal-skip");
      const removeBtn = document.getElementById("mii-modal-remove");
      const editBtn = document.getElementById("mii-edit-btn");
      let firstVisitResolved = false;
      function resolveFirstVisitOnce(data) { if (!firstVisitResolved) { firstVisitResolved = true; miiDataResolve(data); } }
      function pushLiveUpdate() { if (typeof addOrUpdateVisitor === "function") window.miiDataReady.then(() => addOrUpdateVisitor()); }
      function openModal() { input.value = getMyMiiData() || ""; errorEl.textContent = ""; overlay.style.display = "flex"; }
      function closeModal(newData, { isFirstVisit } = {}) {
        overlay.style.display = "none";
        localStorage.setItem("customMiiChoiceMade", "1");
        if (newData) { localStorage.setItem("customMiiData", newData); } else { localStorage.removeItem("customMiiData"); }
        if (isFirstVisit) { resolveFirstVisitOnce(newData || null); } else { pushLiveUpdate(); }
      }
      const choiceMade = localStorage.getItem("customMiiChoiceMade");
      if (!choiceMade) { openModal(); } else { resolveFirstVisitOnce(getMyMiiData()); }
      function normalizeMiiInput(raw) {
        const trimmed = raw.trim().replace(/\s+/g, "");
        if (!trimmed) return { hex: null, error: null };
        if (/^[0-9a-fA-F]+$/.test(trimmed) && trimmed.length % 2 === 0) return { hex: trimmed.toLowerCase(), error: null };
        if (/^[A-Za-z0-9+/]+={0,2}$/.test(trimmed)) {
          try {
            const binaryStr = atob(trimmed);
            let hex = "";
            for (let i = 0; i < binaryStr.length; i++) hex += binaryStr.charCodeAt(i).toString(16).padStart(2, "0");
            if (hex.length / 2 !== 88 && hex.length / 2 !== 96) return { hex: null, error: "That decoded, but isn't a valid Mii data size." };
            return { hex, error: null };
          } catch (e) { return { hex: null, error: "That doesn't look like valid Mii HEX or Base64 data." }; }
        }
        return { hex: null, error: "That doesn't look like valid Mii HEX or Base64 data." };
      }
      saveBtn.addEventListener("click", () => {
        const raw = input.value;
        if (!raw.trim()) { closeModal(null, { isFirstVisit: !choiceMade }); return; }
        const { hex, error } = normalizeMiiInput(raw);
        if (error) { errorEl.textContent = error; return; }
        closeModal(hex, { isFirstVisit: !choiceMade });
      });
      skipBtn.addEventListener("click", () => closeModal(null, { isFirstVisit: !choiceMade }));
      removeBtn.addEventListener("click", () => closeModal(null, { isFirstVisit: !choiceMade }));
      editBtn.addEventListener("click", openModal);
    })();

    function triggerEasterEgg() {
      if (!model || easterEggActive) return;
      easterEggActive = true;
      shockSound.currentTime = 0; shockSound.play();
      model.userData.originalPos = model.position.clone();
      model.userData.originalRot = model.rotation.clone();
      gsap.to(model.position, { z: 20, duration: 0.7, ease: "power2.out" });
      setTimeout(shockCrowd, 100);
    }
    function shockCrowd() {
      personGroups.forEach(p => gsap.to(p.rotation, { x: -Math.PI/2, duration: 0.6, ease: "back.out(1)" }));
      resetTimeout = setTimeout(resetEasterEgg, 3000);
    }
    function resetEasterEgg() {
      if (model) gsap.to(model.position, { x: 0, y: 0, z: 0, duration: 1, ease: "power2.inOut" });
      personGroups.forEach(p => gsap.to(p.rotation, { x: 0, y: 0, z: 0, duration: 1, ease: "power2.inOut" }));
      easterEggActive = false;
    }

    const musicList = ["https://helloiti.github.io/assets/07main.mp3","https://helloiti.github.io/assets/mii.mp3","https://helloiti.github.io/assets/13._Exhibition.mp3"];
    const bgMusic = document.getElementById('bg-music');
    const bgSource = document.getElementById('bg-source');
    bgSource.src = musicList[Math.floor(Math.random() * musicList.length)];
    bgMusic.load();

    const sealSound = document.getElementById('seal-sound');
    const button = document.getElementById('seal-btn');
    const counterDiv = document.getElementById('counter');

    const clickCounterRef = firebase.database().ref("totalClicks");
    clickCounterRef.on("value", snap => {
      counterDiv.textContent = (snap.val() ?? 0) + " clicks";
    });
    function incrementCounter() {
      authReady.then(() => {
        clickCounterRef.transaction(current => (current || 0) + 1);
      });
    }
