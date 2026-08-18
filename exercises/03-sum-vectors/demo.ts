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

const VECTORS = [
  new Vector3(1, 0, 2),
  new Vector3(0, 3, 1),
  new Vector3(4, 2, 0),
];
const VECTOR_COLORS = [0x4dd0e1, 0xf062c0, 0xff8a5b];
const VECTOR_CSS_COLORS = ["#75e6f2", "#fa84d3", "#ffa27f"];
const RESULT = VECTORS.reduce(
  (sum, vector) => sum.add(vector),
  new Vector3(),
);
const ORIGIN = new Vector3();

export function mountDemo({
  scene,
  camera,
  controls,
}: DemoContext): () => void {
  const previousCameraPosition = camera.position.clone();
  const previousControlsTarget = controls.target.clone();
  camera.position.set(12, 11, 14);
  controls.target.copy(RESULT).multiplyScalar(0.48);
  controls.update();

  const axes = new AxesHelper(7);
  const axisLabels = [
    createLabel("X", new Vector3(7.35, 0, 0), "#ff5b5b", "axis-label"),
    createLabel("Y", new Vector3(0, 7.35, 0), "#68e06f", "axis-label"),
    createLabel("Z", new Vector3(0, 0, 7.35), "#5b8cff", "axis-label"),
  ];

  let chainPosition = new Vector3();
  const chainArrows: Object3D[] = [];
  const vectorLabels = VECTORS.map((vector, index) => {
    const arrowOrigin = chainPosition.clone();
    const arrow = createVectorArrow(vector, {
      color: VECTOR_COLORS[index],
      origin: arrowOrigin,
      shaftRadius: 0.06,
      headLength: 0.5,
      headRadius: 0.21,
    });
    chainArrows.push(arrow);

    const labelPosition = arrowOrigin
      .clone()
      .add(vector.clone().multiplyScalar(0.52));
    chainPosition.add(vector);
    return createLabel(
      `v${index + 1} = (${vector.x}, ${vector.y}, ${vector.z})`,
      labelPosition,
      VECTOR_CSS_COLORS[index],
    );
  });

  const resultArrow = createVectorArrow(RESULT, {
    color: 0xffd166,
    shaftRadius: 0.095,
    headLength: 0.7,
    headRadius: 0.3,
  });
  const sumLabels = [
    createLabel("0 = (0, 0, 0)", new Vector3(0, 0.2, 0), "#dbe7f5"),
    createLabel("Σv = (5, 5, 3)", RESULT, "#ffe08a"),
  ];

  const projectionSteps = [
    {
      text: "x = 5",
      start: ORIGIN,
      end: new Vector3(RESULT.x, 0, 0),
      color: 0xff5b5b,
      css: "#ff7878",
    },
    {
      text: "y = 5",
      start: new Vector3(RESULT.x, 0, 0),
      end: new Vector3(RESULT.x, RESULT.y, 0),
      color: 0x68e06f,
      css: "#80ee86",
    },
    {
      text: "z = 3",
      start: new Vector3(RESULT.x, RESULT.y, 0),
      end: RESULT,
      color: 0x5b8cff,
      css: "#7aa0ff",
    },
  ].flatMap(({ text, start, end, color, css }) => {
    const marker = new Mesh(
      new SphereGeometry(0.12, 24, 16),
      new MeshStandardMaterial({ color, roughness: 0.35 }),
    );
    marker.position.copy(end);

    const label = createLabel(text, start.clone().lerp(end, 0.5), css);
    const guide = new Line(
      new BufferGeometry().setFromPoints([start, end]),
      new LineBasicMaterial({ color, opacity: 0.9, transparent: true }),
    );
    return [marker, label, guide];
  });

  const demoObjects: Object3D[] = [
    axes,
    ...chainArrows,
    resultArrow,
    ...axisLabels,
    ...vectorLabels,
    ...sumLabels,
    ...projectionSteps,
  ];
  scene.add(...demoObjects);

  return () => {
    scene.remove(...demoObjects);
    axes.dispose();
    chainArrows.forEach(disposeObject3D);
    disposeObject3D(resultArrow);
    projectionSteps.forEach(disposeObject3D);
    [...axisLabels, ...vectorLabels, ...sumLabels].forEach((label) =>
      label.element.remove(),
    );
    camera.position.copy(previousCameraPosition);
    controls.target.copy(previousControlsTarget);
    controls.update();
  };
}
