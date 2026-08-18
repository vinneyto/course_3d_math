import type { PerspectiveCamera, Scene, WebGLRenderer } from "three";
import type { OrbitControls } from "three/addons/controls/OrbitControls.js";

export interface DemoContext {
  scene: Scene;
  camera: PerspectiveCamera;
  controls: OrbitControls;
  renderer: WebGLRenderer;
}

export interface DemoModule {
  mountDemo(context: DemoContext): void | (() => void);
}
