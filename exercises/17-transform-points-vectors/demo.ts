import {
  AxesHelper,
  BoxGeometry,
  Group,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Quaternion,
  SphereGeometry,
  Vector3,
} from "three";
import type { DemoContext } from "../../sandbox/types";
import {
  createLabel,
  createVectorArrow,
  disposeObject3D,
} from "../../sandbox/vector-visualization";

const LOCAL_POINT = new Vector3(3, 1, 0);
const GLOBAL_TRANSLATION = new Vector3(4, 2, 1);
const ROTATION_RADIANS = Math.PI / 2;
const PHASE_DURATION_SECONDS = 3;
const CYCLE_DURATION_SECONDS = PHASE_DURATION_SECONDS * 5;
const IDENTITY_QUATERNION = new Quaternion();
const ROTATED_QUATERNION = new Quaternion().setFromAxisAngle(
  new Vector3(0, 0, 1),
  ROTATION_RADIANS,
);
const UNIT_SCALE = new Vector3(1, 1, 1);

function smoothStep(value: number): number {
  return value * value * (3 - 2 * value);
}

interface AnimationState {
  rotationProgress: number;
  translationProgress: number;
  title: string;
}

function animationState(elapsedSeconds: number): AnimationState {
  const phase = elapsedSeconds % CYCLE_DURATION_SECONDS;

  if (phase < PHASE_DURATION_SECONDS) {
    return {
      rotationProgress: 0,
      translationProgress: 0,
      title: "1: P = (3, 1, 0), cube O = (0, 0, 0)",
    };
  }
  if (phase < PHASE_DURATION_SECONDS * 2) {
    return {
      rotationProgress: smoothStep(
        (phase - PHASE_DURATION_SECONDS) / PHASE_DURATION_SECONDS,
      ),
      translationProgress: 0,
      title: "1 → 2: Rz = 90° = π / 2 rad",
    };
  }
  if (phase < PHASE_DURATION_SECONDS * 3) {
    return {
      rotationProgress: 1,
      translationProgress: 0,
      title: "2: R·P = (-1, 3, 0), cube O = (0, 0, 0)",
    };
  }
  if (phase < PHASE_DURATION_SECONDS * 4) {
    return {
      rotationProgress: 1,
      translationProgress: smoothStep(
        (phase - PHASE_DURATION_SECONDS * 3) / PHASE_DURATION_SECONDS,
      ),
      title: "2 → 3: + T = (4, 2, 1) в global",
    };
  }
  return {
    rotationProgress: 1,
    translationProgress: 1,
    title: "3: R·P + T = (3, 5, 1), cube O + T = (4, 2, 1)",
  };
}

function createBasisArrow(vector: Vector3, color: number, label: string): Group {
  const arrow = createVectorArrow(vector, {
    color,
    shaftRadius: 0.055,
    headLength: 0.35,
    headRadius: 0.16,
  });
  arrow.add(
    createLabel(
      label,
      new Vector3(0, vector.length() + 0.25, 0),
      `#${color.toString(16).padStart(6, "0")}`,
    ),
  );
  return arrow;
}

