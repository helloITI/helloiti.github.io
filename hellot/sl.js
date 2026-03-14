const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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
loader.load("https://hellot.nekoweb.org/assets/models/seal/seal.gltf", (gltf) => {
  sealModel = gltf.scene;
  sealModel.traverse(child => {
    if (child.isMesh) {
      child.material = new THREE.MeshStandardMaterial({
        map: child.material.map,
        transparent: true,
        alphaTest: 0.5,
        side: THREE.DoubleSide
      });
    }
  });
  sealModel.rotation.y = -Math.PI / 2;
  spinGroup.add(sealModel);
});

let time = 0;
function animate() {
  requestAnimationFrame(animate);
  time += 0.05;

  spinGroup.rotation.y += 0.04;

  if (sealModel) {
    sealModel.rotation.z = Math.sin(time * 6) * (0.6 * danceIntensity);
    danceIntensity *= 0.95;
    currentScale.lerp(targetScale, 0.2);
    targetScale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
    sealModel.scale.copy(currentScale);
  }

  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});