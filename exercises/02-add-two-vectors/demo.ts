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

const FIRST = new Vector3(1, 2, 3);
const SECOND = new Vector3(4, 5, 6);
const RESULT = FIRST.clone().add(SECOND);
const ORIGIN = new Vector3();

export function mountDemo({
  scene,
  camera,
  controls,
}: DemoContext): () => void {
  const previousCameraPosition = camera.position.clone();
  const previousControlsTarget = controls.target.clone();
  camera.position.set(18, 16, 22);
  controls.target.copy(RESULT).multiplyScalar(0.48);
  controls.update();

  const axes = new AxesHelper(10.5);
  const firstArrow = createVectorArrow(FIRST, {
    color: 0x4dd0e1,
    shaftRadius: 0.065,
    headLength: 0.52,
    headRadius: 0.22,
  });
  const secondArrow = createVectorArrow(SECOND, {
    color: 0xf062c0,
    origin: FIRST,
    shaftRadius: 0.065,
    headLength: 0.58,
    headRadius: 0.24,
  });
  const resultArrow = createVectorArrow(RESULT, {
    color: 0xffd166,
    shaftRadius: 0.1,
    headLength: 0.78,
    headRadius: 0.34,
  });

  const axisLabels = [
    createLabel("X", new Vector3(10.9, 0, 0), "#ff5b5b", "axis-label"),
    createLabel("Y", new Vector3(0, 10.9, 0), "#68e06f", "axis-label"),
    createLabel("Z", new Vector3(0, 0, 10.9), "#5b8cff", "axis-label"),
  ];

  const vectorLabels = [
    createLabel(
      "a = (1, 2, 3)",
      FIRST.clone().multiplyScalar(0.52),
      "#75e6f2",
    ),
    createLabel(
      "b = (4, 5, 6)",
      FIRST.clone().add(SECOND.clone().multiplyScalar(0.52)),
      "#fa84d3",
    ),
    createLabel("a + b = (5, 7, 9)", RESULT, "#ffe08a"),
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
      text: "y = 7",
      start: new Vector3(RESULT.x, 0, 0),
      end: new Vector3(RESULT.x, RESULT.y, 0),
      color: 0x68e06f,
      css: "#80ee86",
    },
    {
      text: "z = 9",
      start: new Vector3(RESULT.x, RESULT.y, 0),
      end: RESULT,
      color: 0x5b8cff,
      css: "#7aa0ff",
    },
  ].flatMap(({ text, start, end, color, css }) => {
    const marker = new Mesh(
      new SphereGeometry(0.14, 24, 16),
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
    firstArrow,
    secondArrow,
    resultArrow,
    ...axisLabels,
    ...vectorLabels,
    ...projectionSteps,
  ];
  scene.add(...demoObjects);

  return () => {
    scene.remove(...demoObjects);
    axes.dispose();
    disposeObject3D(firstArrow);
    disposeObject3D(secondArrow);
    disposeObject3D(resultArrow);
    projectionSteps.forEach(disposeObject3D);
    [...axisLabels, ...vectorLabels].forEach((label) => label.element.remove());
    camera.position.copy(previousCameraPosition);
    controls.target.copy(previousControlsTarget);
    controls.update();
  };
}
