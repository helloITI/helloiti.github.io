const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
if (THREE.sRGBEncoding !== undefined) renderer.outputEncoding = THREE.sRGBEncoding;
const scene = new THREE.Scene();
scene.background = null;
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0.5, 5);
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(5, 5, 5);
scene.add(dirLight);

const loader = new THREE.GLTFLoader();
let model = null, swingGroup, spinGroup;
loader.load("https://helloiti.github.io/assets/models/seal/seal.gltf", (gltf) => {
  model = gltf.scene;
  model.traverse((child) => {
    if (child.isMesh) {
      const oldMat = child.material;
      child.material = new THREE.MeshStandardMaterial({
        map: oldMat.map,
        color: 0xffffff,
        side: THREE.DoubleSide,
        metalness: 0.2,
        roughness: 1,
        transparent: true,
        alphaTest: 0.1
      });
      if (child.geometry && child.geometry.attributes.normal) child.geometry.computeVertexNormals();
    }
  });
  swingGroup = new THREE.Group(); spinGroup = new THREE.Group();
  scene.add(spinGroup); spinGroup.add(swingGroup); swingGroup.add(model);
  model.rotation.y = -Math.PI / 2;
});

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const audioSource = audioCtx.createMediaElementSource(bgMusic);
const analyser = audioCtx.createAnalyser();
analyser.fftSize = 256;
audioSource.connect(analyser); analyser.connect(audioCtx.destination);
document.body.addEventListener("click", () => { if (audioCtx.state === "suspended") audioCtx.resume(); });

let clock = new THREE.Clock();
let clickTimes = [];
const CLICK_THRESHOLD = 5, TIME_WINDOW = 1000;
let hyperMode = false;
let personGroups = [];

function animate() {
  requestAnimationFrame(animate);
  const elapsed = clock.getElapsedTime();
  if (model && spinGroup && swingGroup) {
    if (!easterEggActive) {
      spinGroup.rotation.y += 0.04;
      if (hyperMode) {
        swingGroup.rotation.z = Math.sin(elapsed * 4) * 0.5;
        swingGroup.position.y = Math.cos(elapsed * 8) * 0.4;
        spinGroup.rotation.y += 0.001;
      } else {
        swingGroup.rotation.z = 0;
        swingGroup.position.y = 0;
      }
    } else {
      spinGroup.rotation.y = Math.PI;
      swingGroup.rotation.set(0, 0, 0);
    }
  }
  const now = Date.now();
  if (hyperMode && (clickTimes.length === 0 || now - clickTimes[clickTimes.length - 1] > TIME_WINDOW)) hyperMode = false;
  animateCrowd(elapsed);
  renderer.render(scene, camera);
}

const emojiList = ["👍","🎉","❤️","😂","🔥"];
const emojiSprites = [];
function createEmojiSprite(char) {
  const c = document.createElement("canvas"); c.width = 128; c.height = 128;
  const ctx = c.getContext("2d"); ctx.font = "100px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(char, 64, 64);
  return new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true }));
}

function animateCrowd(elapsed) {
  if (!personGroups || personGroups.length === 0) return;
  if (hyperMode && Math.random() < 0.03) {
    const person = personGroups[Math.floor(Math.random() * personGroups.length)];
    const sprite = createEmojiSprite(emojiList[Math.floor(Math.random() * emojiList.length)]);
    sprite.position.set(
      person.position.x + (Math.random()-0.5)*0.1,
      person.position.y + 0.8 + Math.random()*0.2,
      person.position.z + (Math.random()-0.5)*0.1
    );
    emojiSprites.push({ sprite, velocityY: Math.random()*0.02+0.01, scaleUp: 0.002, swayOffset: Math.random()*Math.PI*2 });
    scene.add(sprite);
  }
  for (let i = emojiSprites.length-1; i >= 0; i--) {
    const e = emojiSprites[i];
    e.sprite.position.y += e.velocityY;
    e.sprite.position.x += Math.sin(clock.getElapsedTime()*4+e.swayOffset)*0.001;
    e.sprite.scale.x += e.scaleUp; e.sprite.scale.y += e.scaleUp;
    e.sprite.material.opacity = Math.max(0, e.sprite.material.opacity-0.01);
    if (e.sprite.material.opacity <= 0) { scene.remove(e.sprite); emojiSprites.splice(i,1); }
  }
  personGroups.forEach(g => { g.position.y = Math.sin(elapsed*3+g.userData.bobOffset)*0.05; });
}

