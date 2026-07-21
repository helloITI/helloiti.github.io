// hi skibibi!!! 🤣🤣🤣
const [_a,_b,_c,_d,_e,_f,_g,_h] = ["QUl6YVN5Qmx6WG45YnlnZU5fMEF5RFFIWURmMlQydk82NldBemZ3","cGFpbnQtcHJvamVjdC1lM2VjZC5maXJlYmFzZWFwcC5jb20","aHR0cHM6Ly9wYWludC1wcm9qZWN0LWUzZWNkLWRlZmF1bHQtcnRkYi5ldXJvcGUtd2VzdDEuZmlyZWJhc2VkYXRhYmFzZS5hcHA","cGFpbnQtcHJvamVjdC1lM2VjZA","cGFpbnQtcHJvamVjdC1lM2VjZC5maXJlYmFzZXN0b3JhZ2UuYXBw","MTQxMTE0MTc3MzE3","MToxNDExMTQxNzczMTc6d2ViOmQ2Yzc4MTU1ZjI4MzdlN2I0YTBjY2M","Ry0yNTNDMUhaQjFW"].map(atob);
const firebaseConfig = {apiKey:_a,authDomain:_b,databaseURL:_c,projectId:_d,storageBucket:_e,messagingSenderId:_f,appId:_g,measurementId:_h};
firebase.initializeApp(firebaseConfig);const db = firebase.database();const auth = firebase.auth();const $ = id => document.getElementById(id);let checkedInitialAuth = false;
auth.onAuthStateChanged((user) => {
if (!checkedInitialAuth) {
checkedInitialAuth = true;
if (!user) {auth.signInAnonymously().catch(err => console.log("anon auth error:", err));}} });
let resolveAuthReady;const authReady = new Promise(res => { resolveAuthReady = res; });
const gallery = $('gal');const favG = $('fG');const input = $('dLI');const addBtn = $('aDB');const pOvr = $('pO');const pMsg = $('pM');const pImg = $('pImg');const delBtn = $('dB');const clPo = $('ok');const togFavB = $('tF');
clPo.addEventListener('click', () => pOvr.style.display = 'none');
let drawings = [];let drawingIds = [];let authorUsernames = {};let drawID = null;let drawAuthorId = null;let userLikes = {};
function cSI(src) {
const img = document.createElement('img');
img.src = src || '';
img.onerror = () => img.src = 'https://helloiti.github.io/assets/paint.png';return img; }
async function fetchUsername(uid) {
if (!uid) return "Anonymous";
if (authorUsernames[uid]) return authorUsernames[uid];
try {const snap = await db.ref(`users/${uid}/username`).get();
if (snap.exists()) {
const val = snap.val();
authorUsernames[uid] = "@" + (typeof val === 'string' ? val : val.username || "Anonymous");
return authorUsernames[uid]; }} catch {}return "Anonymous"; }
async function fetchUserLikes() {
const user = auth.currentUser;
if (!user || user.isAnonymous) { userLikes = {};return; }try {
const snap = await db.ref(`users/${user.uid}/likes`).get();
userLikes = snap.exists() ? (snap.val() || {}) : {};
} catch { userLikes = {}; } }
async function sPFD(d, id) {
drawID = id;drawAuthorId = d.authorId;const user = auth.currentUser;const username = await fetchUsername(d.authorId);
pMsg.textContent = `Drawing by: ${username}`;
pImg.src = d.image || '';pImg.onerror = () => pImg.src = 'https://helloiti.github.io/assets/paint.png';
delBtn.style.display = (user && !user.isAnonymous && d.authorId === user.uid) ? 'inline-block' : 'none';
pOvr.style.display = 'flex'; }
delBtn.onclick = async () => {
if (!drawID) return;
if (!confirm('Remove this drawing from the gallery?')) return;
try {await db.ref('galleryDrawings/' + drawID).remove();pOvr.style.display = 'none';loadDrawings();} catch (err) {
if (err.message && err.message.includes('PERMISSION_DENIED')) { alert('You can only remove your own drawings!'); }
else { console.error(err); } } };
async function loadDrawings() {
try {
await fetchUserLikes();
const gSnap = await db.ref('galleryDrawings').limitToLast(50).once('value');
if (!gSnap.exists()) {
gallery.innerHTML = '<p style="color:white;font-size:20px;">There are no drawings yet, maybe try uploading one?</p>';return; }
drawingIds = Object.keys(gSnap.val());drawings = [];
for (const id of drawingIds) {
const dSnap = await db.ref('drawings').orderByKey().equalTo(id).limitToFirst(1).once('value');
let drawingData = null;
dSnap.forEach(child => { drawingData = child.val(); });
drawings.push(drawingData); }
displayGallery();displayFavorites();} catch (err) { console.error(err); } }
function displayGallery() {
gallery.innerHTML = '';const user = auth.currentUser;
drawings.forEach((d, i) => {
if (!d) return;
const id = drawingIds[i];
const div = document.createElement('div');
div.className = 'g-i';
if (user && !user.isAnonymous && d.authorId === user.uid) { div.classList.add('g-i-o'); }
const img = cSI(d.image);img.addEventListener('click', () => sPFD(d, id));const btn = document.createElement('button');btn.className = 'l-b';const likeCount = d.likes ? Object.keys(d.likes).length : 0;const isLiked = !!userLikes[id];btn.textContent = isLiked ? `💖 ${likeCount}` : `❤️ ${likeCount}`;
btn.addEventListener('click', async e => {
e.stopPropagation();
if (btn._busy) return;btn._busy = true;await authReady;const user = auth.currentUser;
if (!user) { alert('Could not connect to the server, please refresh the page!');btn._busy = false;return; }
if (user.isAnonymous) { alert('You need a Paint Account to like drawings!\nGo to https://helloiti.github.io to do so.');btn._busy = false;return; }
const likeRef = db.ref(`drawings/${id}/likes/${user.uid}`);
const userLikeRef = db.ref(`users/${user.uid}/likes/${id}`);
const wasLiked = !!userLikes[id];
try {if (wasLiked) {
await likeRef.remove();await userLikeRef.remove();delete userLikes[id];
const newCount = d.likes ? Math.max(0, Object.keys(d.likes).length - 1) : 0;
btn.textContent = `💔 ${newCount}`;setTimeout(() => btn.textContent = `❤️ ${newCount}`, 600);
} else {await likeRef.set(true);await userLikeRef.set(true);userLikes[id] = true;
const newCount = d.likes ? Object.keys(d.likes).length + 1 : 1;
btn.textContent = `💖 ${newCount}`; }
displayFavorites();
} catch (err) { console.error(err); }
btn._busy = false; });
div.append(img, btn);gallery.appendChild(div); }); }
function displayFavorites() {
favG.innerHTML = '';
drawingIds.forEach((id, i) => {
if (!userLikes[id] || !drawings[i]) return;
const div = document.createElement('div');div.className = 'g-i';
const img = cSI(drawings[i].image);img.addEventListener('click', () => sPFD(drawings[i], id));
div.appendChild(img);favG.appendChild(div); }); }
addBtn.addEventListener('click', async () => {
await authReady;const user = auth.currentUser;
if (!user || user.isAnonymous) { alert('You need to be logged in to a Paint Account to publish drawings in the gallery!\nGo to https://helloiti.github.io to do so.');return; }
const url = input.value.trim();const match = url.match(/#id=([A-Za-z0-9_-]+)/);if (!match) return;
try {await db.ref('galleryDrawings/' + match[1]).set(true);input.value = '';loadDrawings();} catch (err) {
if (err.message && err.message.includes('PERMISSION_DENIED')) { alert('You can only publish your own drawings to the gallery!'); }else { console.error(err); } } });
togFavB.addEventListener('click', () => {const hidden = favG.style.display === 'none';favG.style.display = hidden ? 'grid' : 'none';togFavB.textContent = hidden ? 'Hide' : 'Show'; });
let firstAuthFired = false;auth.onAuthStateChanged((user) => {if (!firstAuthFired) { firstAuthFired = true;resolveAuthReady(); }loadDrawings(); });
