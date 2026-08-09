const [_a,_b,_c,_d,_e,_f,_g,_h] = ["QUl6YVN5Qmx6WG45YnlnZU5fMEF5RFFIWURmMlQydk82NldBemZ3","cGFpbnQtcHJvamVjdC1lM2VjZC5maXJlYmFzZWFwcC5jb20","aHR0cHM6Ly9wYWludC1wcm9qZWN0LWUzZWNkLWRlZmF1bHQtcnRkYi5ldXJvcGUtd2VzdDEuZmlyZWJhc2VkYXRhYmFzZS5hcHA","cGFpbnQtcHJvamVjdC1lM2VjZA","cGFpbnQtcHJvamVjdC1lM2VjZC5maXJlYmFzZXN0b3JhZ2UuYXBw","MTQxMTE0MTc3MzE3","MToxNDExMTQxNzczMTc6d2ViOmQ2Yzc4MTU1ZjI4MzdlN2I0YTBjY2M","Ry0yNTNDMUhaQjFW"].map(atob);
const firebaseConfig = {apiKey:_a,authDomain:_b,databaseURL:_c,projectId:_d,storageBucket:_e,messagingSenderId:_f,appId:_g,measurementId:_h};
firebase.initializeApp(firebaseConfig);
async function wh(channel,embed){try{await fetch("https://tight-glitter-0f72.pnid-hellot.workers.dev/"+channel,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({embeds:[embed]})}); }catch{}}const db = firebase.database();const auth = firebase.auth();const $ = id => document.getElementById(id);let checkedInitialAuth = false;
auth.onAuthStateChanged((user) => {
if (!checkedInitialAuth) {
checkedInitialAuth = true;
if (!user) {auth.signInAnonymously().catch(err => console.log("anon auth error:", err));}}});
let resolveAuthReady;const authReady = new Promise(res => {resolveAuthReady = res;});
const gallery = $('gal');const favG = $('fG');const input = $('dLI');const addBtn = $('aDB');const pOvr = $('pO');const pMsg = $('pM');const pImg = $('pImg');const delBtn = $('dB');const clPo = $('ok');const togFavB = $('tF');
const rptBtn = $('rB');const rO = $('rO');const rReasons = $('rReasons');const rCancel = $('rCancel');
clPo.addEventListener('click', () => pOvr.style.display = 'none');
let drawings = [];let drawingIds = [];let authorUsernames = {};let drawID = null;let drawAuthorId = null;let userLikes = {};
function cSI(src) {
const img = document.createElement('img');//
img.src = src || '';
img.onerror = () => img.src = 'https://helloiti.github.io/assets/paint.png';return img;}
async function fetchUsername(uid) {
if (!uid) return "Anonymous";
if (authorUsernames[uid]) return authorUsernames[uid];
try {const snap = await db.ref(`users/${uid}/username`).get();if (snap.exists()) {
const val = snap.val();
authorUsernames[uid] = "@" + (typeof val === 'string' ? val : val.username || "Anonymous");
return authorUsernames[uid];}
} catch {}return "Anonymous";}
async function fetchUserLikes() {
const user = auth.currentUser;
if (!user || user.isAnonymous) {userLikes = {};return;}
try {const snap = await db.ref(`users/${user.uid}/likes`).get();userLikes = snap.exists() ? (snap.val() || {}) : {};} catch {userLikes = {};}}

async function checkIfBanned(user) {try {if (user && !user.isAnonymous) {

const userSnap = await db.ref(`users/${user.uid}/banned`).get();
if (userSnap.exists() && userSnap.val() === true) return true;}
const tokenResult = await firebase.app().options;
const deviceBanId = localStorage.getItem('device_id') || (user ? user.uid : null);
if (deviceBanId) {
const deviceSnap = await db.ref(`bannedDevices/${deviceBanId}`).get();
if (deviceSnap.exists() && deviceSnap.val() === true) return true;}
} catch (e) {console.error("ERROR TEST:", e);}return false;}

async function sPFD(d, id) {
drawID = id;drawAuthorId = d.authorId;const user = auth.currentUser;const username = await fetchUsername(d.authorId);
pMsg.textContent = `Drawing by: ${username}`;
pImg.src = d.image || '';pImg.onerror = () => pImg.src = 'https://helloiti.github.io/assets/paint.png';
delBtn.style.display = (user && !user.isAnonymous && d.authorId === user.uid) ? 'inline-block' : 'none';

const isBanned = await checkIfBanned(user);
rptBtn.style.display = (user && !user.isAnonymous && d.authorId !== user.uid && !isBanned) ? 'inline-block' : 'none';

pOvr.style.display = 'flex';}

