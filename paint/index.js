const firebaseConfig = {
  apiKey: "AIzaSyBVpaaiwzHah24ugYMXPS8F5l_oWi5sdLI",
  authDomain: "draw-e5ea1.firebaseapp.com",
  databaseURL: "https://draw-e5ea1-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "draw-e5ea1",
  storageBucket: "draw-e5ea1.firebasestorage.app",
  messagingSenderId: "749520633273",
  appId: "1:749520633273:web:b7a49d7588fe15e87c8a68"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();
auth.signInAnonymously().catch(err => console.log("anon auth error:", err));
const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');
const ci = document.getElementById('col');
const si = document.getElementById('sz');
const eb = document.getElementById('er');
const fb = document.getElementById('fl');
const ub = document.getElementById('un');
const rb = document.getElementById('re');
const cb = document.getElementById('clr');
const dbtn = document.getElementById('dl');
const pb = document.getElementById('pub');
const shl = document.getElementById('shl');
const cob = document.getElementById('cpy');
const po = document.getElementById('po');
const pm = document.getElementById('pm');
const cp = document.getElementById('cp');
let dr = false;
let bc = ci.value;
let bs = Number(si.value);
let m = 'draw';
let lst = {x:0, y:0};
const mu = 30;
const us = [];
const rs = [];

function ps() {
  if(us.length >= mu) us.shift();
  us.push(cv.toDataURL());
  rs.length = 0;
}
function rdu(dataUrl){
  return new Promise(res=>{
    const img = new Image();
    img.onload = ()=>{
      ctx.clearRect(0,0,cv.width,cv.height);
      ctx.drawImage(img,0,0,cv.width,cv.height);
      res();
    };
    img.src = dataUrl;
  });
}
function gp(e){
  const rect = cv.getBoundingClientRect();
  const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
  const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
  return {x,y};
}
function st(e){
  e.preventDefault();
  const pos = gp(e);
  if(m === 'fill'){
    ps();
    ff(Math.floor(pos.x), Math.floor(pos.y), bc);
  } else {
    dr = true;
    lst = pos;
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ps();
  }
}
function dw(e){
  if(!dr) return;
  e.preventDefault();
  const pos = gp(e);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = bs;
  if(m === 'erase'){
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = 'white';
  }else{
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = bc;
  }
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
  lst = pos;
}
function sp(e){
  if(dr) {
    e.preventDefault();
    dr = false;
  }
}
cv.addEventListener('mousedown', st);
cv.addEventListener('mousemove', dw);
cv.addEventListener('mouseup', sp);
cv.addEventListener('mouseout', sp);
cv.addEventListener('touchstart', st);
cv.addEventListener('touchmove', dw);
cv.addEventListener('touchend', sp);
cv.addEventListener('touchcancel', sp);
ci.addEventListener('input', e=>{
  bc = e.target.value;
  m = 'draw';
});
si.addEventListener('input', e=>bs = Number(e.target.value));
eb.addEventListener('click', ()=>{
  m = m === 'erase' ? 'draw' : 'erase';
  eb.textContent = m === 'erase' ? '※⁜ brush ⁜※' : '※⁜ eraser ⁜※';
});
fb.addEventListener('click', ()=>{
  m = m === 'fill' ? 'draw' : 'fill';
  fb.textContent = m === 'fill' ? '※⁜ brush ⁜※' : '※⁜ fill ⁜※';
});
ub.addEventListener('click', async ()=>{
  if(!us.length) return;
  const ls = us.pop();
  rs.push(cv.toDataURL());
  await rdu(ls);
});
rb.addEventListener('click', async ()=>{
  if(!rs.length) return;
  const s = rs.pop();
  us.push(cv.toDataURL());
  await rdu(s);
});
cb.addEventListener('click', ()=>{
  ps();
  ctx.fillStyle = 'white';
  ctx.fillRect(0,0,cv.width,cv.height);
});
dbtn.addEventListener('click', ()=>{
  const a = document.createElement('a');
  a.href = cv.toDataURL();
  a.download = 'drawing.png';
  a.click();
});
cp.addEventListener('click',()=>po.style.display = 'none');
cob.addEventListener('click', async ()=>{
  if(shl.value){
    await navigator.clipboard.writeText(shl.value);
    cob.textContent = '※⁜ copied link! ⁜※';
    setTimeout(()=>cob.textContent = '※⁜ copy link ⁜※',1000);
  }
});
function htr(hex){
  let c;
  if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
    c = hex.substring(1).split('');
    if(c.length === 3) c = [c[0],c[0],c[1],c[1],c[2],c[2]];
    c = '0x' + c.join('');
    return {r:(c>>16)&255, g:(c>>8)&255, b:c&255, a:255};
  }
  throw new Error('Bad Hex');
}
function cm(a,b){
  return a.r === b.r && a.g === b.g && a.b === b.b && a.a === b.a;
}

