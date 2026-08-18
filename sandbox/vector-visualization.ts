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

const UP = new Vector3(0, 1, 0);

export interface VectorArrowOptions {
  color: number;
  origin?: Vector3;
  shaftRadius?: number;
  headLength?: number;
  headRadius?: number;
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
