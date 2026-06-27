    const visitorListDiv = document.getElementById("visitor-list");
    const visitorsRef = firebase.database().ref("onlineUsers");
    const userClicksRef = firebase.database().ref("userClicks");
    const chatRef = firebase.database().ref("chatMessages");

    let userId = localStorage.getItem("useridentifier");
    let isGuest = false;
    if (!userId) {
      isGuest = true;
      userId = "guest_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("useridentifier", userId);
    }
    const thisVisitorRef = visitorsRef.child(userId);

    function addOrUpdateVisitor(username = null) {
      authReady.then(() => {
        thisVisitorRef.update({ id: userId, guest: isGuest, username: username || userId, miiData: getMyMiiData() || null, timestamp: firebase.database.ServerValue.TIMESTAMP })
          .catch(err => console.error("Failed to add/update visitor:", err));
        thisVisitorRef.onDisconnect().remove().catch(err => console.error("onDisconnect failed:", err));
      });
    }

    authReady.then(() => {
      firebase.database().ref('.info/connected').on('value', snap => {
        if (snap.val() === true) {
          window.miiDataReady.then(() => addOrUpdateVisitor());
        }
      });
      setInterval(() => {
        thisVisitorRef.update({ timestamp: firebase.database.ServerValue.TIMESTAMP });
      }, 10000);
    });

    visitorsRef.on('value', snapshot => {
      const now = Date.now();
      snapshot.forEach(childSnap => {
        const visitor = childSnap.val();
        if (visitor && visitor.timestamp && now - visitor.timestamp > 30000) visitorsRef.child(visitor.id).remove();
      });
    });

    const clickListenerRefs = {};
    function renderVisitors(snapshot) {
      const visitors = [];
      snapshot.forEach(childSnap => { const v = childSnap.val(); if (v && v.id) visitors.push(v); });
      const seenIds = new Set(visitors.map(v => v.id));
      Array.from(visitorListDiv.children).forEach(child => {
        const id = child.id.replace(/^visitor-/, "");
        if (!seenIds.has(id)) {
          if (clickListenerRefs[id]) { userClicksRef.child(id).off("value", clickListenerRefs[id]); delete clickListenerRefs[id]; }
          child.remove();
        }
      });
      const clickPromises = visitors.map(v => userClicksRef.child(v.id).get().then(snap => ({ ...v, clicks: snap.val() || 0 })));
      Promise.all(clickPromises).then(visitorsWithClicks => {
        visitorsWithClicks.sort((a, b) => b.clicks - a.clicks);
        visitorsWithClicks.forEach((visitor, index) => {
          let visitorDiv = document.getElementById(`visitor-${visitor.id}`);
          let img, nameSpan, clicksSpan;
          if (!visitorDiv) {
            visitorDiv = document.createElement("div");
            visitorDiv.id = `visitor-${visitor.id}`;
            visitorDiv.style.cssText = "display:flex;align-items:center;margin-bottom:5px;position:relative;z-index:10;";
            const bubbleLayer = document.createElement("div");
            bubbleLayer.className = "bubble-layer";
            bubbleLayer.style.cssText = "position:absolute;left:60px;top:-5px;";
            visitorDiv.appendChild(bubbleLayer);
            img = document.createElement("img"); img.width = 50; img.height = 50;
            img.style.cssText = "border-radius:50%;margin-right:8px;"; img.className = "visitor-img";
            const infoSpan = document.createElement("span"); infoSpan.className = "visitor-info"; infoSpan.style.cssText = "display:flex;flex-direction:column;";
            nameSpan = document.createElement("span"); nameSpan.className = "visitor-name";
            clicksSpan = document.createElement("span"); clicksSpan.className = "visitor-clicks"; clicksSpan.style.cssText = "font-size:0.9em;color:#00ff00;";
            infoSpan.appendChild(nameSpan); infoSpan.appendChild(clicksSpan);
            visitorDiv.appendChild(img); visitorDiv.appendChild(infoSpan);
            visitorListDiv.appendChild(visitorDiv);
          } else {
            img = visitorDiv.querySelector(".visitor-img");
            nameSpan = visitorDiv.querySelector(".visitor-name");
            clicksSpan = visitorDiv.querySelector(".visitor-clicks");
          }
          if (visitor.miiData) {
            img.src = `https://mii-unsecure.ariankordi.net/miis/image.png?erri=sqkn3-rfb&data=${visitor.miiData}&shaderType=miitomo&type=face_only&width=270&pantsColor=red&verifyCRC16=0&verifyCharInfo=0`;
          } else {
            img.src = "https://helloiti.github.io/assets/anonface.png";
          }
          img.onerror = () => { img.src = "https://helloiti.github.io/assets/anonface.png"; };
          nameSpan.textContent = (visitor.guest ? visitor.id : visitor.username || visitor.id) + (index === 0 ? " 👑" : "");
          nameSpan.style.color = visitor.id === userId ? "white" : "";
          nameSpan.style.fontWeight = visitor.id === userId ? "bold" : "";
          clicksSpan.textContent = `Clicks: ${visitor.clicks}`;
          visitorListDiv.appendChild(visitorDiv);
          if (!clickListenerRefs[visitor.id]) {
            const listener = snap => { clicksSpan.textContent = `Clicks: ${snap.val() || 0}`; };
            clickListenerRefs[visitor.id] = listener;
            userClicksRef.child(visitor.id).on("value", listener);
          }
        });
        document.getElementById("visitor-counter").textContent = `Visitors online: ${snapshot.numChildren()}`;
      });
    }
    visitorsRef.on('value', renderVisitors);

    button.addEventListener("click", () => {
      sealSound.currentTime = 0; sealSound.play();
      const lang = langSelector.value, t = translations[lang];
      document.getElementById('click-message').textContent = t.messages[Math.floor(Math.random() * t.messages.length)];
      const now = Date.now();
      clickTimes.push(now);
      clickTimes = clickTimes.filter(t => now - t < TIME_WINDOW);
      if (clickTimes.length >= CLICK_THRESHOLD) hyperMode = true;
      authReady.then(() => {
        incrementCounter();
        userClicksRef.child(userId).transaction(current => (current || 0) + 1);
      });
    });

    const chatInput = document.getElementById("chat-input");
    const chatSend = document.getElementById("chat-send");
    chatRef.on("child_added", (snapshot) => {
      const msg = snapshot.val(); if (!msg) return;
      const visitorEl = document.getElementById(`visitor-${msg.userId}`); if (!visitorEl) return;
      const bubbleLayer = visitorEl.querySelector(".bubble-layer"); if (!bubbleLayer) return;
      const bubble = document.createElement("div"); bubble.textContent = msg.text; bubble.className = "chat-bubble";
      bubbleLayer.appendChild(bubble);
      setTimeout(() => { bubble.style.opacity = "0"; setTimeout(() => bubble.remove(), 1000); }, 5000);
    });
    setInterval(() => {
      const cutoff = Date.now()-30000;
      chatRef.orderByChild("timestamp").endAt(cutoff).once("value", snap => { snap.forEach(child => child.ref.remove()); });
    }, 10000);
    chatSend.addEventListener("click", () => {
      const text = chatInput.value.trim(); if (!text) return;
      authReady.then(() => {
        chatRef.push({ userId, text, timestamp: firebase.database.ServerValue.TIMESTAMP });
      });
      chatInput.value = "";
    });
