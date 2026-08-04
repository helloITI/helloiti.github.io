// hi skibibi!!! 🤣🤣🤣
const [_a,_b,_c,_d,_e,_f,_g,_h] = ["QUl6YVN5Qmx6WG45YnlnZU5fMEF5RFFIWURmMlQydk82NldBemZ3","cGFpbnQtcHJvamVjdC1lM2VjZC5maXJlYmFzZWFwcC5jb20","aHR0cHM6Ly9wYWludC1wcm9qZWN0LWUzZWNkLWRlZmF1bHQtcnRkYi5ldXJvcGUtd2VzdDEuZmlyZWJhc2VkYXRhYmFzZS5hcHA","cGFpbnQtcHJvamVjdC1lM2VjZA","cGFpbnQtcHJvamVjdC1lM2VjZC5maXJlYmFzZXN0b3JhZ2UuYXBw","MTQxMTE0MTc3MzE3","MToxNDExMTQxNzczMTc6d2ViOmQ2Yzc4MTU1ZjI4MzdlN2I0YTBjY2M","Ry0yNTNDMUhaQjFW"].map(atob);
const firebaseConfig = {apiKey:_a,authDomain:_b,databaseURL:_c,projectId:_d,storageBucket:_e,messagingSenderId:_f,appId:_g,measurementId:_h};firebase.initializeApp(firebaseConfig);
async function wh(embed){try{await fetch("https://tight-glitter-0f72.pnid-hellot.workers.dev/paint",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({embeds:[embed]})}); }catch{}}const db = firebase.database();const auth = firebase.auth();let resolveAuthReady;const authReady = new Promise(res => { resolveAuthReady = res; });let checkedInitialAuth = false;
auth.onAuthStateChanged((user) => {
if (!checkedInitialAuth) {
checkedInitialAuth = true;if (user) { resolveAuthReady(); } else { auth.signInAnonymously().catch(err => console.log("anon auth error:", err)); }
} else if (user) { resolveAuthReady(); } });
function getDeviceId() {let id = localStorage.getItem('pdid');if (!id) {id = (crypto.randomUUID ? crypto.randomUUID() : (Date.now().toString(36) + Math.random().toString(36).slice(2)));localStorage.setItem('pdid', id);}return id;}const deviceId = getDeviceId();
const cv = document.getElementById('cv');const ctx = cv.getContext('2d');const ci = document.getElementById('col');const si = document.getElementById('sz');const eb = document.getElementById('er');const fb = document.getElementById('fl');const slb = document.getElementById('sl');const ub = document.getElementById('un');const rb = document.getElementById('re');const cb = document.getElementById('clr');const dbtn = document.getElementById('dl');const pb = document.getElementById('pub');const shl = document.getElementById('shl');const cob = document.getElementById('cpy');const shpSelect = document.getElementById('shp');const addShpBtn = document.getElementById('addshp');
let dr = false;let bc = ci.value;let bs = Number(si.value);let m = 'draw';let lst = {x:0,y:0};const mu = 30;const us = [];const rs = [];
let sel = null;let selDrag = null;let selScale = null;let selStart = null;let baseSnapshot = null;const HS = 8;
function toWhitePNG() {
const tmp = document.createElement('canvas');tmp.width = cv.width;tmp.height = cv.height;
const t = tmp.getContext('2d');t.fillStyle = 'white';t.fillRect(0, 0, tmp.width, tmp.height);t.drawImage(cv, 0, 0);
return tmp.toDataURL('image/png');}
function toWhiteWebP(quality) {
const tmp = document.createElement('canvas');tmp.width = cv.width;tmp.height = cv.height;
const t = tmp.getContext('2d');t.fillStyle = 'white';t.fillRect(0, 0, tmp.width, tmp.height);t.drawImage(cv, 0, 0);
const webp = tmp.toDataURL('image/webp', quality != null ? quality : 0.85);
if (webp.startsWith('data:image/webp')) return webp;
return tmp.toDataURL('image/png');}
function setMode(newM) {
if (m === 'select' && newM !== 'select' && sel) commitSel();
m = newM;eb.textContent = m === 'erase' ? 'Brush' : 'Eraser';fb.textContent = m === 'fill' ? 'Brush' : 'Fill';slb.textContent = m === 'select' ? 'Cancel Select' : 'Select'; }
function ps() { if(us.length >= mu) us.shift();us.push(toWhitePNG());rs.length = 0; }
function rdu(dataUrl) {
return new Promise(res=>{
const img = new Image();img.onload = ()=>{ ctx.clearRect(0,0,cv.width,cv.height);ctx.drawImage(img,0,0,cv.width,cv.height);res(); };img.src = dataUrl; }); }
function gp(e) {
const rect = cv.getBoundingClientRect();const scaleX = cv.width/rect.width;const scaleY = cv.height/rect.height;
const x = ((e.touches ? e.touches[0].clientX : e.clientX) - rect.left) * scaleX;
const y = ((e.touches ? e.touches[0].clientY : e.clientY) - rect.top) * scaleY;
return {x,y}; }
function getHandles(s) {
const {x,y,w,h} = s;
return [[x,y],[x+w/2,y],[x+w,y],[x,y+h/2],[x+w,y+h/2],[x,y+h],[x+w/2,y+h],[x+w,y+h]]; }
function hitHandle(pos,s) {
const handles = getHandles(s);const names = ['tl','tm','tr','ml','mr','bl','bm','br'];
for (let i=0;i<handles.length;i++) { const [hx,hy]=handles[i];if(Math.abs(pos.x-hx)<=HS&&Math.abs(pos.y-hy)<=HS) return names[i]; }
return null; }
function insideSel(pos,s) { return pos.x>=s.x&&pos.x<=s.x+s.w&&pos.y>=s.y&&pos.y<=s.y+s.h; }
function redrawBase() {
if (!baseSnapshot) return;ctx.clearRect(0,0,cv.width,cv.height);ctx.drawImage(baseSnapshot,0,0);ctx.setLineDash([]); }
function drawSelUI(s) {
ctx.save();ctx.strokeStyle='#00aaff';ctx.lineWidth=1;ctx.setLineDash([5,3]);ctx.strokeRect(s.x,s.y,s.w,s.h);ctx.setLineDash([]);
for (const [hx,hy] of getHandles(s)) {
ctx.fillStyle='white';ctx.strokeStyle='#00aaff';ctx.lineWidth=1;
ctx.fillRect(hx-HS/2,hy-HS/2,HS,HS);ctx.strokeRect(hx-HS/2,hy-HS/2,HS,HS); }
ctx.restore(); }
function drawSel() {
if (!sel) return;redrawBase();
ctx.save();
if (selDrag || selScale) ctx.globalAlpha = 0.5;
ctx.drawImage(sel.img,sel.x,sel.y,sel.w,sel.h);
ctx.restore();
drawSelUI(sel); }
function commitSel() {
if (!sel) return;
redrawBase();ctx.drawImage(sel.img,sel.x,sel.y,sel.w,sel.h);
sel=null;selDrag=null;selScale=null;selStart=null;baseSnapshot=null; }
function createShapeCanvas(st){const oc=document.createElement('canvas');oc.width=200;oc.height=200;const octx=oc.getContext('2d');octx.strokeStyle=bc;octx.fillStyle=bc;octx.lineWidth=Math.max(2,bs);octx.lineCap='round';octx.lineJoin='round';octx.beginPath();if(st==='line'){octx.moveTo(20,180);octx.lineTo(180,20);}else if(st==='cube'){octx.strokeRect(20,70,110,110);octx.strokeRect(70,20,110,110);octx.moveTo(20,70);octx.lineTo(70,20);octx.moveTo(130,70);octx.lineTo(180,20);octx.moveTo(20,180);octx.lineTo(70,130);octx.moveTo(130,180);octx.lineTo(180,130);}else if(st==='triangle'){octx.moveTo(100,15);octx.lineTo(185,185);octx.lineTo(15,185);octx.closePath();}else if(st==='star'){const cx=100,cy=100,spikes=5,outerR=85,innerR=35;let rot=(Math.PI/2)*3,step=Math.PI/spikes;octx.moveTo(cx,cy-outerR);for(let i=0;i<spikes;i++){octx.lineTo(cx+Math.cos(rot)*outerR,cy+Math.sin(rot)*outerR);rot+=step;octx.lineTo(cx+Math.cos(rot)*innerR,cy+Math.sin(rot)*innerR);rot+=step;}octx.closePath();}else if(st==='heart'){octx.moveTo(100,70);octx.bezierCurveTo(100,37,70,15,40,15);octx.bezierCurveTo(10,15,10,62.5,10,62.5);octx.bezierCurveTo(10,100,55,140,100,180);octx.bezierCurveTo(145,140,190,100,190,62.5);octx.bezierCurveTo(190,62.5,190,15,160,15);octx.bezierCurveTo(130,15,100,37,100,70);octx.closePath();}else if(st==='circle'){octx.arc(100,100,80,0,Math.PI*2);}else if(st==='diamond'){octx.moveTo(100,15);octx.lineTo(185,100);octx.lineTo(100,185);octx.lineTo(15,100);octx.closePath();}else if(st==='speech'){const x=15,y=15,w=170,h=120,r=20;octx.moveTo(x+r,y);octx.lineTo(x+w-r,y);octx.quadraticCurveTo(x+w,y,x+w,y+r);octx.lineTo(x+w,y+h-r);octx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);octx.lineTo(75,y+h);octx.lineTo(35,185);octx.lineTo(50,y+h);octx.lineTo(x+r,y+h);octx.quadraticCurveTo(x,y+h,x,y+h-r);octx.lineTo(x,y+r);octx.quadraticCurveTo(x,y,x+r,y);octx.closePath();}octx.stroke();return oc;}
addShpBtn.addEventListener('click',()=>{if(sel)commitSel();ps();const sc=createShapeCanvas(shpSelect.value);baseSnapshot=document.createElement('canvas');baseSnapshot.width=cv.width;baseSnapshot.height=cv.height;baseSnapshot.getContext('2d').drawImage(cv,0,0);setMode('select');const sz=150;sel={x:Math.round((cv.width-sz)/2),y:Math.round((cv.height-sz)/2),w:sz,h:sz,img:sc};drawSel();});
function st(e) {
e.preventDefault();const pos = gp(e);
if (m==='select') {
if (sel) {
const h = hitHandle(pos,sel);
if (h) { selScale={handle:h,startX:pos.x,startY:pos.y,origSel:{x:sel.x,y:sel.y,w:sel.w,h:sel.h,img:sel.img}};return; }
if (insideSel(pos,sel)) { selDrag={startX:pos.x,startY:pos.y,origX:sel.x,origY:sel.y};return; }commitSel(); }
selStart=pos;dr=true;
baseSnapshot=document.createElement('canvas');baseSnapshot.width=cv.width;baseSnapshot.height=cv.height;baseSnapshot.getContext('2d').drawImage(cv,0,0);
return; }
if(m==='fill'){ps();ff(Math.floor(pos.x),Math.floor(pos.y),bc);return;}
dr=true;lst=pos;ctx.beginPath();ctx.moveTo(pos.x,pos.y);ps(); }
function dw(e) {
e.preventDefault();const pos = gp(e);
if (m==='select') {
if (selScale) {
const s=selScale.origSel;const dx=pos.x-selScale.startX;const dy=pos.y-selScale.startY;const h=selScale.handle;
let x=s.x,y=s.y,w=s.w,ht=s.h;
if(h.includes('r')){w=Math.max(10,s.w+dx);}if(h.includes('l')){x=s.x+dx;w=Math.max(10,s.w-dx);}
if(h.includes('b')){ht=Math.max(10,s.h+dy);}if(h.includes('t')){y=s.y+dy;ht=Math.max(10,s.h-dy);}
sel={x,y,w,h:ht,img:sel.img};drawSel();return; }
if (selDrag) {
sel.x=selDrag.origX+(pos.x-selDrag.startX);sel.y=selDrag.origY+(pos.y-selDrag.startY);drawSel();return; }
if (!dr||!selStart) return;redrawBase();
const rx=Math.round(Math.min(selStart.x,pos.x));const ry=Math.round(Math.min(selStart.y,pos.y));const rw=Math.round(Math.abs(pos.x-selStart.x));const rh=Math.round(Math.abs(pos.y-selStart.y));
ctx.save();ctx.strokeStyle='#00aaff';ctx.lineWidth=1;ctx.setLineDash([5,3]);ctx.strokeRect(rx,ry,rw,rh);ctx.restore();return; }
if(!dr) return;
ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=bs;
if(m==='erase'){ctx.globalCompositeOperation='source-over';ctx.strokeStyle='white';}
else{ctx.globalCompositeOperation='source-over';ctx.strokeStyle=bc;}
ctx.lineTo(pos.x,pos.y);ctx.stroke();lst=pos; }
function sp(e) {
if (m==='select') {
if (selScale){selScale=null;drawSel();return;}if(selDrag){selDrag=null;drawSel();return;}
if (!dr||!selStart) return;
if (e.type==='mouseout'||e.type==='touchcancel'){dr=false;redrawBase();baseSnapshot=null;selStart=null;return;}
dr=false;
const pos=gp(e);
const rx=Math.round(Math.min(selStart.x,pos.x));const ry=Math.round(Math.min(selStart.y,pos.y));
const rw=Math.round(Math.abs(pos.x-selStart.x));const rh=Math.round(Math.abs(pos.y-selStart.y));
selStart=null;
if(rw<2||rh<2){redrawBase();baseSnapshot=null;return;}redrawBase();
const imgData=ctx.getImageData(rx,ry,rw,rh);
ctx.fillStyle='white';ctx.fillRect(rx,ry,rw,rh);ps();
baseSnapshot=document.createElement('canvas');baseSnapshot.width=cv.width;baseSnapshot.height=cv.height;baseSnapshot.getContext('2d').drawImage(cv,0,0);
const oc=document.createElement('canvas');oc.width=rw;oc.height=rh;
oc.getContext('2d').putImageData(imgData,0,0);sel={x:rx,y:ry,w:rw,h:rh,img:oc};
drawSel();return; }
if(dr){e.preventDefault();dr=false;} }
cv.addEventListener('mousedown',st);cv.addEventListener('mousemove',dw);cv.addEventListener('mouseup',sp);cv.addEventListener('mouseout',sp);
cv.addEventListener('touchstart',st);cv.addEventListener('touchmove',dw);cv.addEventListener('touchend',sp);cv.addEventListener('touchcancel',sp);
ci.addEventListener('input',e=>{bc=e.target.value;});
si.addEventListener('input',e=>bs=Number(e.target.value));
eb.addEventListener('click',()=>{setMode(m==='erase'?'draw':'erase');});
fb.addEventListener('click',()=>{setMode(m==='fill'?'draw':'fill');});
slb.addEventListener('click',()=>{setMode(m==='select'?'draw':'select');});
ub.addEventListener('click',async()=>{
if(sel)commitSel();if(!us.length)return;const ls=us.pop();rs.push(toWhitePNG());await rdu(ls);sel=null;baseSnapshot=null; });
rb.addEventListener('click',async()=>{
if(!rs.length)return;const s=rs.pop();us.push(toWhitePNG());await rdu(s);sel=null;baseSnapshot=null; });
cb.addEventListener('click',()=>{
if(sel)commitSel();ps();ctx.fillStyle='white';ctx.fillRect(0,0,cv.width,cv.height); });
dbtn.addEventListener('click',()=>{
if(sel)commitSel();const a=document.createElement('a');a.href=toWhitePNG();a.download='painting.png';a.click(); });
cob.addEventListener('click',async()=>{
if(shl.value){await navigator.clipboard.writeText(shl.value);cob.textContent='※ Copied Link! ※';setTimeout(()=>cob.textContent='※ Copy Link ※',1000);} });
// ctrl z for undo, ctrl y for redo
document.addEventListener('keydown', (e) => {if (e.ctrlKey) {if (e.key.toLowerCase() === 'z') {
e.preventDefault();ub.click();} else if (e.key.toLowerCase() === 'y') {e.preventDefault();rb.click();}}});
function htr(hex){
let c;if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
c=hex.substring(1).split('');if(c.length===3)c=[c[0],c[0],c[1],c[1],c[2],c[2]];
c='0x'+c.join('');return{r:(c>>16)&255,g:(c>>8)&255,b:c&255,a:255};}
throw new Error('Bad Hex');}
function cm(a,b){return a.r===b.r&&a.g===b.g&&a.b===b.b&&a.a===b.a;}
function ff(sx,sy,fc){
if(sx<0||sx>=cv.width||sy<0||sy>=cv.height)return;const id=ctx.getImageData(0,0,cv.width,cv.height);const data=id.data;const w=cv.width;const h=cv.height;const sp=(sy*w+sx)*4;const sc={r:data[sp],g:data[sp+1],b:data[sp+2],a:data[sp+3]};const tc=htr(fc);if(cm(sc,tc))return;const pk=(x,y)=>(y*w+x)*4;const stk=[{x:sx,y:sy}];
while(stk.length){
const{x:sx,y:sy}=stk.pop();let x=sx;let y=sy;
while(x>=0){const pos=pk(x,y);if(!cm({r:data[pos],g:data[pos+1],b:data[pos+2],a:data[pos+3]},sc))break;x--;}
x++;let ru=false;let rd=false;
for(let nx=x;nx<w;nx++){
const pos=pk(nx,y);if(!cm({r:data[pos],g:data[pos+1],b:data[pos+2],a:data[pos+3]},sc))break;
data[pos]=tc.r;data[pos+1]=tc.g;data[pos+2]=tc.b;data[pos+3]=tc.a;
if(y>0){const up=pk(nx,y-1);if(cm({r:data[up],g:data[up+1],b:data[up+2],a:data[up+3]},sc)){if(!ru){stk.push({x:nx,y:y-1});ru=true;}}else if(ru){ru=false;}}
if(y<h-1){const dn=pk(nx,y+1);if(cm({r:data[dn],g:data[dn+1],b:data[dn+2],a:data[dn+3]},sc)){if(!rd){stk.push({x:nx,y:y+1});rd=true;}}else if(rd){rd=false;}}}}
ctx.putImageData(id,0,0);}
let _pbBusy=false;pb.addEventListener('click',async()=>{if(_pbBusy)return;_pbBusy=true;setTimeout(()=>_pbBusy=false,5000);
try{await authReady;const user=auth.currentUser;if(user&&user.isAnonymous){alert('Sorry, but you need an account in order to publish your drawings.\nGo to https://helloiti.github.io/paint/account/ to do so.');return;}}catch(e){console.log("Auth catch:",e);}
if(!confirm("Are you sure you want to generate a link for this drawing?"))return;
if(sel)commitSel();
try{await authReady;
const user=auth.currentUser;
if(!user){alert('Still connecting, please try again in a second!');return;}
if(user.isAnonymous){alert('Sorry, but you need an account in order to publish your drawings.\nGo to https://helloiti.github.io/paint/account/ to do so.');return;}
const authorId=user.uid;
const td=Math.floor(Date.now()/86400000);
const [usnap,devBanSnap]=await Promise.all([db.ref('users/'+authorId).once('value'),db.ref('deviceBans/'+deviceId).once('value')]);
const serverNow=(await db.ref('.info/serverTimeOffset').once('value')).val()+Date.now();
const uv=usnap.val()||{};
if(uv.banned===true){alert('Your account has been banned from publishing drawings.');return;}
if(devBanSnap.exists()&&devBanSnap.val()===true){alert('This device has been banned from publishing drawings.');return;}
const ut=uv.uploadDay===td?(uv.uploadsToday||0):0;
if(ut>=30){alert("You've hit your limit of 30 drawings for today!\nCome back tomorrow to make more. :)");return;}
const timeSinceLast=serverNow-(uv.lastUpload||0);
console.log('[publish] serverNow:',serverNow,'lastUpload:',uv.lastUpload,'timeSinceLast:',timeSinceLast,'uploadDay:',uv.uploadDay,'td:',td,'uploadsToday:',uv.uploadsToday);
if(uv.lastUpload&&timeSinceLast<65000){alert('Please wait '+Math.ceil((62000-timeSinceLast)/1000)+' more seconds before publishing again!');return;}
const imgData=toWhiteWebP(0.85);
console.log("[publish] image size:",imgData.length);
if(imgData.length>=295000){alert('Your drawing is too large to publish ('+Math.round(imgData.length/1024)+'KB). Try drawing less or using simpler colors!');return;}
const existingCount=(usnap.exists()&&usnap.val().drawingCount!=null)?usnap.val().drawingCount:0;
const userRef=db.ref('users/'+authorId);
const dayChanged=uv.uploadDay!==td;
if(dayChanged&&usnap.exists()){
try{await Promise.all([userRef.child('uploadDay').set(td),userRef.child('uploadsToday').set(0)]);}catch(er){console.warn('[publish] day reset failed:',er.message);}}
const id=Date.now().toString(36)+Math.random().toString(36).substring(2,8);
await db.ref('drawings/'+id).set({image:imgData,created:firebase.database.ServerValue.TIMESTAMP,authorId:authorId});
Promise.all([
userRef.child('lastUpload').set(firebase.database.ServerValue.TIMESTAMP),
userRef.child('drawingCount').set(existingCount+1),
userRef.child('uploadDay').set(td),
userRef.child('uploadsToday').set(ut+1),
userRef.child('deviceId').set(deviceId),
db.ref('devices/'+deviceId+'/uids/'+authorId).set(true)
]).catch(function(err){console.warn("[publish] metadata update failed (non-fatal):",err.code,err.message);});
const url=location.origin+location.pathname+'#id='+id;wh({title:'Drawing Published',description:'**User:** `'+authorId+'`\n**ID:** `'+id+'`\n**Size:** '+Math.round(imgData.length/1024)+'KB',color:0x5865f2,timestamp:new Date().toISOString()});
shl.value=url;
history.replaceState(null,'',url);
alert('Done! Go to https://helloiti.github.io/paint/gallery to publish your drawing there!\n:D');
}catch(e){
if(e.message&&e.message.includes('PERMISSION_DENIED')){alert('You are posting too fast, or have hit your limit from posting drawings.\nPlease wait a bit or try again tomorrow!');wh({title:'Publish Failed',description:'**User:** `'+(auth.currentUser?.uid||'unknown')+'`',color:0xed4245,timestamp:new Date().toISOString()});}
else{alert('I could not generate your link... Error: '+e.message);}}});
async function lfh(){
const hash=location.hash;if(!hash)return;const match=hash.match(/id=([^&]+)/);
if(match){const id=match[1];
const snap=await db.ref('drawings').orderByKey().equalTo(id).limitToFirst(1).once('value');
if(snap.exists()){
let drawingData=null;snap.forEach(child=>{drawingData=child.val();});
if(drawingData&&drawingData.image){await rdu(drawingData.image);}}
else{alert('The drawing was not found.');}}}
document.addEventListener("mousedown",function playMusic(){const audio=document.getElementById("ps5");audio.play().catch(err=>console.log(err));document.removeEventListener("mousedown",playMusic);},true);
ctx.fillStyle='white';ctx.fillRect(0,0,cv.width,cv.height);ps();lfh();
