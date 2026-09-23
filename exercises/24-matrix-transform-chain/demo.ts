import {
  AxesHelper,
  BoxGeometry,
  Group,
  Matrix4,
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

const LOCAL_POINT = new Vector3(2, 1, 1);
const TRANSLATION_1 = new Vector3(3, 0, 0);
const SCALE = new Vector3(1.5, 0.75, 1);
const TRANSLATION_2 = new Vector3(-1, 2, 4);
const ROTATION_1_RADIANS = Math.PI / 2;
const ROTATION_2_RADIANS = Math.PI / 2;
const PHASE_DURATION_SECONDS = 3;
const OPERATION_COUNT = 5;
const CYCLE_PHASE_COUNT = OPERATION_COUNT + 2;
const CYCLE_DURATION_SECONDS = PHASE_DURATION_SECONDS * CYCLE_PHASE_COUNT;

const OPERATION_TITLES = [
  "1. R1: rotation Z +90°",
  "2. T1: translation (3, 0, 0)",
  "3. R2: rotation Y +90°",
  "4. S: scale (1.5, 0.75, 1)",
  "5. T2: translation (-1, 2, 4)",
];

const POINT_RESULTS = [
  "P0 = (2, 1, 1)",
  "P1 = (-1, 2, 1)",
  "P2 = (2, 2, 1)",
  "P3 = (1, 2, -2)",
  "P4 = (1.5, 1.5, -2)",
  "P5 = (0.5, 3.5, 2)",
];

function smoothStep(value: number): number {
  return value * value * (3 - 2 * value);
}

interface AnimationState {
  progresses: number[];
  activeOperation: number | undefined;
  title: string;
}

function animationState(elapsedSeconds: number): AnimationState {
  const phase = elapsedSeconds % CYCLE_DURATION_SECONDS;
  const phaseIndex = Math.floor(phase / PHASE_DURATION_SECONDS);

  if (phaseIndex === 0) {
    return {
      progresses: [0, 0, 0, 0, 0],
      activeOperation: undefined,
      title: "Initial state: P0 = (2, 1, 1)",
    };
  }

  if (phaseIndex <= OPERATION_COUNT) {
    const activeOperation = phaseIndex - 1;
    const progress = smoothStep(
      (phase - phaseIndex * PHASE_DURATION_SECONDS) /
        PHASE_DURATION_SECONDS,
    );
    return {
      progresses: Array.from({ length: OPERATION_COUNT }, (_, index) => {
        if (index < activeOperation) return 1;
        if (index === activeOperation) return progress;
        return 0;
      }),
      activeOperation,
      title: `Now: ${OPERATION_TITLES[activeOperation]}`,
    };
  }

  return {
    progresses: [1, 1, 1, 1, 1],
    activeOperation: undefined,
    title: "Complete: P5 = (0.5, 3.5, 2)",
  };
}

function createLegend(): {
  element: HTMLElement;
  actionSteps: HTMLElement[];
  multiplySteps: HTMLElement[];
} {
  const element = document.createElement("aside");
  Object.assign(element.style, {
    position: "fixed",
    top: "50%",
    right: "1rem",
    width: "min(27rem, calc(100vw - 2rem))",
    padding: "0.9rem",
    border: "1px solid rgba(255, 255, 255, 0.24)",
    borderRadius: "0.75rem",
    background: "rgba(7, 11, 18, 0.9)",
    boxShadow: "0 0.5rem 2rem rgba(0, 0, 0, 0.42)",
    color: "white",
    fontFamily: "system-ui, sans-serif",
    transform: "translateY(-50%)",
    zIndex: "10",
    pointerEvents: "none",
  });

  const heading = document.createElement("div");
  heading.textContent = "M = T2 · S · R2 · T1 · R1";
  Object.assign(heading.style, {
    marginBottom: "0.2rem",
    color: "#ffe08a",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    fontSize: "0.95rem",
    fontWeight: "800",
  });
  const hint = document.createElement("div");
  hint.textContent = "Read operations from right to left";
  Object.assign(hint.style, {
    marginBottom: "0.7rem",
    color: "#aebbd0",
    fontSize: "0.76rem",
  });
  element.append(heading, hint);

  const columns = document.createElement("div");
  Object.assign(columns.style, {
    display: "grid",
    gridTemplateColumns: "1fr 0.9fr",
    gap: "0.65rem",
  });
  const actionsColumn = document.createElement("div");
  const multiplyColumn = document.createElement("div");
  const actionsTitle = document.createElement("div");
  actionsTitle.textContent = "Operations on the point";
  const multiplyTitle = document.createElement("div");
  multiplyTitle.textContent = "Code from top to bottom";
  [actionsTitle, multiplyTitle].forEach((title) => {
    Object.assign(title.style, {
      marginBottom: "0.35rem",
      fontSize: "0.76rem",
      fontWeight: "800",
    });
  });
  actionsColumn.append(actionsTitle);
  multiplyColumn.append(multiplyTitle);

  const actionSteps = OPERATION_TITLES.map((title, index) => {
    const step = document.createElement("div");
    Object.assign(step.style, {
      marginTop: "0.3rem",
      padding: "0.38rem 0.45rem",
      border: "1px solid rgba(255, 255, 255, 0.12)",
      borderRadius: "0.4rem",
      background: "rgba(255, 255, 255, 0.03)",
      fontSize: "0.7rem",
      lineHeight: "1.25",
    });
    const operation = document.createElement("div");
    operation.textContent = title;
    operation.style.fontWeight = "700";
    const result = document.createElement("div");
    result.textContent = POINT_RESULTS[index + 1];
    Object.assign(result.style, {
      marginTop: "0.16rem",
      color: "#c8d3e4",
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    });
    step.append(operation, result);
    actionsColumn.append(step);
    return step;
  });

  const multiplyLabels = [".multiply(T2)", ".multiply(S)", ".multiply(R2)", ".multiply(T1)", ".multiply(R1)"];
  const multiplyOperationIndices = [4, 3, 2, 1, 0];
  const multiplySteps = multiplyLabels.map((label, index) => {
    const step = document.createElement("div");
    step.dataset.operation = String(multiplyOperationIndices[index]);
    step.textContent = label;
    Object.assign(step.style, {
      marginTop: "0.3rem",
      padding: "0.38rem 0.45rem",
      border: "1px solid rgba(255, 255, 255, 0.12)",
      borderRadius: "0.4rem",
      background: "rgba(255, 255, 255, 0.03)",
      color: "#c8d3e4",
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
      fontSize: "0.7rem",
      lineHeight: "1.25",
    });
    multiplyColumn.append(step);
    return step;
  });

  columns.append(actionsColumn, multiplyColumn);
  element.append(columns);
  document.body.append(element);
  return { element, actionSteps, multiplySteps };
}

function setStepActive(step: HTMLElement, active: boolean): void {
  step.style.background = active
    ? "rgba(255, 209, 102, 0.16)"
    : "rgba(255, 255, 255, 0.03)";
  step.style.borderColor = active
    ? "rgba(255, 209, 102, 0.75)"
    : "rgba(255, 255, 255, 0.12)";
}

function highlightOperation(
  actionSteps: HTMLElement[],
  multiplySteps: HTMLElement[],
  activeOperation: number | undefined,
): void {
  actionSteps.forEach((step, index) =>
    setStepActive(step, index === activeOperation),
  );
  multiplySteps.forEach((step) =>
    setStepActive(
      step,
      Number(step.dataset.operation) === activeOperation,
    ),
  );
}

function createBasisArrow(vector: Vector3, color: number, label: string): Group {
  const arrow = createVectorArrow(vector, {
    color,
    shaftRadius: 0.05,
    headLength: 0.32,
    headRadius: 0.15,
  });
  arrow.add(
    createLabel(
      label,
      new Vector3(0, vector.length() + 0.22, 0),
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
  camera.position.set(11, 8, 14);
  controls.target.set(1, 1.5, 0);
  controls.update();

  const axes = new AxesHelper(8);
  const transformedObjects = new Group();
  transformedObjects.matrixAutoUpdate = false;

  const cube = new Mesh(
    new BoxGeometry(1.3, 1.3, 1.3, 2, 2, 2),
    new MeshStandardMaterial({
      color: 0x7e57c2,
      metalness: 0.08,
      roughness: 0.3,
    }),
  );
  const cornerMarker = new Mesh(
    new SphereGeometry(0.12, 24, 16),
    new MeshStandardMaterial({ color: 0xffd166, roughness: 0.25 }),
  );
  cornerMarker.position.set(0.65, 0.65, 0.65);
  cube.add(cornerMarker);

  const point = new Mesh(
    new SphereGeometry(0.19, 32, 24),
    new MeshStandardMaterial({ color: 0xf062c0, roughness: 0.25 }),
  );
  point.position.copy(LOCAL_POINT);
  const pointLabel = createLabel(
    POINT_RESULTS[0],
    new Vector3(0.24, 0.24, 0),
    "#fa84d3",
  );
  point.add(pointLabel);

  const localBasis = new Group();
  localBasis.add(
    createBasisArrow(new Vector3(1.6, 0, 0), 0xff5b5b, "local X"),
    createBasisArrow(new Vector3(0, 1.6, 0), 0x68e06f, "local Y"),
    createBasisArrow(new Vector3(0, 0, 1.6), 0x5b8cff, "local Z"),
  );
  transformedObjects.add(cube, point, localBasis);

  const axisLabels = [
    createLabel("X", new Vector3(8.3, 0, 0), "#ff5b5b", "axis-label"),
    createLabel("Y", new Vector3(0, 8.3, 0), "#68e06f", "axis-label"),
    createLabel("Z", new Vector3(0, 0, 8.3), "#5b8cff", "axis-label"),
  ];
  const originLabel = createLabel(
    "global O = (0, 0, 0)",
    new Vector3(-0.25, -0.25, -0.25),
    "#ffffff",
  );
  const statusLabel = createLabel(
    "Initial state: P0 = (2, 1, 1)",
    new Vector3(1.5, 6.6, 0),
    "#ffffff",
  );
  const legend = createLegend();

  const rotation1 = new Matrix4();
  const translation1 = new Matrix4();
  const rotation2 = new Matrix4();
  const scale = new Matrix4();
  const translation2 = new Matrix4();
  const animatedMatrix = new Matrix4();
  const animatedPoint = new Vector3();
  let startedAtSeconds: number | undefined;
  const stopAnimation = registerFrameCallback((elapsedSeconds) => {
    startedAtSeconds ??= elapsedSeconds;
    const state = animationState(elapsedSeconds - startedAtSeconds);
    const [r1Progress, t1Progress, r2Progress, scaleProgress, t2Progress] =
      state.progresses;

    rotation1.makeRotationZ(ROTATION_1_RADIANS * r1Progress);
    translation1.makeTranslation(
      TRANSLATION_1.x * t1Progress,
      TRANSLATION_1.y * t1Progress,
      TRANSLATION_1.z * t1Progress,
    );
    rotation2.makeRotationY(ROTATION_2_RADIANS * r2Progress);
    scale.makeScale(
      1 + (SCALE.x - 1) * scaleProgress,
      1 + (SCALE.y - 1) * scaleProgress,
      1 + (SCALE.z - 1) * scaleProgress,
    );
    translation2.makeTranslation(
      TRANSLATION_2.x * t2Progress,
      TRANSLATION_2.y * t2Progress,
      TRANSLATION_2.z * t2Progress,
    );

    animatedMatrix
      .identity()
      .multiply(translation2)
      .multiply(scale)
      .multiply(rotation2)
      .multiply(translation1)
      .multiply(rotation1);
    transformedObjects.matrix.copy(animatedMatrix);
    transformedObjects.matrixWorldNeedsUpdate = true;

    animatedPoint.copy(LOCAL_POINT).applyMatrix4(animatedMatrix);
    pointLabel.element.textContent =
      `P ≈ (${animatedPoint.x.toFixed(2)}, ` +
      `${animatedPoint.y.toFixed(2)}, ${animatedPoint.z.toFixed(2)})`;
    statusLabel.element.textContent = state.title;
    highlightOperation(
      legend.actionSteps,
      legend.multiplySteps,
      state.activeOperation,
    );
  });

  const demoObjects: Object3D[] = [
    axes,
    transformedObjects,
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
    [...axisLabels, originLabel, statusLabel].forEach((label) =>
      label.element.remove(),
    );
    legend.element.remove();
    camera.position.copy(previousCameraPosition);
    controls.target.copy(previousControlsTarget);
    controls.update();
  };
}
