const fE=document.getElementById('file'),oC=document.getElementById('orig'),uC=document.getElementById('out'),cO=oC.getContext('2d',{willReadFrequently:true}),cU=uC.getContext('2d');const mE=document.getElementById('mode'),hRE=document.getElementById('hueRange'),sME=document.getElementById('satMin'),vME=document.getElementById('valMin'),sE=document.getElementById('soft'),rBE=document.getElementById('redBoost'),dB=document.getElementById('download'),rB=document.getElementById('reset'),mu=document.getElementById('mk');
let img=new Image();
function rC(){hRE.value=18;sME.value=30;vME.value=20;sE.value=12;rBE.value=1.5;mE.value='hue';}
function fC(c,i){c.width=i.naturalWidth||i.width;c.height=i.naturalHeight||i.height;}
function dO(i){fC(oC,i);cO.drawImage(i,0,0);}
function s2h(v){return (v/100)*180;}
function proc(){
if(!img||!img.complete)return;fC(oC,img);fC(uC,img);cO.drawImage(img,0,0);const w=oC.width,h=oC.height;const d=cO.getImageData(0,0,w,h);const o=cU.createImageData(w,h);const m=mE.value;const hR=s2h(Number(hRE.value));const sM=Number(sME.value)/100;const vM=Number(vME.value)/100;const sf=Number(sE.value);const rB2=Number(rBE.value);const mk=new Float32Array(w*h);
for(let i=0,p=0;i<d.data.length;i+=4,p++){
const r=d.data[i]/255,g=d.data[i+1]/255,b=d.data[i+2]/255;let sc=0;
if(m==='channel'){
const ps=r>(g+b)*0.5&&r>g*rB2&&r>b*rB2&&r>0.05;sc=ps?1:0;
}else{
const mx=Math.max(r,g,b),mn=Math.min(r,g,b);const v=mx;let s=0;if(mx!==0)s=(mx-mn)/mx;let hu=0;if(mx===mn)hu=0;
else{
if(mx===r)hu=((g-b)/(mx-mn))%6;else if(mx===g)hu=((b-r)/(mx-mn))+2;else hu=((r-g)/(mx-mn))+4;hu=hu*60;if(hu<0)hu+=360;}
const dR=Math.min(Math.abs(hu-0),Math.abs(hu-360));const hOk=dR<=hR;const sOk=s>=sM;const vOk=v>=vM;sc=(hOk&&sOk&&vOk)?1:0;}
mk[p]=sc;}
let fA;
if(sf<=0){
fA=mk;
}else{
fA=bB(mk,w,h,sf);}
for(let p=0,i=0;p<fA.length;p++,i+=4){
o.data[i]=d.data[i];o.data[i+1]=d.data[i+1];o.data[i+2]=d.data[i+2];o.data[i+3]=Math.round(Math.max(0,Math.min(1,fA[p]))*255);}
cU.putImageData(o,0,0);}
function bB(mk,w,h,rp){
const r=Math.max(1,Math.round(rp));const tm=new Float32Array(w*h);const rs=new Float32Array(w*h);
for(let y=0;y<h;y++){
let sm=0;const rS=y*w;
for(let x=-r;x<=r;x++){
const xx=Math.min(w-1,Math.max(0,x));
sm+=mk[rS+xx];}
for(let x=0;x<w;x++){
tm[rS+x]=sm/(r*2+1);const aX=Math.min(w-1,x+r+1);const sX=Math.max(0,x-r);sm+=mk[rS+aX]-mk[rS+sX];}}
for(let x=0;x<w;x++){
let sm=0;for(let y=-r;y<=r;y++){
const yy=Math.min(h-1,Math.max(0,y));sm+=tm[yy*w+x];}
for(let y=0;y<h;y++){
rs[y*w+x]=sm/(r*2+1);
const aY=Math.min(h-1,y+r+1);const sY=Math.max(0,y-r);sm+=tm[aY*w+x]-tm[sY*w+x];}}
return rs;}
fE.addEventListener('change',e=>{
const f=e.target.files&&e.target.files[0];if(!f)return;const url=URL.createObjectURL(f);img=new Image();
img.onload=()=>{
dO(img);proc();URL.revokeObjectURL(url);};img.src=url;});
[mE,hRE,sME,vME,sE,rBE].forEach(el=>
el.addEventListener('input',proc));
dB.addEventListener('click',()=>{
uC.toBlob(function(blob){
const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='redr.png';document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(a.href);});});
rB.addEventListener('click',()=>{rC();proc();});
function eS(){
if(!mu)return;mu.currentTime=0;mu.play().catch(()=>{});window.removeEventListener('click',eS);}
window.addEventListener('click',eS);rC();//