export function mountDemo({
  scene,
  camera,
  controls,
  registerFrameCallback,
}: DemoContext): () => void {
  const previousCameraPosition = camera.position.clone();
  const previousControlsTarget = controls.target.clone();
  camera.position.set(12, 9, 14);
  controls.target.set(2.5, 2, 0.5);
  controls.update();

  const axes = new AxesHelper(9);
  const transformedObjects = new Group();
  transformedObjects.matrixAutoUpdate = false;

  const cube = new Mesh(
    new BoxGeometry(1.4, 1.4, 1.4, 2, 2, 2),
    new MeshStandardMaterial({
      color: 0x7e57c2,
      metalness: 0.08,
      roughness: 0.3,
    }),
  );
  const cornerMarker = new Mesh(
    new SphereGeometry(0.13, 24, 16),
    new MeshStandardMaterial({ color: 0xffd166, roughness: 0.25 }),
  );
  cornerMarker.position.set(0.7, 0.7, 0.7);
  cube.add(cornerMarker);

  const point = new Mesh(
    new SphereGeometry(0.2, 32, 24),
    new MeshStandardMaterial({ color: 0xf062c0, roughness: 0.25 }),
  );
  point.position.copy(LOCAL_POINT);
  point.add(
    createLabel(
      "P local = (3, 1, 0)",
      new Vector3(0.25, 0.25, 0),
      "#fa84d3",
    ),
  );

  const localBasis = new Group();
  localBasis.add(
    createBasisArrow(new Vector3(1.8, 0, 0), 0xff5b5b, "local X"),
    createBasisArrow(new Vector3(0, 1.8, 0), 0x68e06f, "local Y"),
    createBasisArrow(new Vector3(0, 0, 1.8), 0x5b8cff, "local Z"),
  );
  transformedObjects.add(cube, point, localBasis);

  const translationArrow = createVectorArrow(GLOBAL_TRANSLATION, {
    color: 0xffd166,
    shaftRadius: 0.07,
    headLength: 0.5,
    headRadius: 0.22,
  });
  translationArrow.add(
    createLabel(
      "T = (4, 2, 1), global",
      new Vector3(0, GLOBAL_TRANSLATION.length() * 0.52, 0),
      "#ffe08a",
    ),
  );

  const axisLabels = [
    createLabel("X", new Vector3(9.3, 0, 0), "#ff5b5b", "axis-label"),
    createLabel("Y", new Vector3(0, 9.3, 0), "#68e06f", "axis-label"),
    createLabel("Z", new Vector3(0, 0, 9.3), "#5b8cff", "axis-label"),
  ];
  const originLabel = createLabel(
    "global O = (0, 0, 0)",
    new Vector3(-0.25, -0.25, -0.25),
    "#ffffff",
  );
  const cubeLabel = createLabel(
    "локальное начало / центр куба",
    new Vector3(0.8, -0.8, 0),
    "#cbb8ff",
  );
  transformedObjects.add(cubeLabel);
  const statusLabel = createLabel(
    "1: P = (3, 1, 0), cube O = (0, 0, 0)",
    new Vector3(2.2, 6.8, 0),
    "#ffffff",
  );

  const animatedMatrix = new Matrix4();
  const animatedRotation = new Quaternion();
  const animatedTranslation = new Vector3();
  let startedAtSeconds: number | undefined;
  const stopAnimation = registerFrameCallback((elapsedSeconds) => {
    startedAtSeconds ??= elapsedSeconds;
    const state = animationState(elapsedSeconds - startedAtSeconds);

    animatedRotation
      .copy(IDENTITY_QUATERNION)
      .slerp(ROTATED_QUATERNION, state.rotationProgress);
    animatedTranslation
      .copy(GLOBAL_TRANSLATION)
      .multiplyScalar(state.translationProgress);
    animatedMatrix.compose(
      animatedTranslation,
      animatedRotation,
      UNIT_SCALE,
    );
    transformedObjects.matrix.copy(animatedMatrix);
    transformedObjects.matrixWorldNeedsUpdate = true;

    translationArrow.visible = state.translationProgress > 0.01;
    statusLabel.element.textContent = state.title;
  });

  const demoObjects: Object3D[] = [
    axes,
    transformedObjects,
    translationArrow,
    ...axisLabels,
    originLabel,
    statusLabel,
  ];
  scene.add(...demoObjects);

  return () => {
    stopAnimation();
    scene.remove(...demoObjects);
    axes.dispose();
    disposeObject3D(transformedObjects);
    disposeObject3D(translationArrow);
    [...axisLabels, originLabel, statusLabel].forEach((label) =>
      label.element.remove(),
    );
    camera.position.copy(previousCameraPosition);
    controls.target.copy(previousControlsTarget);
    controls.update();
  };
}
