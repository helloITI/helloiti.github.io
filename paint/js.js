// hi skibibi!!! 🤣🤣🤣
const [_a,_b,_c,_d,_e,_f,_g,_h] = ["QUl6YVN5Qmx6WG45YnlnZU5fMEF5RFFIWURmMlQydk82NldBemZ3","cGFpbnQtcHJvamVjdC1lM2VjZC5maXJlYmFzZWFwcC5jb20","aHR0cHM6Ly9wYWludC1wcm9qZWN0LWUzZWNkLWRlZmF1bHQtcnRkYi5ldXJvcGUtd2VzdDEuZmlyZWJhc2VkYXRhYmFzZS5hcHA","cGFpbnQtcHJvamVjdC1lM2VjZA","cGFpbnQtcHJvamVjdC1lM2VjZC5maXJlYmFzZXN0b3JhZ2UuYXBw","MTQxMTE0MTc3MzE3","MToxNDExMTQxNzczMTc6d2ViOmQ2Yzc4MTU1ZjI4MzdlN2I0YTBjY2M","Ry0yNTNDMUhaQjFW"].map(atob);
const firebaseConfig = {apiKey:_a,authDomain:_b,databaseURL:_c,projectId:_d,storageBucket:_e,messagingSenderId:_f,appId:_g,measurementId:_h};firebase.initializeApp(firebaseConfig);const db = firebase.database();const auth = firebase.auth();let resolveAuthReady;const authReady = new Promise(res => { resolveAuthReady = res; });let checkedInitialAuth = false;
auth.onAuthStateChanged((user) => {
if (!checkedInitialAuth) {
checkedInitialAuth = true;if (user) { resolveAuthReady(); } else { auth.signInAnonymously().catch(err => console.log("anon auth error:", err)); }
} else if (user) { resolveAuthReady(); } });
const cv = document.getElementById('cv');const ctx = cv.getContext('2d');const ci = document.getElementById('col');const si = document.getElementById('sz');const eb = document.getElementById('er');const fb = document.getElementById('fl');const slb = document.getElementById('sl');const ub = document.getElementById('un');const rb = document.getElementById('re');const cb = document.getElementById('clr');const dbtn = document.getElementById('dl');const pb = document.getElementById('pub');const shl = document.getElementById('shl');const cob = document.getElementById('cpy');const po = document.getElementById('po');const pm = document.getElementById('pm');const cp = document.getElementById('cp');
const ov = document.createElement('canvas');ov.width=cv.width;ov.height=cv.height;
ov.style.cssText='position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;';
cv.style.position='relative';cv.style.pointerEvents='all';
const wrap = document.createElement('div');
wrap.style.cssText='position:relative;display:inline-block;pointer-events:none;';cv.parentNode.insertBefore(wrap,cv);wrap.appendChild(cv);wrap.appendChild(ov);const octx = ov.getContext('2d');function clearOv(){octx.clearRect(0,0,ov.width,ov.height);}
let dr = false;let bc = ci.value;let bs = Number(si.value);let m = 'draw';let lst = {x:0,y:0};const mu = 30;const us = [];const rs = [];
let sel = null;let selDrag = null;let selScale = null;let selStart = null;let baseSnapshot = null;const HS = 8;
function setMode(newM) {
if (m === 'select' && newM !== 'select' && sel) commitSel();
m = newM;eb.textContent = m === 'erase' ? 'Brush' : 'Eraser';fb.textContent = m === 'fill' ? 'Brush' : 'Fill';slb.textContent = m === 'select' ? 'Cancel Select' : 'Select'; }
function ps() { if(us.length >= mu) us.shift();us.push(cv.toDataURL());rs.length = 0; }
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
if (!baseSnapshot) return;ctx.clearRect(0,0,cv.width,cv.height);ctx.drawImage(baseSnapshot,0,0); }
function drawSel() {
if (!sel) return;redrawBase();ctx.drawImage(sel.img,sel.x,sel.y,sel.w,sel.h);clearOv();
octx.save();octx.strokeStyle='#00aaff';octx.lineWidth=1;octx.setLineDash([5,3]);octx.strokeRect(sel.x,sel.y,sel.w,sel.h);octx.setLineDash([]);
for (const [hx,hy] of getHandles(sel)) {
octx.fillStyle='white';octx.strokeStyle='#00aaff';octx.lineWidth=1;
octx.fillRect(hx-HS/2,hy-HS/2,HS,HS);octx.strokeRect(hx-HS/2,hy-HS/2,HS,HS); }
octx.restore(); }
function commitSel() {
if (!sel) return;redrawBase();ctx.drawImage(sel.img,sel.x,sel.y,sel.w,sel.h);clearOv();
sel=null;selDrag=null;selScale=null;selStart=null;baseSnapshot=null; }
function st(e) {
e.preventDefault();const pos = gp(e);
if (m==='select') {
if (sel) {
const h = hitHandle(pos,sel);
if (h) { selScale={handle:h,startX:pos.x,startY:pos.y,origSel:{x:sel.x,y:sel.y,w:sel.w,h:sel.h,img:sel.img}};return; }
if (insideSel(pos,sel)) { selDrag={startX:pos.x,startY:pos.y,origX:sel.x,origY:sel.y};return; }
commitSel(); }
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
if (!dr||!selStart) return;
clearOv();
const rx=Math.min(selStart.x,pos.x);const ry=Math.min(selStart.y,pos.y);const rw=Math.abs(pos.x-selStart.x);const rh=Math.abs(pos.y-selStart.y);
octx.save();octx.strokeStyle='#00aaff';octx.lineWidth=1;octx.setLineDash([5,3]);octx.strokeRect(rx,ry,rw,rh);octx.restore();return; }
if(!dr) return;
ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=bs;
if(m==='erase'){ctx.globalCompositeOperation='source-over';ctx.strokeStyle='white';}
else{ctx.globalCompositeOperation='source-over';ctx.strokeStyle=bc;}
ctx.lineTo(pos.x,pos.y);ctx.stroke();lst=pos; }
function sp(e) {
if (m==='select') {
if (selScale){selScale=null;return;}if(selDrag){selDrag=null;return;}
if (!dr||!selStart) return;
if (e.type==='mouseout'||e.type==='touchcancel'){dr=false;clearOv();baseSnapshot=null;selStart=null;return;}
dr=false;
const pos=gp(e);
const rx=Math.min(selStart.x,pos.x);const ry=Math.min(selStart.y,pos.y);
const rw=Math.abs(pos.x-selStart.x);const rh=Math.abs(pos.y-selStart.y);
selStart=null;
if(rw<2||rh<2){clearOv();baseSnapshot=null;return;}
ps();
const imgData=ctx.getImageData(rx,ry,rw,rh);
ctx.fillStyle='white';ctx.fillRect(rx,ry,rw,rh);
baseSnapshot=document.createElement('canvas');baseSnapshot.width=cv.width;baseSnapshot.height=cv.height;
baseSnapshot.getContext('2d').drawImage(cv,0,0);
const oc=document.createElement('canvas');oc.width=rw;oc.height=rh;
oc.getContext('2d').putImageData(imgData,0,0);
sel={x:rx,y:ry,w:rw,h:rh,img:oc};drawSel();return; }
if(dr){e.preventDefault();dr=false;} }
cv.addEventListener('mousedown',st);cv.addEventListener('mousemove',dw);cv.addEventListener('mouseup',sp);cv.addEventListener('mouseout',sp);
cv.addEventListener('touchstart',st);cv.addEventListener('touchmove',dw);cv.addEventListener('touchend',sp);cv.addEventListener('touchcancel',sp);
ci.addEventListener('input',e=>{bc=e.target.value;});
si.addEventListener('input',e=>bs=Number(e.target.value));
eb.addEventListener('click',()=>{setMode(m==='erase'?'draw':'erase');});
fb.addEventListener('click',()=>{setMode(m==='fill'?'draw':'fill');});
slb.addEventListener('click',()=>{setMode(m==='select'?'draw':'select');});
ub.addEventListener('click',async()=>{
if(sel)commitSel();if(!us.length)return;const ls=us.pop();rs.push(cv.toDataURL());await rdu(ls);sel=null;baseSnapshot=null;clearOv(); });
rb.addEventListener('click',async()=>{
if(!rs.length)return;const s=rs.pop();us.push(cv.toDataURL());await rdu(s);sel=null;baseSnapshot=null;clearOv(); });
cb.addEventListener('click',()=>{
if(sel)commitSel();ps();ctx.fillStyle='white';ctx.fillRect(0,0,cv.width,cv.height); });
dbtn.addEventListener('click',()=>{
if(sel)commitSel();const a=document.createElement('a');a.href=cv.toDataURL();a.download='painting.png';a.click(); });
cp.addEventListener('click',()=>{po.classList.remove('visible');});
cob.addEventListener('click',async()=>{
if(shl.value){await navigator.clipboard.writeText(shl.value);cob.textContent='※ Copied Link! ※';setTimeout(()=>cob.textContent='※ Copy Link ※',1000);} });
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
pb.addEventListener('click',async()=>{
if(!confirm("Are you sure you want to generate a link for this drawing?"))return;
if(sel)commitSel();
try{
await authReady;const user=auth.currentUser;if(!user){alert('Still connecting, please try again in a second!');return;}
const authorId=user.uid;const td=Math.floor(Date.now()/86400000);
const us=await db.ref('users/'+authorId).once('value');const uv=us.val()||{};
const ut=uv.uploadDay===td?(uv.uploadsToday||0):0;
if(ut>=30){alert("You've hit your limit of 30 drawings for today! Come back tomorrow to make more. :)");return;}
const data=cv.toDataURL();const id=Date.now().toString(36)+Math.random().toString(36).substring(2,8);
await db.ref('drawings/'+id).set({image:data,created:firebase.database.ServerValue.TIMESTAMP,authorId:authorId});
await db.ref('users/'+authorId).update({lastUpload:firebase.database.ServerValue.TIMESTAMP,drawingCount:firebase.database.ServerValue.increment(1),uploadDay:td,uploadsToday:ut+1});
const url=`${location.origin}${location.pathname}#id=${id}`;
shl.value=url;history.replaceState(null,'',`#id=${id}`);
alert('Done! Go to https://helloiti.github.io/paint/gallery to publish your drawing there!\n(You need to have an account in order to publish your drawings to the gallery.)');
}catch(e){
if(e.message&&e.message.includes('PERMISSION_DENIED')){alert('You are posting too fast, or have hit your limit from posting drawings.\nPlease wait a bit or try again tomorrow!');}
else{alert('I could not generate your link... Error: '+e.message);}}});
async function lfh(){
const hash=location.hash;if(!hash)return;const match=hash.match(/id=([^&]+)/);
if(match){const id=match[1];const snap=await db.ref('drawings/'+id).get();
if(snap.exists()){const{image}=snap.val();await rdu(image);}
else{alert('The drawing was not found.');}}}
document.addEventListener("click",function playMusic(){const audio=document.getElementById("bgm");audio.play().catch(err=>console.log(err));document.removeEventListener("click",playMusic);});
ctx.fillStyle='white';ctx.fillRect(0,0,cv.width,cv.height);
ps();lfh();
// ok
