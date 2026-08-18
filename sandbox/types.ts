import type { PerspectiveCamera, Scene, WebGLRenderer } from "three";

export interface DemoContext {
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
}

export interface DemoModule {
  mountDemo(context: DemoContext): void | (() => void);
}
