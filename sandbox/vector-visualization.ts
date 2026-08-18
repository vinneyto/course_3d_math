import {
  ConeGeometry,
  CylinderGeometry,
  Group,
  Line,
  Material,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Quaternion,
  Vector3,
} from "three";
import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import type { RegisterFrameCallback } from "./types";

const UP = new Vector3(0, 1, 0);
const CHAIN_PHASE_DURATION_SECONDS = 3;
const CHAIN_CYCLE_DURATION_SECONDS = CHAIN_PHASE_DURATION_SECONDS * 4;

export interface VectorArrowOptions {
  color: number;
  origin?: Vector3;
  shaftRadius?: number;
  headLength?: number;
  headRadius?: number;
}

export interface AnimatedChainArrow {
  arrow: Object3D;
  chainOrigin: Vector3;
}

export function createLabel(
  text: string,
  position: Vector3,
  color: string,
  className = "",
): CSS2DObject {
  const element = document.createElement("div");
  element.className = `demo-label ${className}`;
  element.textContent = text;
  element.style.color = color;

  const label = new CSS2DObject(element);
  label.position.copy(position);
  return label;
}

export function createVectorArrow(
  vector: Vector3,
  {
    color,
    origin = new Vector3(),
    shaftRadius = 0.075,
    headLength = 0.65,
    headRadius = 0.28,
  }: VectorArrowOptions,
): Group {
  const length = vector.length();
  const shaftLength = Math.max(0, length - headLength);
  const material = new MeshStandardMaterial({
    color,
    metalness: 0.08,
    roughness: 0.28,
  });

  const shaft = new Mesh(
    new CylinderGeometry(shaftRadius, shaftRadius, shaftLength, 32),
    material,
  );
  shaft.position.y = shaftLength / 2;

  const head = new Mesh(new ConeGeometry(headRadius, headLength, 48), material);
  head.position.y = shaftLength + headLength / 2;

  const arrow = new Group();
  arrow.position.copy(origin);
  arrow.add(shaft, head);
  arrow.quaternion.copy(
    new Quaternion().setFromUnitVectors(UP, vector.clone().normalize()),
  );
  return arrow;
}

function smoothStep(value: number): number {
  return value * value * (3 - 2 * value);
}

function chainProgress(elapsedSeconds: number): number {
  const phase = elapsedSeconds % CHAIN_CYCLE_DURATION_SECONDS;

  if (phase < CHAIN_PHASE_DURATION_SECONDS) {
    return 0;
  }
  if (phase < CHAIN_PHASE_DURATION_SECONDS * 2) {
    return smoothStep(
      (phase - CHAIN_PHASE_DURATION_SECONDS) / CHAIN_PHASE_DURATION_SECONDS,
    );
  }
  if (phase < CHAIN_PHASE_DURATION_SECONDS * 3) {
    return 1;
  }
  const returnProgress =
    (phase - CHAIN_PHASE_DURATION_SECONDS * 3) /
    CHAIN_PHASE_DURATION_SECONDS;
  return 1 - smoothStep(returnProgress);
}

export function createLoopingVectorChainAnimation(
  registerFrameCallback: RegisterFrameCallback,
  arrows: AnimatedChainArrow[],
): () => void {
  let startedAtSeconds: number | undefined;

  arrows.forEach(({ arrow }) => arrow.position.set(0, 0, 0));

  return registerFrameCallback((elapsedSeconds) => {
    startedAtSeconds ??= elapsedSeconds;
    const progress = chainProgress(elapsedSeconds - startedAtSeconds);

    arrows.forEach(({ arrow, chainOrigin }) => {
      arrow.position.copy(chainOrigin).multiplyScalar(progress);
    });
  });
}

export function disposeObject3D(root: Object3D): void {
  const materials = new Set<Material>();

  root.traverse((object) => {
    if (object instanceof Mesh || object instanceof Line) {
      object.geometry.dispose();
      const objectMaterials = Array.isArray(object.material)
        ? object.material
        : [object.material];
      objectMaterials.forEach((material) => materials.add(material));
    }

    if (object instanceof CSS2DObject) {
      object.element.remove();
    }
  });

  materials.forEach((material) => material.dispose());
}
