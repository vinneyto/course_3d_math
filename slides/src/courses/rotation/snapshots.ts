import { Vector3 } from "three";
import { eulerQuaternion, deg, type Triple } from "./math";
import { initialState, type RotationState } from "./state";

export type StepKind =
  "point" | "model" | "gimbal" | "interpolation" | "quaternion" | "object";
export interface RotationSnapshot {
  id: string;
  topic: number;
  kind: StepKind;
  scene: RotationState;
  caption?: { en: string; ru: string };
}
const model: Partial<RotationState> = {
  dimension: 3,
  local: true,
  mode: "model",
  panel: "basis",
  point: [-1, -1, -1],
  angles: [20, 25, 15],
  cameraPosition: [6, 4, 8],
  cameraTarget: [0, 0, 0],
};
const point3D: Partial<RotationState> = {
  dimension: 3,
  local: true,
  arc: true,
  origin: [3, 1, 0],
  point: [2, 1, 1],
  cameraPosition: [8, 6, 11],
  cameraTarget: [1, 1, 0],
};
function frame(
  id: string,
  topic: number,
  kind: StepKind,
  scene: Partial<RotationState>,
  en?: string,
  ru?: string,
): RotationSnapshot {
  const complete = {
    ...initialState,
    ...(kind === "point" ? {} : model),
    ...scene,
  };
  // Authored frames are immutable; viewer state is kept outside this data.
  for (const value of Object.values(complete))
    if (Array.isArray(value)) Object.freeze(value);
  Object.freeze(complete);
  return Object.freeze({
    id,
    topic,
    kind,
    scene: complete,
    caption: en && ru ? Object.freeze({ en, ru }) : undefined,
  });
}
const rotation = eulerQuaternion([30, 40, 25]);
const objectAxis = new Vector3(rotation.x, rotation.y, rotation.z)
  .normalize()
  .toArray() as Triple;
const objectAngle = deg(2 * Math.acos(rotation.w));

