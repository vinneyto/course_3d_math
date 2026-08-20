import {
  AxesHelper,
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

const POINT_A = new Vector3(1, 1, 1);
const POINT_B = new Vector3(4, 3, 2);
const ORIGIN = new Vector3();
const VECTOR_AB = POINT_B.clone().sub(POINT_A);
const PHASE_DURATION_SECONDS = 3;
const CYCLE_DURATION_SECONDS = PHASE_DURATION_SECONDS * 4;

function smoothStep(value: number): number {
  return value * value * (3 - 2 * value);
}

function transferToOriginProgress(elapsedSeconds: number): number {
  const phase = elapsedSeconds % CYCLE_DURATION_SECONDS;

  if (phase < PHASE_DURATION_SECONDS) {
    return 0;
  }
  if (phase < PHASE_DURATION_SECONDS * 2) {
    return smoothStep(
      (phase - PHASE_DURATION_SECONDS) / PHASE_DURATION_SECONDS,
    );
  }
  if (phase < PHASE_DURATION_SECONDS * 3) {
    return 1;
  }
  const returnProgress =
    (phase - PHASE_DURATION_SECONDS * 3) / PHASE_DURATION_SECONDS;
  return 1 - smoothStep(returnProgress);
}

function createPoint(position: Vector3, color: number): Mesh {
  const point = new Mesh(
    new SphereGeometry(0.16, 32, 24),
    new MeshStandardMaterial({ color, roughness: 0.3 }),
  );
  point.position.copy(position);
  return point;
}

export function mountDemo({
  scene,
  camera,
  controls,
  registerFrameCallback,
}: DemoContext): () => void {
  const previousCameraPosition = camera.position.clone();
  const previousControlsTarget = controls.target.clone();
  camera.position.set(9, 7, 11);
  controls.target.set(2, 1.5, 1);
  controls.update();

  const axes = new AxesHelper(6.5);
  const pointA = createPoint(POINT_A, 0xf062c0);
  const pointB = createPoint(POINT_B, 0x4dd0e1);
  const vectorArrow = createVectorArrow(VECTOR_AB, {
    color: 0xffd166,
    origin: POINT_A,
    shaftRadius: 0.085,
    headLength: 0.58,
    headRadius: 0.26,
  });
  vectorArrow.add(
    createLabel(
      "AB = B - A = (3, 2, 1)",
      new Vector3(0, VECTOR_AB.length() * 0.52, 0),
      "#ffe08a",
    ),
  );

  const axisLabels = [
    createLabel("X", new Vector3(6.8, 0, 0), "#ff5b5b", "axis-label"),
    createLabel("Y", new Vector3(0, 6.8, 0), "#68e06f", "axis-label"),
    createLabel("Z", new Vector3(0, 0, 6.8), "#5b8cff", "axis-label"),
  ];
  const pointLabels = [
    createLabel("A = (1, 1, 1)", POINT_A, "#fa84d3"),
    createLabel("B = (4, 3, 2)", POINT_B, "#75e6f2"),
  ];
  const originLabel = createLabel(
    "O = (0, 0, 0)",
    new Vector3(-0.2, -0.2, -0.2),
    "#ffffff",
  );

  let startedAtSeconds: number | undefined;
  const stopAnimation = registerFrameCallback((elapsedSeconds) => {
    startedAtSeconds ??= elapsedSeconds;
    const progress = transferToOriginProgress(
      elapsedSeconds - startedAtSeconds,
    );
    vectorArrow.position.lerpVectors(POINT_A, ORIGIN, progress);
  });

  const demoObjects: Object3D[] = [
    axes,
    pointA,
    pointB,
    vectorArrow,
    ...axisLabels,
    ...pointLabels,
    originLabel,
  ];
  scene.add(...demoObjects);

  return () => {
    scene.remove(...demoObjects);
    axes.dispose();
    disposeObject3D(pointA);
    disposeObject3D(pointB);
    disposeObject3D(vectorArrow);
    [...axisLabels, ...pointLabels, originLabel].forEach((label) =>
      label.element.remove(),
    );
    stopAnimation();
    camera.position.copy(previousCameraPosition);
    controls.target.copy(previousControlsTarget);
    controls.update();
  };
}