delBtn.onclick = async () => {
if (!drawID) return;
if (!confirm('Remove this drawing from the gallery?')) return;
try {await db.ref('galleryDrawings/' + drawID).remove();pOvr.style.display = 'none';loadDrawings();wh("gallery",{title:'Drawing Removed from Gallery',description:'**ID:** `'+drawID+'`',color:0xed4245,timestamp:new Date().toISOString()});} catch (err) {
if (err.message && err.message.includes('PERMISSION_DENIED')) {alert('You can only remove your own drawings!');}
else {console.error(err);}}};

const REPORT_REASONS = [
"NSFW or sexually explicit content",
"Gore, graphic violence, or disturbing imagery",
"Hate speech, slurs, or targeting protected characteristics",
"Harassment or threats",
"Doxxing / private information",
"Spam or repeated drawings"];

REPORT_REASONS.forEach(reason => {
const b = document.createElement('button');
b.className = 'r-reason';
b.textContent = reason;
b.addEventListener('click', () => submitReport(reason));
rReasons.appendChild(b);});

const customReasonContainer = document.createElement('div');
customReasonContainer.style.cssText = "margin-top: 10px; display: flex; flex-direction: column; gap: 5px; width: 100%;";

const customInput = document.createElement('textarea');
customInput.id = 'rCustomInput';
customInput.placeholder = 'Type your custom reason here...';
customInput.style.cssText = "width: 100%; height: 60px; padding: 8px; resize: none; background: #222; color: white; border: 1px solid #444; border-radius: 4px; box-sizing: border-box;";

const customSubmitBtn = document.createElement('button');
customSubmitBtn.className = 'r-reason';
customSubmitBtn.style.background = '#444';
customSubmitBtn.textContent = 'Submit Custom Reason ("Other")';
customSubmitBtn.addEventListener('click', () => {
const customText = customInput.value.trim();
if (!customText) {
  alert('Please enter a reason before submitting.');
  return;
}
submitReport('Other: ' + customText);
});

customReasonContainer.appendChild(customInput);
customReasonContainer.appendChild(customSubmitBtn);
rReasons.appendChild(customReasonContainer);

rCancel.addEventListener('click', () => rO.style.display = 'none');
rptBtn.addEventListener('click', async () => { 
const user = auth.currentUser;
const isBanned = await checkIfBanned(user);
if (isBanned) {alert('Your account or device is banned from submitting reports.');rptBtn.style.display = 'none';return;}

customInput.value = '';rO.style.display = 'flex'; });

async function submitReport(reason) {
if (!drawID) return;
const user = auth.currentUser;
if (!user || user.isAnonymous) {alert('You need a Paint Account to report drawings!\nGo to https://helloiti.github.io to do so.');return;}

const isBanned = await checkIfBanned(user);
if (isBanned) {alert('You are banned from submitting reports.');rO.style.display = 'none';return;}

try {await Promise.all([
db.ref(`reports/${drawID}/${user.uid}`).set({reason: reason, timestamp: firebase.database.ServerValue.TIMESTAMP}),
db.ref(`users/${user.uid}/lastReport`).set(firebase.database.ServerValue.TIMESTAMP)]);

rO.style.display = 'none';pOvr.style.display = 'none';
alert('Thanks, your report has been submitted for review.');
wh("reports",{title:'Drawing Reported',description:'**Drawing ID:** `'+drawID+'`\n**Reported by:** `'+user.uid+'`\n**Reason:** '+reason+'\n**Link:** https://helloiti.github.io/paint/#id='+drawID,color:0xe67e22,timestamp:new Date().toISOString()});
} catch (err) {
if (err.message && err.message.includes('PERMISSION_DENIED')) {alert('You\'ve already reported this drawing, or you need to wait before reporting again, or you are banned.');}
else {console.error(err);}}}

async function loadDrawings() {
try {await fetchUserLikes();const gSnap = await db.ref('galleryDrawings').limitToLast(50).once('value');
if (!gSnap.exists()) {
gallery.innerHTML = '<p style="color:white;font-size:20px;">There are no drawings yet, maybe try uploading one?</p>';return;}
drawingIds = Object.keys(gSnap.val());drawings = [];
for (const id of drawingIds) {
const dSnap = await db.ref('drawings').orderByKey().equalTo(id).limitToFirst(1).once('value');
let drawingData = null;
dSnap.forEach(child => {drawingData = child.val();});
drawings.push(drawingData);}
displayGallery();displayFavorites();} catch (err) {console.error(err);}}

