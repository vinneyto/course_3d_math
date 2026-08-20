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
  activeStep: number;
  title: string;
}

function animationState(elapsedSeconds: number): AnimationState {
  const phase = elapsedSeconds % CYCLE_DURATION_SECONDS;

  if (phase < PHASE_DURATION_SECONDS) {
    return {
      rotationProgress: 0,
      translationProgress: 0,
      activeStep: 0,
      title: "Сейчас: шаг 1 — исходное состояние",
    };
  }
  if (phase < PHASE_DURATION_SECONDS * 2) {
    return {
      rotationProgress: smoothStep(
        (phase - PHASE_DURATION_SECONDS) / PHASE_DURATION_SECONDS,
      ),
      translationProgress: 0,
      activeStep: 1,
      title: "Сейчас: шаг 2 — R · local",
    };
  }
  if (phase < PHASE_DURATION_SECONDS * 3) {
    return {
      rotationProgress: 1,
      translationProgress: 0,
      activeStep: 1,
      title: "Шаг 2 готов: rotated = R · local",
    };
  }
  if (phase < PHASE_DURATION_SECONDS * 4) {
    return {
      rotationProgress: 1,
      translationProgress: smoothStep(
        (phase - PHASE_DURATION_SECONDS * 3) / PHASE_DURATION_SECONDS,
      ),
      activeStep: 2,
      title: "Сейчас: шаг 3 — T · rotated",
    };
  }
  return {
    rotationProgress: 1,
    translationProgress: 1,
    activeStep: 2,
    title: "Шаг 3 готов: global = T · (R · local)",
  };
}

function createLegend(): { element: HTMLElement; steps: HTMLElement[] } {
  const element = document.createElement("aside");
  Object.assign(element.style, {
    position: "fixed",
    top: "50%",
    right: "1.25rem",
    width: "min(22rem, calc(100vw - 2.5rem))",
    padding: "1rem",
    border: "1px solid rgba(255, 255, 255, 0.24)",
    borderRadius: "0.75rem",
    background: "rgba(7, 11, 18, 0.88)",
    boxShadow: "0 0.5rem 2rem rgba(0, 0, 0, 0.42)",
    color: "white",
    fontFamily: "system-ui, sans-serif",
    transform: "translateY(-50%)",
    zIndex: "10",
    pointerEvents: "none",
  });

  const heading = document.createElement("div");
  heading.textContent = "Последовательность: M = T · R";
  Object.assign(heading.style, {
    marginBottom: "0.25rem",
    fontSize: "1rem",
    fontWeight: "800",
  });
  const hint = document.createElement("div");
  hint.textContent = "Читаем справа налево, начиная с local";
  Object.assign(hint.style, {
    marginBottom: "0.85rem",
    color: "#aebbd0",
    fontSize: "0.78rem",
  });
  element.append(heading, hint);

  const stepContents = [
    ["1. Локальные объекты", "P = (3, 1, 0); cube O = (0, 0, 0)"],
    ["2. Поворот R", "rotated = R · local; Rz = 90° = π / 2 rad"],
    ["3. Глобальная трансляция T", "global = T · rotated; T = (4, 2, 1)"],
  ];
  const steps = stepContents.map(([title, formula]) => {
    const step = document.createElement("div");
    Object.assign(step.style, {
      marginTop: "0.5rem",
      padding: "0.65rem 0.75rem",
      border: "1px solid rgba(255, 255, 255, 0.14)",
      borderRadius: "0.5rem",
      background: "rgba(255, 255, 255, 0.035)",
      transition: "background 180ms ease, border-color 180ms ease",
    });
    const stepTitle = document.createElement("div");
    stepTitle.textContent = title;
    stepTitle.style.fontWeight = "750";
    const stepFormula = document.createElement("div");
    stepFormula.textContent = formula;
    Object.assign(stepFormula.style, {
      marginTop: "0.25rem",
      color: "#c8d3e4",
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
      fontSize: "0.76rem",
      lineHeight: "1.35",
    });
    step.append(stepTitle, stepFormula);
    element.append(step);
    return step;
  });

  const result = document.createElement("div");
  result.textContent = "Итог: global = T · (R · local)";
  Object.assign(result.style, {
    marginTop: "0.85rem",
    color: "#ffe08a",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    fontSize: "0.82rem",
    fontWeight: "700",
  });
  element.append(result);
  document.body.append(element);

  return { element, steps };
}

function highlightLegendStep(steps: HTMLElement[], activeStep: number): void {
  steps.forEach((step, index) => {
    const active = index === activeStep;
    step.style.background = active
      ? "rgba(255, 209, 102, 0.16)"
      : "rgba(255, 255, 255, 0.035)";
    step.style.borderColor = active
      ? "rgba(255, 209, 102, 0.75)"
      : "rgba(255, 255, 255, 0.14)";
  });
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
    "Сейчас: шаг 1 — исходное состояние",
    new Vector3(2.2, 6.8, 0),
    "#ffffff",
  );
  const legend = createLegend();
  highlightLegendStep(legend.steps, 0);

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
    highlightLegendStep(legend.steps, state.activeStep);
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
    legend.element.remove();
    camera.position.copy(previousCameraPosition);
    controls.target.copy(previousControlsTarget);
    controls.update();
  };
}
