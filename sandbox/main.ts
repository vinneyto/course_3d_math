import {
  DirectionalLight,
  HemisphereLight,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js";
import "./style.css";
import { createSky } from "./sky";
import type { DemoModule } from "./types";

const canvas = document.querySelector<HTMLCanvasElement>("#demo-canvas");

if (!canvas) {
  throw new Error("Sandbox canvas was not found");
}

const scene = new Scene();
const camera = new PerspectiveCamera(50, 1, 0.1, 1_000);
camera.position.set(8, 7, 10);

const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = "srgb";

const labelRenderer = new CSS2DRenderer();
labelRenderer.domElement.className = "label-layer";
document.body.append(labelRenderer.domElement);

const sky = createSky();
const hemisphereLight = new HemisphereLight(0xd9ecff, 0x182033, 1.7);
const directionalLight = new DirectionalLight(0xffffff, 2.8);
directionalLight.position.set(6, 9, 7);
scene.add(sky.mesh, hemisphereLight, directionalLight);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.target.set(1, 1.5, 2);

const demoLoaders = import.meta.glob<DemoModule>("../exercises/**/demo.ts");
const loadDemo = demoLoaders[__DEMO_ENTRY__];

if (!loadDemo) {
  throw new Error(`Demo module was not found: ${__DEMO_ENTRY__}`);
}

const demo = await loadDemo();
const disposeDemo = demo.mountDemo({ scene, camera, renderer });

function resize(): void {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
  labelRenderer.setSize(width, height);
}

function render(): void {
  controls.update();
  sky.follow(camera.position);
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}

resize();
renderer.setAnimationLoop(render);
window.addEventListener("resize", resize);

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    window.removeEventListener("resize", resize);
    renderer.setAnimationLoop(null);
    controls.dispose();
    disposeDemo?.();
    scene.remove(sky.mesh, hemisphereLight, directionalLight);
    sky.dispose();
    labelRenderer.domElement.remove();
    renderer.dispose();
  });
}
