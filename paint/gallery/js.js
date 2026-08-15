const [_a, _b, _c, _d, _e, _f, _g, _h] = ["QUl6YVN5Qmx6WG45YnlnZU5fMEF5RFFIWURmMlQydk82NldBemZ3","cGFpbnQtcHJvamVjdC1lM2VjZC5maXJlYmFzZWFwcC5jb20","aHR0cHM6Ly9wYWludC1wcm9qZWN0LWUzZWNkLWRlZmF1bHQtcnRkYi5ldXJvcGUtd2VzdDEuZmlyZWJhc2VkYXRhYmFzZS5hcHA","cGFpbnQtcHJvamVjdC1lM2VjZA","cGFpbnQtcHJvamVjdC1lM2VjZC5maXJlYmFzZXN0b3JhZ2UuYXBw","MTQxMTE0MTc3MzE3","MToxNDExMTQxNzczMTc6d2ViOmQ2Yzc4MTU1ZjI4MzdlN2I0YTBjY2M","Ry0yNTNDMUhaQjFW"].map(atob);
const firebaseConfig = {apiKey: _a,authDomain: _b,databaseURL: _c,projectId: _d,storageBucket: _e,messagingSenderId: _f,appId: _g,measurementId: _h}; firebase.initializeApp(firebaseConfig);  const db = firebase.database();  const auth = firebase.auth();

const $ = id => document.getElementById(id);
let checkedInitialAuth = false;
let resolveAuthReady;
const authReady = new Promise(res => { resolveAuthReady = res; });

let drawings = [];
let drawingIds = [];
let authorUsernames = {};
let drawID = null;
let drawAuthorId = null;
let userLikes = {};
let firstAuthFired = false;

const gallery = $('gal');
const favG = $('fG');
const input = $('dLI');
const addBtn = $('aDB');
const pOvr = $('pO');
const pMsg = $('pM');
const pImg = $('pImg');
const delBtn = $('dB');
const clPo = $('ok');
const togFavB = $('tF');
const rptBtn = $('rB');
const rO = $('rO');
const rRR = $('rRR');
const RC = $('RC');

auth.onAuthStateChanged((user) => {
    if (!checkedInitialAuth) {
        checkedInitialAuth = true;
        if (!user) {
            auth.signInAnonymously().catch(err => console.log("anon auth error:", err)); } }
    
    if (!firstAuthFired) {
        firstAuthFired = true;
        resolveAuthReady(); }  loadDrawings(); });

async function wh(channel, embed) {
    try { await fetch("https://tight-glitter-0f72.pnid-hellot.workers.dev/" + channel, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ embeds: [embed] }) }); } catch (e) {
// TEST
} }

function cSI(src) {
    const img = document.createElement('img');
    img.src = src || '';
    img.onerror = () => img.src = 'https://helloiti.github.io/assets/paint.png';
    return img; }

async function fetchUsername(uid) {
    if (!uid) return "Anonymous";
    if (authorUsernames[uid]) return authorUsernames[uid];
    
    try {
        const snap = await db.ref(`users/${uid}/username`).get();
        if (snap.exists()) {
            const val = snap.val();
            authorUsernames[uid] = "@" + (typeof val === 'string' ? val : val.username || "Anonymous");
            return authorUsernames[uid];
        } } catch (e) {}  return "Anonymous"; }

async function fetchUserLikes() {
    const user = auth.currentUser;
    if (!user || user.isAnonymous) {
        userLikes = {};
        return; }
    try {
        const snap = await db.ref(`users/${user.uid}/likes`).get();
        userLikes = snap.exists() ? (snap.val() || {}) : {};
    } catch (e) {
        userLikes = {}; } }

async function checkIfBanned(user) {
    try {
const deviceKeys = ['pdid', 'device_id', 'deviceId', 'device_token', 'fingerprint', 'fp_id'];
        const foundDeviceIds = deviceKeys.map(k => localStorage.getItem(k)).filter(Boolean);
        
        for (const devId of foundDeviceIds) {
            const snap = await db.ref(`deviceBans/${devId}`).get();
            if (snap.exists() && snap.val() === true) {
                return true; 
            } 
        }
        
        if (user && !user.isAnonymous) {
            const [userSnap, userDevSnap] = await Promise.all([
                db.ref(`users/${user.uid}/banned`).get(), 
                db.ref(`users/${user.uid}/deviceBanned`).get() 
            ]);
            
            if (userSnap.exists() && userSnap.val() === true) return true;
            if (userDevSnap.exists() && userDevSnap.val() === true) return true; 
        }
    } catch (e) {
        console.error("test check error:", e); 
    } 
    return false; 
}

clPo.addEventListener('click', () => { pOvr.style.display = 'none'; });
togFavB.addEventListener('click', () => {
    const hidden = favG.style.display === 'none';
    favG.style.display = hidden ? 'grid' : 'none';
    togFavB.textContent = hidden ? 'Hide' : 'Show'; });