function ff(sx,sy,fc){
  if(sx < 0 || sx >= cv.width || sy < 0 || sy >= cv.height) return;
  const id = ctx.getImageData(0,0,cv.width,cv.height);
  const data = id.data;
  const w = cv.width;
  const h = cv.height;
  const sp = (sy*w + sx) * 4;
  const sc = { r: data[sp], g: data[sp+1], b: data[sp+2], a: data[sp+3] };
  const tc = htr(fc);
  if(cm(sc, tc)) return;
  const pk = (x,y) => (y*w + x) * 4;
  const stk = [{x: sx, y: sy}];
  while(stk.length){
    const {x: sx, y: sy} = stk.pop();
    let x = sx;
    let y = sy;
    while(x >= 0){
      const pos = pk(x,y);
      if(!cm({r:data[pos],g:data[pos+1],b:data[pos+2],a:data[pos+3]}, sc)) break;
      x--;
    }
    x++;
    let ru = false;
    let rd = false;
    for(let nx = x; nx < w; nx++){
      const pos = pk(nx,y);
      if(!cm({r:data[pos],g:data[pos+1],b:data[pos+2],a:data[pos+3]}, sc)) break;
      data[pos] = tc.r;
      data[pos+1] = tc.g;
      data[pos+2] = tc.b;
      data[pos+3] = tc.a;
      if(y > 0){
        const up = pk(nx, y-1);
        if(cm({r:data[up],g:data[up+1],b:data[up+2],a:data[up+3]}, sc)){
          if(!ru){
            stk.push({x:nx, y:y-1});
            ru = true;
          }
        } else if(ru){
          ru = false;
        }
      }
      if(y < h-1){
        const dn = pk(nx, y+1);
        if(cm({r:data[dn],g:data[dn+1],b:data[dn+2],a:data[dn+3]}, sc)){
          if(!rd){
            stk.push({x:nx, y:y+1});
            rd = true;
          }
        } else if(rd){
          rd = false;
        }
      }
    }
  }
  ctx.putImageData(id, 0, 0);
}
pb.addEventListener('click', async ()=>{
  if(!confirm("※⁜ are you sure you want to generate a link to this drawing? ⁜※")) return;
  try{
    const data = cv.toDataURL();
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2,8);
    const user = auth.currentUser;
    const authorId = user ? user.uid : null;
 await db.ref('drawings/' + id).set({
  image: data,
  created: Date.now(),
  authorId: authorId
});
    const url = `${location.origin}${location.pathname}#id=${id}`;
    shl.value = url;
    history.replaceState(null, '', `#id=${id}`);
    alert('※⁜ generated link! go to https://hellot.nekoweb.org/paint/gallery to publish your drawing there! :D ⁜※');
  }catch(e){
    alert('※⁜ couldnt generate your link... ⁜※ error: ' + e.message);
  }
});
async function lfh(){
  const hash = location.hash;
  if(!hash) return;
  const match = hash.match(/id=([^&]+)/);
  if(match){
    const id = match[1];
    const snap = await db.ref('drawings/' + id).get();
    if(snap.exists()){
      const {image} = snap.val();
      await rdu(image);
    }else{
      alert('the drawing was not found...');
    }
  }
}

document.addEventListener("click", function playMusic() {
  const audio = document.getElementById("bgm");
  audio.play().catch(err => console.log(err));
  document.removeEventListener("click", playMusic);
});
ctx.fillStyle = 'white';
ctx.fillRect(0,0,cv.width,cv.height);
ps();
lfh();