const crowdMiis = [
  { hex: "d0000000a96e0402826700000000000073006f006e0020003dd82dde3dd82dde3dd82dde0000000b007f7f0000030504001708002708040104020d0c08040005020a100409011705040e080004050a0008040a0100051900", gender: 0 },
  { hex: "d0000000a3eb7938b8900000000000004200720061006e0064006f006e000000000000000000000400403f00000000060b4601000208040304020c0601040006020a010309171304030d010100040a0008030a0102031400", gender: 0 },
  { hex: "8048199a950c7bb9b608000000000000420072006f006f006b006c0079006e00000000000000000901652e0000010308098306001809030004020d010304000502090601081d5904000d08000002080400030a0102031400", gender: 1 },
  { hex: "d0000000fe7364a28fb500000000000075e087e02000012632e00126200087e075e00000000000000054300000000108097901000201040304020c1301040206020a010309171304010d080000040a0908040a0102021400", gender: 0 },
  { hex: "d000000001c3ac2d87920000000000004d006900690000000000000000000000000000000000000b011c370000090000017b01002108070303020e0d08040607060c0000041e1301040d06000004100310070b00010c1b00", gender: 1 },
  { hex: "00000000000000000000000000000000480065006c006c006f005400000000000000000000000007015032000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000", gender: 0 },
  { hex: "80df199a950c7bb9b6140000000000004a006f007200640079006e0000000000000000000000000701151d0000010000094702001809030303020b0b01030006020a0702091f1304010d080000040a0008040a0004021400", gender: 1 },
  { hex: "80df199a950c7bb9b6140000000000004b006100740068006500720069006e00650000000000000301151d0000010700096003002329030202020b0101030203020a0302090f1304010d080000040a0008040a0004021400", gender: 1 },
  { hex: "9c35b0372af11618bac100000000000063006800610072006c0069006e00650000000000000000000150340000010000096506001b0b040304020c0001040306020a010409131301030d080000040a0008040a0004021400", gender: 1 },
  { hex: "d0000000aa0d2856bc080000000000004800490000000000000000000000000000000000000000040069450000010100004001001208030303020c1701040306020a00000d0f1308030a0800050306100804000107081600", gender: 0 },
  { hex: "912cf460a4c0e101a56c0000000000004d006f006e00610020004c0069007300610000000000000b01177f000005010b09060800090a0703000112110806030001090600051413030303080203080f080800110108091c00", gender: 1 },
  { hex: "0e9385a3834aa52cabb6000000000000420065006e0074006c0065007900000000000000000000090021390000000700076b01000201030204020c09010400050209010209131302030c080000040a0401030a0004021400", gender: 0 },
  { hex: "d0000000400ce7f5baa80000000000004e0049004e00540045004e0044004f00000000000000000501601f0000010000035101010d08040303020c030104030702090a0309231404030d010000040a0308040a0004021400", gender: 1 },
  { hex: "d00000007714e2b388ec0000000000004e0049004e00540045004e0044004f000000000000000003001b4a0000020200004007011b0b040304020e1107040307020c0e040b211304030f070000040c0008040c0004021400", gender: 0 }
];

function initCrowd() {
  const crowdGroup = new THREE.Group(); scene.add(crowdGroup);
  const radius = 9, texLoader = new THREE.TextureLoader(), total = crowdMiis.length;
  for (let i = 0; i < total; i++) {
    const mii = crowdMiis[i], personGroup = new THREE.Group();
    const bodyColor = new THREE.Color().setHSL(Math.random(), 0.7, 0.5);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,0.3,16), new THREE.MeshStandardMaterial({ color: bodyColor }));
    body.position.y = 0.15;
    const top = new THREE.Mesh(new THREE.SphereGeometry(0.08,16,16,0,Math.PI*2,0,Math.PI/2), new THREE.MeshStandardMaterial({ color: bodyColor }));
    top.position.y = 0.3;
    if (mii.gender === 1) {
      const dress = new THREE.Mesh(new THREE.ConeGeometry(0.12,0.35,16), new THREE.MeshStandardMaterial({ color: bodyColor }));
      dress.position.y = 0.175; personGroup.add(dress);
    }
    personGroup.add(body, top);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: texLoader.load(`https://mii-unsecure.ariankordi.net/miis/image.png?data=${mii.hex}&type=face_only&width=40&verifyCRC16=0&verifyCharInfo=0`),
      transparent: true, alphaTest: 0.1
    }));
    sprite.scale.set(0.56,0.56,1); sprite.position.y = 0.6; sprite.position.z = 0.015;
    personGroup.add(sprite);
    const angle = ((i-(total-1)/2)/total)*Math.PI/2;
    personGroup.position.set(radius*Math.sin(angle), 0, -radius*Math.cos(angle)+5);
    personGroup.userData = { swayOffset: Math.random()*Math.PI*2, bobOffset: Math.random()*Math.PI*2 };
    crowdGroup.add(personGroup); personGroups.push(personGroup);
  }
  addOwnCrowdFigure(crowdGroup, radius, texLoader, total);
}

async function addOwnCrowdFigure(crowdGroup, radius, texLoader, total) {
  await window.miiDataReady;
  const myMiiData = window.getMyMiiData();
  const myGroup = new THREE.Group();
  const myColor = new THREE.Color().setHSL(Math.random(), 0.7, 0.5);
  const myBody = new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,0.3,16), new THREE.MeshStandardMaterial({ color: myColor }));
  myBody.position.y = 0.15;
  const myTop = new THREE.Mesh(new THREE.SphereGeometry(0.08,16,16,0,Math.PI*2,0,Math.PI/2), new THREE.MeshStandardMaterial({ color: myColor }));
  myTop.position.y = 0.3;
  myGroup.add(myBody, myTop);
  if (myMiiData) {
    try {
      const mySprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map: texLoader.load(`https://mii-unsecure.ariankordi.net/miis/image.png?erri=sqkn3-rfb&data=${myMiiData}&type=face_only&width=270&pantsColor=red&verifyCRC16=0&verifyCharInfo=0`),
        transparent: true, alphaTest: 0.1
      }));
      mySprite.scale.set(0.56,0.56,1); mySprite.position.y = 0.6; mySprite.position.z = 0.015;
      myGroup.add(mySprite);
    } catch(err) { console.error("Failed to load own Mii:", err); }
  }
  const myTotal = total+1, myAngle = ((total-(myTotal-1)/2)/myTotal)*Math.PI/2;
  myGroup.position.set(radius*Math.sin(myAngle), 0, -radius*Math.cos(myAngle)+5);
  myGroup.userData = { swayOffset: Math.random()*Math.PI*2, bobOffset: Math.random()*Math.PI*2 };
  crowdGroup.add(myGroup); personGroups.push(myGroup);
}

initCrowd();
animate();
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
