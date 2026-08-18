import {
  AxesHelper,
  BufferGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  Line,
  LineDashedMaterial,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Quaternion,
  SphereGeometry,
  Vector3,
} from "three";
import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import type { DemoContext } from "../../sandbox/types";

const VECTOR = new Vector3(2, 3, 4);
const UP = new Vector3(0, 1, 0);

function createLabel(
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

function createVectorArrow(vector: Vector3): Group {
  const length = vector.length();
  const headLength = 0.65;
  const shaftLength = length - headLength;
  const material = new MeshStandardMaterial({
    color: 0xffd166,
    metalness: 0.08,
    roughness: 0.28,
  });

  const shaft = new Mesh(
    new CylinderGeometry(0.075, 0.075, shaftLength, 32),
    material,
  );
  shaft.position.y = shaftLength / 2;

  const head = new Mesh(new ConeGeometry(0.28, headLength, 48), material);
  head.position.y = shaftLength + headLength / 2;

  const arrow = new Group();
  arrow.add(shaft, head);
  arrow.quaternion.copy(
    new Quaternion().setFromUnitVectors(UP, vector.clone().normalize()),
  );
  return arrow;
}

export function mountDemo({ scene }: DemoContext): () => void {
  const axes = new AxesHelper(5.8);
  const arrow = createVectorArrow(VECTOR);
  const demoObjects: Object3D[] = [axes, arrow];

  const axisLabels = [
    createLabel("X", new Vector3(6.1, 0, 0), "#ff5b5b", "axis-label"),
    createLabel("Y", new Vector3(0, 6.1, 0), "#68e06f", "axis-label"),
    createLabel("Z", new Vector3(0, 0, 6.1), "#5b8cff", "axis-label"),
  ];

  const projections = [
    {
      text: "x = 2",
      position: new Vector3(VECTOR.x, 0, 0),
      color: 0xff5b5b,
      css: "#ff7878",
    },
    {
      text: "y = 3",
      position: new Vector3(0, VECTOR.y, 0),
      color: 0x68e06f,
      css: "#80ee86",
    },
    {
      text: "z = 4",
      position: new Vector3(0, 0, VECTOR.z),
      color: 0x5b8cff,
      css: "#7aa0ff",
    },
  ].flatMap(({ text, position, color, css }) => {
    const material = new MeshStandardMaterial({ color, roughness: 0.35 });
    const marker = new Mesh(new SphereGeometry(0.11, 24, 16), material);
    marker.position.copy(position);
    const label = createLabel(text, position, css);
    const guide = new Line(
      new BufferGeometry().setFromPoints([position, VECTOR]),
      new LineDashedMaterial({
        color,
        dashSize: 0.16,
        gapSize: 0.11,
        opacity: 0.65,
        transparent: true,
      }),
    );
    guide.computeLineDistances();
    return [marker, label, guide];
  });

  demoObjects.push(...axisLabels, ...projections);
  scene.add(...demoObjects);

  return () => {
    scene.remove(...demoObjects);
    axes.dispose();
    arrow.traverse((object) => {
      if (object instanceof Mesh || object instanceof Line) {
        object.geometry.dispose();
        object.material.dispose();
      }
    });
    projections.forEach((object) => {
      if (object instanceof Mesh) {
        object.geometry.dispose();
        object.material.dispose();
      } else if (object instanceof CSS2DObject) {
        object.element.remove();
      }
    });
    axisLabels.forEach((label) => label.element.remove());
  };
}
