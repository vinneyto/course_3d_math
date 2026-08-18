import {
  AxesHelper,
  BufferGeometry,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  SphereGeometry,
  Vector3,
} from "three";
import type { DemoContext } from "../../sandbox/types";
import {
  createLabel,
  createVectorArrow,
  disposeObject3D,
} from "../../sandbox/vector-visualization";

const VECTOR = new Vector3(2, 3, 4);

export function mountDemo({ scene }: DemoContext): () => void {
  const axes = new AxesHelper(5.8);
  const arrow = createVectorArrow(VECTOR, { color: 0xffd166 });
  const demoObjects: Object3D[] = [axes, arrow];

  const axisLabels = [
    createLabel("X", new Vector3(6.1, 0, 0), "#ff5b5b", "axis-label"),
    createLabel("Y", new Vector3(0, 6.1, 0), "#68e06f", "axis-label"),
    createLabel("Z", new Vector3(0, 0, 6.1), "#5b8cff", "axis-label"),
  ];

  const projectionSteps = [
    {
      text: "x = 2",
      start: new Vector3(0, 0, 0),
      end: new Vector3(VECTOR.x, 0, 0),
      color: 0xff5b5b,
      css: "#ff7878",
    },
    {
      text: "y = 3",
      start: new Vector3(VECTOR.x, 0, 0),
      end: new Vector3(VECTOR.x, VECTOR.y, 0),
      color: 0x68e06f,
      css: "#80ee86",
    },
    {
      text: "z = 4",
      start: new Vector3(VECTOR.x, VECTOR.y, 0),
      end: VECTOR,
      color: 0x5b8cff,
      css: "#7aa0ff",
    },
  ].flatMap(({ text, start, end, color, css }) => {
    const material = new MeshStandardMaterial({ color, roughness: 0.35 });
    const marker = new Mesh(new SphereGeometry(0.11, 24, 16), material);
    marker.position.copy(end);
    const labelPosition = start.clone().lerp(end, 0.5);
    const label = createLabel(text, labelPosition, css);
    const guide = new Line(
      new BufferGeometry().setFromPoints([start, end]),
      new LineBasicMaterial({
        color,
        opacity: 0.9,
        transparent: true,
      }),
    );
    return [marker, label, guide];
  });

  demoObjects.push(...axisLabels, ...projectionSteps);
  scene.add(...demoObjects);

  return () => {
    scene.remove(...demoObjects);
    axes.dispose();
    disposeObject3D(arrow);
    projectionSteps.forEach(disposeObject3D);
    axisLabels.forEach((label) => label.element.remove());
  };
}