async function sPFD(d, id) {
    drawID = id;
    drawAuthorId = d.authorId;
    const user = auth.currentUser;
    const username = await fetchUsername(d.authorId);
    
    pMsg.textContent = `Drawing by: ${username}`;
    pImg.src = d.image || '';
    pImg.onerror = () => pImg.src = 'https://helloiti.github.io/assets/paint.png';
    
    delBtn.style.display = (user && !user.isAnonymous && d.authorId === user.uid) ? 'inline-block' : 'none';
    
    const isBanned = await checkIfBanned(user);
    rptBtn.style.display = (user && !user.isAnonymous && d.authorId !== user.uid && !isBanned) ? 'inline-block' : 'none';
    pOvr.style.display = 'flex'; }

delBtn.onclick = async () => {
if (!drawID) return; if (!confirm('Remove this drawing from the gallery?')) return;
    
    try {
        await db.ref('galleryDrawings/' + drawID).remove();
        pOvr.style.display = 'none';
        loadDrawings();
        wh("gallery", {title: 'Drawing Removed from Gallery',description: '**ID:** `' + drawID + '`', color: 0xed4245, timestamp: new Date().toISOString() });
    } catch (err) {
        if (err.message && err.message.includes('PERMISSION_DENIED')) {
            alert('You can only remove your own drawings!');
        } else {
            console.error(err); } } };

const RRS = [ "NSFW or sexually explicit content",
"Gore, graphic violence, or disturbing imagery",
"Hate speech, slurs, or targeting protected characteristics",
"Harassment or threats",
"Doxxing / private information",
"Spam or repeated drawings" ];

RRS.forEach(reason => {
    const b = document.createElement('button');
    b.className = 'rsn';
    b.textContent = reason;
    b.addEventListener('click', () => submitReport(reason));
    rRR.appendChild(b); });

const crc = document.createElement('div');  crc.style.cssText = "margin-top: 10px; display: flex; flex-direction: column; gap: 5px; width: 100%;";

const ci = document.createElement('textarea');
ci.id = 'rci';
ci.maxLength = 190;
ci.placeholder = 'Type your custom reason here...';
ci.style.cssText = "width: 100%; height: 60px; padding: 8px; resize: none; background: #222; color: white; border: 1px solid #444; border-radius: 4px; box-sizing: border-box;";

const other = document.createElement('button');
other.className = 'r-reason';  other.style.background = '#444';  other.textContent = 'Other';
other.addEventListener('click', () => {
    const customText = ci.value.trim();
    if (!customText) {
        alert('Please enter a reason before submitting.');
        return; }
    submitReport('Other: ' + customText);  });

crc.append(ci, other);  rRR.appendChild(crc);  RC.addEventListener('click', () => { rO.style.display = 'none'; });

rptBtn.addEventListener('click', async () => { 
    const user = auth.currentUser;
    const isBanned = await checkIfBanned(user);
    if (isBanned) {
        alert('Your account or device is banned from submitting reports.');
        rptBtn.style.display = 'none';
        rO.style.display = 'none';
        return; }
    ci.value = '';
    rO.style.display = 'flex';  });

async function submitReport(reason) {
    if (!drawID) return;
    const user = auth.currentUser;
    
    if (!user || user.isAnonymous) {
        alert('You need a Paint Account to report drawings!\nGo to https://helloiti.github.io to do so.');
        return; }
    
    const isBanned = await checkIfBanned(user);
    if (isBanned) {
        alert('Your account or device is banned from submitting reports.');
        rO.style.display = 'none';
        return; }
    
    try {
        const updates = {};
        updates[`reports/${drawID}/${user.uid}`] = { reason: reason, timestamp: firebase.database.ServerValue.TIMESTAMP };  updates[`users/${user.uid}/lastReport`] = firebase.database.ServerValue.TIMESTAMP;
        await db.ref().update(updates);
        
        rO.style.display = 'none'; pOvr.style.display = 'none'; 
      alert('Thanks, your report has been submitted for review.'); wh("reports", {title: 'Drawing Reported',description: '**Drawing ID:** `' + drawID + '`\n**Reported by:** `' + user.uid + '`\n**Reason:** ' + reason + '\n**Link:** https://helloiti.github.io/paint/#id=' + drawID, color: 0xe67e22, timestamp: new Date().toISOString() });
    } catch (err) {
        if (err.message && err.message.includes('PERMISSION_DENIED')) {
            alert('You\'ve already reported this drawing, or you need to wait before reporting again.');
        } else {
            console.error(err); } } }

