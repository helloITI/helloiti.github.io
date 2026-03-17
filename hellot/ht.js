 let scene, camera, renderer, model, raycaster, mouse;
let currentAxis = 'y';
const axes = ['x', 'z'];
let axisIndex = 0;
let originalRotation = null;
let resetTimeout = null;

let mixer = null;
let clock = new THREE.Clock();

function init() {

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.set(0, 0, 1500);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 1.5));
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(1, 2, 1);
  scene.add(dirLight);

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  const loader = new THREE.FBXLoader();
  loader.load(
    "https://helloiti.github.io/assets/models/fluffy/fluffyHelloT.fbx",
    (fbx) => {

      if (fbx.animations.length > 0) {
        mixer = new THREE.AnimationMixer(fbx);

        const anim = mixer.clipAction(fbx.animations[0]);
        anim.setLoop(THREE.LoopRepeat);
        anim.clampWhenFinished = false;
        anim.enabled = true;
        anim.play();
      }

      model = fbx;
      model.scale.setScalar(1.0);
      model.rotation.set(0, Math.PI / 2, 0);
      originalRotation = model.rotation.clone();

      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);

      scene.add(model);
    },
    undefined,
    () => {} // chud
  );

  renderer.domElement.addEventListener('click', onModelClick);
  window.addEventListener("resize", onWindowResize);
}

function onModelClick(event) {
  if (!model || !originalRotation) return;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(model, true);

  if (intersects.length > 0) {

    if (resetTimeout) clearTimeout(resetTimeout);

    axisIndex = (axisIndex + 1) % axes.length;
    currentAxis = axes[axisIndex];

    resetTimeout = setTimeout(() => {
      if (model) {
        model.rotation.copy(originalRotation);
        currentAxis = 'y';
      }
    }, 4250);
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);

  if (model) {
    model.rotation[currentAxis] += 0.05;
  }

  renderer.render(scene, camera);
}

init();
animate();