function displayGallery() {
gallery.innerHTML = '';const user = auth.currentUser;
drawings.forEach((d, i) => {
if (!d) return;
const id = drawingIds[i];
const div = document.createElement('div');
div.className = 'g-i';
if (user && !user.isAnonymous && d.authorId === user.uid) {div.classList.add('g-i-o');}
const img = cSI(d.image);img.addEventListener('click', () => sPFD(d, id));
const btn = document.createElement('button');btn.className = 'l-b';
const likeCount = d.likes ? Object.keys(d.likes).length : 0;
const isLiked = !!userLikes[id];
btn.textContent = isLiked ? `💖 ${likeCount}` : `❤️ ${likeCount}`;
btn.addEventListener('click', async e => {
e.stopPropagation();
if (btn._busy) return;btn._busy = true;await authReady;const user = auth.currentUser;
if (!user) {alert('Could not connect to the server, please refresh the page!');btn._busy = false;return;}
if (user.isAnonymous) {alert('You need a Paint Account to like drawings!\nGo to https://helloiti.github.io to do so.');btn._busy = false;return;}
const likeRef = db.ref(`drawings/${id}/likes/${user.uid}`);
const userLikeRef = db.ref(`users/${user.uid}/likes/${id}`);
const lastLikeRef = db.ref(`users/${user.uid}/lastLike`);
const wasLiked = \,.userLikes[id];
try {
if (wasLiked) {
await likeRef.remove();
await userLikeRef.remove();
await lastLikeRef.set(firebase.database.ServerValue.TIMESTAMP);delete userLikes[id];
const newCount = d.likes ? Math.max(0, Object.keys(d.likes).length - 1) : 0;
btn.textContent = `💔 ${newCount}`;setTimeout(() => btn.textContent = `❤️ ${newCount}`, 600);if (d.likes) delete d.likes[user.uid];
} else {await likeRef.set(true);await userLikeRef.set(true);await lastLikeRef.set(firebase.database.ServerValue.TIMESTAMP);userLikes[id] = true;
const newCount = d.likes ? Object.keys(d.likes).length + 1 : 1;
btn.textContent = `💖 ${newCount}`;
if (!d.likes) d.likes = {};d.likes[user.uid] = true;}displayFavorites();} catch (err) {
if (err.message && err.message.includes('PERMISSION_DENIED')) {alert('You\'re doing that too fast, slow down!');}else {console.error(err);}}
btn._busy = false;});div.append(img, btn);gallery.appendChild(div);});}

function displayFavorites() {favG.innerHTML = '';
drawingIds.forEach((id, i) => {
if (!userLikes[id] || !drawings[i]) return;
const div = document.createElement('div');div.className = 'g-i';
const img = cSI(drawings[i].image);img.addEventListener('click', () => sPFD(drawings[i], id));
div.appendChild(img);favG.appendChild(div);});}

addBtn.addEventListener('click', async () => {
await authReady;const user = auth.currentUser;
if (!user || user.isAnonymous) {alert('You need to be logged in to a Paint Account to publish drawings in the gallery!\nGo to https://helloiti.github.io to do so.');return;}
const url = input.value.trim();const match = url.match(/#id=([A-Za-z0-9_-]+)/);if (!match) return;
try {await db.ref('galleryDrawings/' + match[1]).set(true);input.value = '';loadDrawings();wh("gallery",{title:'Drawing Added to Gallery',description:'**ID:** `'+match[1]+'`\n**By:** `'+user.uid+'`',color:0x5865f2,timestamp:new Date().toISOString()});} catch (err) {
if (err.message && err.message.includes('PERMISSION_DENIED')) {alert('You can only publish your own drawings to the gallery!');}else {console.error(err);}}});

togFavB.addEventListener('click', () => {const hidden = favG.style.display === 'none';favG.style.display = hidden ? 'grid' : 'none';togFavB.textContent = hidden ? 'Hide' : 'Show';});
let firstAuthFired = false;auth.onAuthStateChanged((user) => {if (!firstAuthFired) {firstAuthFired = true;resolveAuthReady();}loadDrawings();});