async function loadDrawings() {
    try {
        await fetchUserLikes();
        const gSnap = await db.ref('galleryDrawings').limitToLast(50).once('value');
        
        if (!gSnap.exists()) {
            gallery.innerHTML = '<p style="color:white;font-size:20px;">There are no drawings yet, maybe try uploading one?</p>';
            return; }
        
        drawingIds = Object.keys(gSnap.val()); drawings = [];
        
        for (const id of drawingIds) {
            const dSnap = await db.ref('drawings').orderByKey().equalTo(id).limitToFirst(1).once('value');
            let drawingData = null;
            dSnap.forEach(child => { drawingData = child.val(); });
            drawings.push(drawingData); }
        
displayGallery();displayFavorites();
    } catch (err) {
        console.error(err); } }

function displayGallery() {
    gallery.innerHTML = '';
    const user = auth.currentUser;
    
    drawings.forEach((d, i) => {
        if (!d) return;
        
        const id = drawingIds[i]; const div = document.createElement('div'); div.className = 'g-i';
        
        if (user && !user.isAnonymous && d.authorId === user.uid) {
            div.classList.add('g-i-o'); }
        
        const img = cSI(d.image);
        img.addEventListener('click', () => sPFD(d, id));
        
        const btn = document.createElement('button'); btn.className = 'l-b';
        
        const likeCount = d.likes ? Object.keys(d.likes).length : 0;
        const isLiked = !!userLikes[id];
        btn.textContent = isLiked ? `💖 ${likeCount}` : `❤️ ${likeCount}`;
        
        btn.addEventListener('click', async e => {
            e.stopPropagation();
            if (btn._busy) return; btn._busy = true; await authReady; const user = auth.currentUser;
            
            if (!user) {
                alert('Could not connect to the server, please refresh the page!');
                btn._busy = false;
                return; }
            if (user.isAnonymous) {
                alert('You need a Paint Account to like drawings!\nGo to https://helloiti.github.io to do so.');
                btn._busy = false;
                return; }

            const wasLiked = !!userLikes[id]; const updates = {};
            
            if (wasLiked) {
                updates[`drawings/${id}/likes/${user.uid}`] = null;
                updates[`users/${user.uid}/likes/${id}`] = null;
                updates[`users/${user.uid}/lastLike`] = firebase.database.ServerValue.TIMESTAMP;
            } else {
                updates[`drawings/${id}/likes/${user.uid}`] = true;
                updates[`users/${user.uid}/likes/${id}`] = true;
                updates[`users/${user.uid}/lastLike`] = firebase.database.ServerValue.TIMESTAMP; }

            try {
                await db.ref().update(updates);
                if (wasLiked) {
                    delete userLikes[id];
                    const newCount = d.likes ? Math.max(0, Object.keys(d.likes).length - 1) : 0;
                    btn.textContent = `💔 ${newCount}`;
                    setTimeout(() => btn.textContent = `❤️ ${newCount}`, 600);
                    if (d.likes) delete d.likes[user.uid];
                } else {
                    userLikes[id] = true;
                    const newCount = d.likes ? Object.keys(d.likes).length + 1 : 1;
                    btn.textContent = `💖 ${newCount}`;
                    if (!d.likes) d.likes = {};
                    d.likes[user.uid] = true; }
                displayFavorites();
            } catch (err) {
                if (!err.message || !err.message.includes('PERMISSION_DENIED')) {
                    console.error(err); } }
            btn._busy = false; });
        
        div.append(img, btn);
        gallery.appendChild(div); }); }

function displayFavorites() {
    favG.innerHTML = '';
    drawingIds.forEach((id, i) => {
        if (!userLikes[id] || !drawings[i]) return;
        const div = document.createElement('div');
        div.className = 'g-i';
        const img = cSI(drawings[i].image);
        img.addEventListener('click', () => sPFD(drawings[i], id));
        div.appendChild(img);
        favG.appendChild(div);
    }); }

addBtn.addEventListener('click', async () => {
    await authReady;
    const user = auth.currentUser;
    
    if (!user || user.isAnonymous) {
        alert('You need to be logged in to a Paint Account to publish drawings in the gallery!\nGo to https://helloiti.github.io to do so.');
        return; }
    
    const url = input.value.trim();
    const match = url.match(/#id=([A-Za-z0-9_-]+)/);
    if (!match) return;
    
    try {
        const updates = {};
        updates['galleryDrawings/' + match[1]] = true;
        updates['users/' + user.uid + '/lastGallery'] = firebase.database.ServerValue.TIMESTAMP;
        await db.ref().update(updates);
        
        input.value = '';
loadDrawings();wh("gallery", {title: 'Drawing Added to Gallery',description: '**ID:** `' + match[1] + '`\n**By:** `' + user.uid + '`', color: 0x5865f2, timestamp: new Date().toISOString()});
    } catch (err) {
        if (err.message && err.message.includes('PERMISSION_DENIED')) {
            alert('You can only publish your own drawings to the gallery!');
        } else {
            console.error(err); } } });
