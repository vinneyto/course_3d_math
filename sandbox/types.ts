import type { PerspectiveCamera, Scene, WebGLRenderer } from "three";
import type { OrbitControls } from "three/addons/controls/OrbitControls.js";

export type FrameCallback = (elapsedSeconds: number) => void;
export type RegisterFrameCallback = (callback: FrameCallback) => () => void;

export interface DemoContext {
  scene: Scene;
  camera: PerspectiveCamera;
  controls: OrbitControls;
  renderer: WebGLRenderer;
  registerFrameCallback: RegisterFrameCallback;
}

export interface DemoModule {
  mountDemo(context: DemoContext): void | (() => void);
}
