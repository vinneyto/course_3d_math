import {
  AxesHelper,
  BufferGeometry,
  Line,
  LineDashedMaterial,
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

const HOMOGENEOUS_XYZ = new Vector3(2, 1, 0);
const DIRECTION = HOMOGENEOUS_XYZ.clone().normalize();
const PHASE_DURATION_SECONDS = 3;
const CYCLE_DURATION_SECONDS = PHASE_DURATION_SECONDS * 2;
const MAX_VISUAL_DISTANCE = 9.5;
const MIN_VISUAL_W = 0.02;

function smoothStep(value: number): number {
  return value * value * (3 - 2 * value);
}

function animatedW(elapsedSeconds: number): number {
  const phase = elapsedSeconds % CYCLE_DURATION_SECONDS;

  if (phase < PHASE_DURATION_SECONDS) {
    return 1 - smoothStep(phase / PHASE_DURATION_SECONDS);
  }
  return smoothStep(
    (phase - PHASE_DURATION_SECONDS) / PHASE_DURATION_SECONDS,
  );
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function mountDemo({
  scene,
  camera,
  controls,
  registerFrameCallback,
}: DemoContext): () => void {
  const previousCameraPosition = camera.position.clone();
  const previousControlsTarget = controls.target.clone();
  camera.position.set(12, 8, 14);
  controls.target.set(4.2, 2.1, 0);
  controls.update();

  const axes = new AxesHelper(10.5);
  const pointMaterial = new MeshStandardMaterial({
    color: 0xf062c0,
    roughness: 0.28,
    transparent: true,
  });
  const cartesianPoint = new Mesh(
    new SphereGeometry(0.2, 32, 24),
    pointMaterial,
  );
  const pointLabel = createLabel("декартова точка", new Vector3(0.2, 0.2, 0), "#fa84d3");
  cartesianPoint.add(pointLabel);

  const directionArrow = createVectorArrow(
    DIRECTION.clone().multiplyScalar(4.2),
    {
      color: 0xffd166,
      shaftRadius: 0.08,
      headLength: 0.55,
      headRadius: 0.25,
    },
  );
  directionArrow.add(
    createLabel(
      "(2, 1, 0, 0) — направление",
      new Vector3(0, 4.5, 0),
      "#ffe08a",
    ),
  );
  const directionMaterials = new Set<MeshStandardMaterial>();
  directionArrow.traverse((object) => {
    if (object instanceof Mesh && object.material instanceof MeshStandardMaterial) {
      object.material.transparent = true;
      object.material.depthWrite = false;
      directionMaterials.add(object.material);
    }
  });

  const ray = new Line(
    new BufferGeometry().setFromPoints([
      new Vector3(),
      DIRECTION.clone().multiplyScalar(MAX_VISUAL_DISTANCE),
    ]),
    new LineDashedMaterial({
      color: 0xffd166,
      dashSize: 0.22,
      gapSize: 0.14,
      opacity: 0.5,
      transparent: true,
    }),
  );
  ray.computeLineDistances();

  const axisLabels = [
    createLabel("X", new Vector3(10.8, 0, 0), "#ff5b5b", "axis-label"),
    createLabel("Y", new Vector3(0, 10.8, 0), "#68e06f", "axis-label"),
    createLabel("Z", new Vector3(0, 0, 10.8), "#5b8cff", "axis-label"),
  ];
  const originLabel = createLabel(
    "O = (0, 0, 0)",
    new Vector3(-0.2, -0.2, -0.2),
    "#ffffff",
  );
  const statusLabel = createLabel(
    "H = (2, 1, 0, 1) → P = (2, 1, 0)",
    new Vector3(2.4, 6.5, 0),
    "#ffffff",
  );

  let startedAtSeconds: number | undefined;
  const stopAnimation = registerFrameCallback((elapsedSeconds) => {
    startedAtSeconds ??= elapsedSeconds;
    const w = animatedW(elapsedSeconds - startedAtSeconds);
    const visualW = Math.max(w, MIN_VISUAL_W);
    const cartesianPosition = HOMOGENEOUS_XYZ.clone().divideScalar(visualW);
    if (cartesianPosition.length() > MAX_VISUAL_DISTANCE) {
      cartesianPosition.setLength(MAX_VISUAL_DISTANCE);
    }
    cartesianPoint.position.copy(cartesianPosition);

    const pointOpacity = smoothStep(clamp01(w / 0.15));
    pointMaterial.opacity = pointOpacity;
    pointLabel.element.style.opacity = pointOpacity.toFixed(3);
    cartesianPoint.visible = pointOpacity > 0.01;

    const directionOpacity = 1 - smoothStep(clamp01(w / 0.2));
    directionMaterials.forEach((material) => {
      material.opacity = directionOpacity;
    });
    directionArrow.visible = directionOpacity > 0.01;

    if (w < MIN_VISUAL_W) {
      statusLabel.element.textContent =
        "H = (2, 1, 0, 0) → точка на бесконечности → направление";
    } else {
      statusLabel.element.textContent =
        `H = (2, 1, 0, ${w.toFixed(2)}) → ` +
        `P = (${(2 / w).toFixed(1)}, ${(1 / w).toFixed(1)}, 0)`;
    }
  });

  const demoObjects: Object3D[] = [
    axes,
    ray,
    cartesianPoint,
    directionArrow,
    ...axisLabels,
    originLabel,
    statusLabel,
  ];
  scene.add(...demoObjects);

  return () => {
    stopAnimation();
    scene.remove(...demoObjects);
    axes.dispose();
    disposeObject3D(ray);
    disposeObject3D(cartesianPoint);
    disposeObject3D(directionArrow);
    [...axisLabels, originLabel, statusLabel].forEach((label) =>
      label.element.remove(),
    );
    camera.position.copy(previousCameraPosition);
    controls.target.copy(previousControlsTarget);
    controls.update();
  };
}
