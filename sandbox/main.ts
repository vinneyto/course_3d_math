import { PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import "./style.css";
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
}

function render(): void {
  controls.update();
  renderer.render(scene, camera);
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
    renderer.dispose();
  });
}