/** Every destination is authored in full; no replay or previous-frame patches. */
export const snapshots: readonly RotationSnapshot[] = Object.freeze([
  frame("point", 0, "point", {}),
  ...[0, 0.5, 1].map((t) =>
    frame(
      `translation-${t}`,
      1,
      "point",
      { translation: true, t },
      `Moving along a vector · ${Math.round(t * 100)}%`,
      `Смещение на вектор · ${Math.round(t * 100)}%`,
    ),
  ),
  ...[0, 15, 30, 45].map((z) =>
    frame(
      `local-z-${z}`,
      2,
      "point",
      { local: true, arc: true, angles: [0, 0, z] },
      `Turning the local frame · ${z}°`,
      `Поворот локальной системы · ${z}°`,
    ),
  ),
  ...[0.5, 1].map((t) =>
    frame(
      `origin-${t}`,
      3,
      "point",
      { local: true, arc: true, angles: [0, 0, 45], origin: [3 * t, t, 0] },
      `Moving the origin · O = (${3 * t}, ${t}, 0)`,
      `Смещаем начало · O = (${3 * t}, ${t}, 0)`,
    ),
  ),
  ...[0, 15, 30].map((x) =>
    frame(
      `basis-${x}`,
      4,
      "point",
      { ...point3D, panel: "basis", angles: [x, 0, 0] },
      `Origin and basis · Rx(${x}°)`,
      `Начало и базис · Rx(${x}°)`,
    ),
  ),
  ...[30, 60].map((x) =>
    frame(
      `matrix-${x}`,
      5,
      "point",
      { ...point3D, panel: "matrix", angles: [x, 0, 0] },
      `Matrix4 columns · Rx(${x}°)`,
      `Столбцы Matrix4 · Rx(${x}°)`,
    ),
  ),
  ...[0, 45, 90].map((z) =>
    frame(
      `compute-${z}`,
      6,
      "point",
      { ...point3D, panel: "compute", angles: [0, 0, z], point: [2, 1, 0] },
      `Computing the world position · ${z}°`,
      `Вычисляем мировую координату · ${z}°`,
    ),
  ),
  ...[0, 45, 90].map((x) =>
    frame(
      `zero-${x}`,
      7,
      "point",
      { ...point3D, zero: true, angles: [x, 0, 0] },
      `A point at the origin · Rx(${x}°)`,
      `Точка в начале системы · Rx(${x}°)`,
    ),
  ),
  ...[90, 135].map((x) =>
    frame(
      `axis-point-${x}`,
      7,
      "point",
      { ...point3D, zero: true, axisPoint: true, angles: [x, 0, 0] },
      `A point on X · Rx(${x}°)`,
      `Точка на X · Rx(${x}°)`,
    ),
  ),
  ...[40, 80].map((x) =>
    frame(`local-recap-${x}`, 8, "point", {
      ...point3D,
      panel: "basis",
      angles: [x, 0, 0],
    }),
  ),
  ...[0, 15, 30].map((z) =>
    frame(
      `cube-${z}`,
      9,
      "model",
      { mode: "cube", angles: [20, 25, z] },
      `Eight points, one frame · z = ${z}°`,
      `Восемь точек, одна система · z = ${z}°`,
    ),
  ),
  ...(["surface", "wireframe", "vertices", "surface"] as const).map(
    (surface, i) =>
      frame(
        `model-${i}`,
        10,
        "model",
        { surface, angles: [20, 25, 30] },
        `The same model · ${surface}`,
        `Та же модель · ${{ surface: "поверхность", wireframe: "каркас", vertices: "вершины" }[surface]}`,
      ),
  ),
  ...[0, 0.3, 0.6, 0].map((shear, i) =>
    frame(
      `conditions-${i}`,
      11,
      "model",
      { panel: "conditions", shear },
      `Rotation or deformation · Δ R[0,1] = ${shear}`,
      `Вращение или деформация · Δ R[0,1] = ${shear}`,
    ),
  ),
  ...(["X", "Y", "Z"] as const).flatMap((axis) =>
    [0, 30, 60].map((angle) => {
      const angles: Triple = [0, 0, 0];
      angles["XYZ".indexOf(axis)] = angle;
      return frame(
        `axis-${axis}-${angle}`,
        12,
        "model",
        { panel: "axis", angles, singleAxis: axis },
        `One axis · R${axis.toLowerCase()}(${angle}°)`,
        `Одна ось · R${axis.toLowerCase()}(${angle}°)`,
      );
    }),
  ),
  ...[0, 1 / 3, 2 / 3, 1].map((stage, i) =>
    frame(
      `euler-${i}`,
      13,
      "model",
      { panel: "euler", angles: [30, 40, 25], stage },
      `Euler composition · stage ${i}/3`,
      `Композиция Эйлера · этап ${i}/3`,
    ),
  ),
  frame("order", 14, "model", {
    panel: "order",
    angles: [30, 40, 25],
    cameraPosition: [4, 3, 13],
  }),
  ...[0, 0.25, 0.5, 0.75, 1].map((t) =>
    frame(
      `gimbal-90-${t}`,
      15,
      "gimbal",
      { panel: "gimbal", cameraPosition: [6, 4, 11], t, locked: true },
      `Gimbal lock · ${Math.round(t * 100)}%`,
      `Гимбал-лок · ${Math.round(t * 100)}%`,
    ),
  ),
  ...[0.5, 0.75, 1].map((t) =>
    frame(
      `gimbal-80-${t}`,
      15,
      "gimbal",
      { panel: "gimbal", cameraPosition: [6, 4, 11], t, locked: false },
      `Same angle changes, y = 80° · ${Math.round(t * 100)}%`,
      `Те же изменения углов, y = 80° · ${Math.round(t * 100)}%`,
    ),
  ),
  ...(
    [
      [0, 90, 0],
      [30, 90, 0],
      [30, 90, -30],
    ] as Triple[]
  ).map((angles, i) =>
    frame(
      `gimbal-independent-${i}`,
      15,
      "gimbal",
      {
        panel: "gimbal",
        cameraPosition: [6, 4, 11],
        t: i / 2,
        gimbalManual: true,
        angles,
      },
      [
        "Coinciding axes still rotate",
        "Change x alone: the model turns",
        "Change z: the orientation returns",
      ][i],
      [
        "Совпавшие оси всё ещё вращают",
        "Меняем только x: модель вращается",
        "Меняем z: ориентация возвращается",
      ][i],
    ),
  ),
  ...[0, 0.25, 0.5, 0.75, 1].map((t) =>
    frame(
      `boundary-${t}`,
      16,
      "interpolation",
      { panel: "interpolation", cameraPosition: [3, 2, 13], t },
      `The angle boundary · ${Math.round(t * 100)}%`,
      `Граница угла · ${Math.round(t * 100)}%`,
    ),
  ),
  ...[0, 30, 75].map((angle) =>
    frame(
      `quaternion-${angle}`,
      17,
      "quaternion",
      { panel: "quaternion", axis: [1, 1, 0], angle },
      `Axis–angle → quaternion · ${angle}°`,
      `Ось–угол → кватернион · ${angle}°`,
    ),
  ),
  ...[75, 90].map((angle) =>
    frame(
      `q-matrix-${angle}`,
      18,
      "quaternion",
      { panel: "q-matrix", axis: [1, 1, 0], angle },
      `Quaternion → matrix · ${angle}°`,
      `Кватернион → матрица · ${angle}°`,
    ),
  ),
  ...[false, true].flatMap((compound) =>
    [0, 0.25, 0.5, 0.75, 1].map((t) =>
      frame(
        `slerp-${compound ? "compound" : "axis"}-${t}`,
        19,
        "interpolation",
        { panel: "interpolation", cameraPosition: [3, 2, 13], compound, t },
        `${compound ? "Compound" : "Single-axis"} SLERP · ${Math.round(t * 100)}%`,
        `${compound ? "Составной" : "Одноосевой"} SLERP · ${Math.round(t * 100)}%`,
      ),
    ),
  ),
  frame(
    "object-euler",
    20,
    "object",
    { panel: "object", angles: [30, 40, 25] },
    "Object3D · Euler input",
    "Object3D · ввод через Euler",
  ),
  frame(
    "object-quaternion",
    20,
    "object",
    {
      panel: "object",
      angles: [30, 40, 25],
      input: "quaternion",
      axis: objectAxis,
      angle: objectAngle,
    },
    "Object3D · the same quaternion",
    "Object3D · тот же кватернион",
  ),
  frame(
    "object-parent",
    20,
    "object",
    {
      panel: "object",
      angles: [30, 40, 25],
      input: "quaternion",
      axis: objectAxis,
      angle: objectAngle,
      parent: true,
    },
    "Object3D · a rotated parent",
    "Object3D · повёрнутый родитель",
  ),
  frame("summary", 21, "object", { panel: "summary", angles: [30, 40, 25] }),
]);
