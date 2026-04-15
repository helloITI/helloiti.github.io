// i use file.garden for files beacuse of nekoweb's storage limit for free users, and i don't want my website's storage go full
// so... yeah.
// anyways, enjoy playing helloT seal clicker! this is basically a recreation of sk*b*b*'s helloT seal clicker, which got removed.
// (aka, the owner of mt-tools, which he used a lot of ai for his stuff, and i mean, an unhealthy amount of ai, so please, don't use his projects,
// beacuse most of them are broken as fuck, and the reason is ai, so yeah!)
// other stuff that i can remember will be added some day in my recreation, so, in the meanwhile, have fun using this!
const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({
  canvas, antialias: window.innerWidth > 768, alpha: true, powerPreference: "high-performance"
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.5 : 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0.5, 5);
scene.add(new THREE.AmbientLight(0xffffff, 2.5));
const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
dirLight.position.set(5, 5, 5);
scene.add(dirLight);
const spinGroup = new THREE.Group();
scene.add(spinGroup);
let sealModel = null;
const targetScale = new THREE.Vector3(1, 1, 1);
const currentScale = new THREE.Vector3(1, 1, 1);
let danceIntensity = 0;
const loader = new THREE.GLTFLoader();
// the three, the js... (why is three.js lowk a bit hard tho)
loader.load("https://helloiti.github.io/assets/models/seal/seal.gltf", (gltf) => {
  sealModel = gltf.scene;
  sealModel.traverse(child => {
    if (child.isMesh) {
      child.material = new THREE.MeshStandardMaterial({ map: child.material.map,
        transparent: true,
        alphaTest: 0.5,
        side: THREE.DoubleSide
      }); } });
  sealModel.rotation.y = -Math.PI / 2; spinGroup.add(sealModel);
  origTransform.position = sealModel.position.clone();
  origTransform.rotation = sealModel.rotation.clone();
  origTransform.scale = sealModel.scale.clone();
});
let time = 0;
window.specialTriggered = false; let spinPaused = false; let flying = false; let falling = false; let flyStart = 0; const flyDuration = 1.0; const flyPeakY = 5; let waitAtTopTimeout = null; let waitAfterLandTimeout = null;
const origTransform = {
  position: new THREE.Vector3(0,0,0),
  rotation: new THREE.Euler(0,0,0),
  scale: new THREE.Vector3(1,1,1)
};
const velocity = new THREE.Vector3(0, 0, 0); const angularVelocity = new THREE.Vector3(0, 0, 0); const gravity = -18;
let prevRAF = performance.now();
window.triggerSealFly = function() {
  if (!sealModel || window.specialTriggered) return;
  window.specialTriggered = true;
  flying = true;
  spinPaused = true;
  flyStart = performance.now() / 1000;
  origTransform.position.copy(sealModel.position);
  origTransform.rotation.copy(sealModel.rotation);
  origTransform.scale.copy(sealModel.scale);
  danceIntensity = 0;
  targetScale.set(1,1,1);
  if (waitAtTopTimeout) clearTimeout(waitAtTopTimeout);
  if (waitAfterLandTimeout) clearTimeout(waitAfterLandTimeout);
}
function startFall() {
  falling = true;
  velocity.set(0, 0, 0);
  angularVelocity.set(
    (Math.random() - 0.5) * 6,
    (Math.random() - 0.5) * 6,
    (Math.random() - 0.5) * 6
  );
}
function landAndWaitThenReset() {
  falling = false;
  flying = false;
  waitAfterLandTimeout = setTimeout(() => {
    sealModel.position.copy(origTransform.position);
    sealModel.rotation.copy(origTransform.rotation);
    sealModel.scale.copy(origTransform.scale);
    spinPaused = false;
    waitAfterLandTimeout = null;
  }, 3000);
}
function animate() {
  requestAnimationFrame(animate);
  const now = performance.now();
  const delta = Math.min((now - prevRAF) / 1000, 0.05);
  prevRAF = now;
  time += 0.035;
  if (!spinPaused) {
    spinGroup.rotation.y += window.innerWidth < 768 ? 0.02 : 0.04;
  }
  if (sealModel) {
    currentScale.lerp(targetScale, 0.2);
    targetScale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
    sealModel.scale.copy(currentScale);
    if (flying) {
      const t = (performance.now() / 1000 - flyStart) / flyDuration;
      const clamped = Math.min(Math.max(t, 0), 1);
      const ease = 1 - Math.pow(1 - clamped, 3);
      const startY = origTransform.position.y;
      sealModel.position.y = THREE.MathUtils.lerp(startY, flyPeakY, ease);
      sealModel.rotation.x += 0.02;
      sealModel.rotation.y += 0.06;
      if (t >= 1) {
        flying = false;
        waitAtTopTimeout = setTimeout(startFall, 2500);
      }
    }
    if (falling) {
      velocity.y += gravity * delta;
      sealModel.position.addScaledVector(velocity, delta);
      sealModel.rotation.x += angularVelocity.x * delta;
      sealModel.rotation.y += angularVelocity.y * delta;
      sealModel.rotation.z += angularVelocity.z * delta;
      if (sealModel.position.y <= origTransform.position.y) {
        sealModel.position.y = origTransform.position.y;
        angularVelocity.multiplyScalar(0.18);
        landAndWaitThenReset();
      }
    }
  }
  renderer.render(scene, camera);
}
animate(); window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight); });
const songs = [
  "https://helloiti.github.io/assets/13._Exhibition.mp3",
  "https://heloiti.github.io/assets/07main.mp3",
  "https://helloiti.github.io/assets/3ds.mp3",
  "https://helloiti.github.io/assets/back_music.mp3",
  "https:/helloiti.github.io/assets/egg_song.mp3",
  "https://helloiti.github.io/assets/dwnmng.mp3",
  "https://helloiti.github.io/assets/psvita.mp3"
];
window.translations = {
  en: {
    title: "※⁜ helloT seal clicker ⁜※",
    subtitle: "※⁜ each click updates the <b>global</b> counter! ⁜※",
    clicks: "clicks",
    button: " Yap yoo! ",
    randomTexts: [
      "1 click = 1 seal will appear on someone's door /j",
      "1 click = +1 baddie 😍",
      "1 click = The seal will fly 😱",
      "1 click = 1 more day of summer (SADLY, NOT REAL 😔)",
      "1 click = You become immortal 😱 (NO)",
      "1 click = MrBreast will give you 1000000 BILKION DOLLARZ 🤑",
      "1 click = donation to TEAM SEALS, (i'm poor, ok? 💔)",
      "1 click = GTA 6 will come 1 hour earlier",
      "1 click = 1 glass of free water!",
      "1 click = parapa 🥹",
      "1 click = it will rain helloT seals 🦭",
      "1 click = + 0.0001% possibility of helloT seal cameo in Web Room.",
      "1 click = +1 Temu AD permamently BANNED",
      "1 click = MORE SEALS 🤑 /j",
      "1 click = Update to the global counter! /srs",
      "1 click = +1 good luck 🍀",
      "1 click = +1 free robuck 🤑 /j",
      "1 click = +1 helloT seal will appear in someone's backyard /j",
      "1 click = 1 click"
    ]
  },
  es: {
    title: "※⁜ clicker de foca helloT ⁜※",
    subtitle: "※⁜ cada clic actualiza el contador <b>global</b>! ⁜※",
    clicks: "clics",
    button: " Yap yoo! ",
    randomTexts: [
      "1 clic = 1 foca aparecerá en la puerta de alguien /j",
      "1 clic = +1 baddie 😍",
      "1 clic = La foca volará 😱",
      "1 clic = 1 día más de verano (TRISTEMENTE, NO REAL 😔)",
      "1 clic = Te vuelves inmortal 😱 (NO)",
      "1 clic = MrBreast te dará 1000000 BILKION DÓLARES 🤑",
      "1 clic = donación a TEAM SEALS, (soy pobre, ¿vale? 💔)",
      "1 clic = GTA 6 saldrá 1 hora antes",
      "1 clic = 1 vaso de agua gratis!",
      "1 clic = parapa 🥹",
      "1 clic = lloverá focas helloT 🦭",
      "1 clic = + 0.0001% posibilidad de cameo de foca helloT en Web Room.",
      "1 clic = +1 ANUNCIO de Temu BANEADO permanentemente",
      "1 clic = MÁS FOCAS 🤑 /j",
      "1 clic = ¡Actualización al contador global! /srs",
      "1 clic = +1 buena suerte 🍀",
      "1 clic = +1 robuck gratis 🤑 /j",
      "1 clic = +1 foca helloT aparecerá en el patio de alguien /j",
      "1 clic = 1 clic"
    ]
  },
  fr: {
    title: "※⁜ clicker de phoque helloT ⁜※",
    subtitle: "※⁜ chaque clic met à jour le compteur <b>global</b> ! ⁜※",
    clicks: "clics",
    button: " Yap yoo! ",
    randomTexts: [
      "1 clic = 1 phoque apparaîtra à la porte de quelqu'un /j",
      "1 clic = +1 baddie 😍",
      "1 clic = Le phoque volera 😱",
      "1 clic = 1 jour de plus d'été (MALHEUREUSEMENT, PAS RÉEL 😔)",
      "1 clic = Tu deviens immortel 😱 (NON)",
      "1 clic = MrBreast te donnera 1000000 BILKION DOLLARS 🤑",
      "1 clic = don à TEAM SEALS, (je suis pauvre, ok ? 💔)",
      "1 clic = GTA 6 sortira 1 heure plus tôt",
      "1 clic = 1 verre d'eau gratuit !",
      "1 clic = parapa 🥹",
      "1 clic = il pleuvra des phoques helloT 🦭",
      "1 clic = + 0.0001% possibilité de cameo de phoque helloT dans Web Room.",
      "1 clic = +1 PUB Temu BANNIE définitivement",
      "1 clic = PLUS DE PHOQUES 🤑 /j",
      "1 clic = Mise à jour du compteur global ! /srs",
      "1 clic = +1 bonne chance 🍀",
      "1 clic = +1 robuck gratuit 🤑 /j",
      "1 clic = +1 phoque helloT apparaîtra dans le jardin de quelqu'un /j",
      "1 clic = 1 clic"
    ]
  },
  yapyoo: {
    title: "※⁜ Yap Yoo! ⁜※",
    subtitle: "※⁜ Yap yap yap, yoo, yap, yoo yoo! ⁜※",
    clicks: "yap yoos!",
    button: " Yap yoo! ",
    randomTexts: [
      "1 yap yoo = 1 yap yoo, yap yap yoo yoo yap, yoo /j",
      "1 yap yoo = +1 yap yoo 😍",
      "1 yap yoo = yap yap yap yoo 😱",
      "1 yap yoo = 1 yap yap yoo yoo (YAP YOO, YAP YAP YOO 😔)",
      "1 yap yoo = yap yoo yap 😱 (YAP YOO)",
      "1 yap yoo = MrBreast yap yoo 1000000 yap yap yoo 🤑",
      "1 yap yoo = yap yap yoo TEAM SEALS, (yap yoo, yap? 💔)",
      "1 yap yoo = GTA 6 yap 1 yoo yap yoo",
      "1 yap yoo = 1 yap yap yoo yap!",
      "1 yap yoo = yap yoo 🥹",
      "1 yap yoo = yap yoo yoo helloT yap yoo 🦭",
      "1 yap yoo = + 0.0001% yap yap yoo yap yoo yap helloT yap yoo yap yap yoo Web Room.",
      "1 yap yoo = +1 YAP YOO yap Temu YAP YAP yoo yap",
      "1 yap yoo = YAP YOO 🤑 /j",
      "1 yap yoo = Yap yap yoo yap yoo yap! /srs",
      "1 yap yoo = +1 yap yap 🍀",
      "1 yap yoo = +1 yap yoo 🤑 /j",
      "1 yap yoo = +1 helloT yap yoo yap yap yoo yap yap yoo /j",
      "1 yap yoo = 1 yap yoo"
    ]
  }
};
window.currentLang = 'en';
window.flyRegex = /seal will fly/i;
const randomTextEl = document.getElementById("okcool");
function setRandomText() {
  const lang = window.currentLang || 'en';
  const randomTexts = window.translations[lang].randomTexts;
  const i = Math.floor(Math.random() * randomTexts.length);
  const chosen = randomTexts[i];
  randomTextEl.textContent = chosen;
  window.chosenText = chosen;
  return chosen;
}
window.chosenText = setRandomText();
const bgm = document.getElementById("bgm");
bgm.src = songs[Math.floor(Math.random() * songs.length)];
document.addEventListener("click", function startMusic() {
  bgm.play().catch(()=>{}); document.removeEventListener("click", startMusic);
}, { once: true });
const titleEl = document.querySelector('.title');
const subtitleEl = document.querySelector('.subtitle');
const yapButton = document.getElementById('YapYoo');
function updateLanguage(lang) {
  window.currentLang = lang;
  document.documentElement.lang = lang;
  const trans = window.translations[lang];
  titleEl.textContent = trans.title;
  document.title = trans.title;
  subtitleEl.innerHTML = trans.subtitle;
  yapButton.textContent = trans.button;
  if (lang === 'en') {
    window.flyRegex = /seal will fly/i;
  } else if (lang === 'es') {
    window.flyRegex = /foca volará/i;
  } else if (lang === 'fr') {
    window.flyRegex = /phoque volera/i;
  } else if (lang === 'yapyoo') {
    window.flyRegex = /yap yap yap yoo/i;
  }
  window.chosenText = setRandomText();
  if (window.updateCounterText) {
    window.updateCounterText();
  }
}
const langSelect = document.getElementById('language-selector');
langSelect.addEventListener('change', (e) => {
  updateLanguage(e.target.value);
});
