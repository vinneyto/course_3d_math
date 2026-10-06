import { stageDefinitions } from "./stages";
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
  operation?: string;
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
  });
}
const rotation = eulerQuaternion([30, 40, 25]);
const objectAxis = new Vector3(rotation.x, rotation.y, rotation.z)
  .normalize()
  .toArray() as Triple;
const objectAngle = deg(2 * Math.acos(rotation.w));

/** Every destination is authored in full; no replay or previous-frame patches. */
const authored: readonly RotationSnapshot[] = [
  frame("point", 0, "point", {}),
  ...[0, 0.5, 1].map((t) =>
    frame(`translation-${t}`, 1, "point", { translation: true, t }),
  ),
  ...[0, 15, 30, 45].map((z) =>
    frame(`local-z-${z}`, 2, "point", {
      local: true,
      arc: true,
      angles: [0, 0, z],
    }),
  ),
  ...[0.5, 1].map((t) =>
    frame(`origin-${t}`, 3, "point", {
      local: true,
      arc: true,
      angles: [0, 0, 45],
      origin: [3 * t, t, 0],
    }),
  ),
  ...[0, 15, 30].map((x) =>
    frame(`basis-${x}`, 4, "point", {
      ...point3D,
      panel: "basis",
      angles: [x, 0, 0],
    }),
  ),
  ...[30, 60].map((x) =>
    frame(`matrix-${x}`, 5, "point", {
      ...point3D,
      panel: "matrix",
      angles: [x, 0, 0],
    }),
  ),
  ...[0, 45, 90].map((z) =>
    frame(`compute-${z}`, 6, "point", {
      ...point3D,
      panel: "compute",
      angles: [0, 0, z],
      point: [2, 1, 0],
    }),
  ),
  ...[0, 45, 90].map((x) =>
    frame(`zero-${x}`, 7, "point", {
      ...point3D,
      zero: true,
      angles: [x, 0, 0],
    }),
  ),
  ...[90, 135].map((x) =>
    frame(`axis-point-${x}`, 7, "point", {
      ...point3D,
      zero: true,
      axisPoint: true,
      angles: [x, 0, 0],
    }),
  ),
  ...[40, 80].map((x) =>
    frame(`local-recap-${x}`, 8, "point", {
      ...point3D,
      panel: "basis",
      angles: [x, 0, 0],
    }),
  ),
  ...[0, 15, 30].map((z) =>
    frame(`cube-${z}`, 9, "model", { mode: "cube", angles: [20, 25, z] }),
  ),
  ...(["surface", "wireframe", "vertices", "surface"] as const).map(
    (surface, i) =>
      frame(`model-${i}`, 10, "model", { surface, angles: [20, 25, 30] }),
  ),
  ...[0, 0.3, 0.6, 0].map((shear, i) =>
    frame(`conditions-${i}`, 11, "model", { panel: "conditions", shear }),
  ),
  ...(["X", "Y", "Z"] as const).flatMap((axis) =>
    [0, 30, 60].map((angle) => {
      const angles: Triple = [0, 0, 0];
      angles["XYZ".indexOf(axis)] = angle;
      return frame(`axis-${axis}-${angle}`, 12, "model", {
        panel: "axis",
        angles,
        singleAxis: axis,
      });
    }),
  ),
  ...[0, 1 / 3, 2 / 3, 1].map((stage, i) =>
    frame(`euler-${i}`, 13, "model", {
      panel: "euler",
      angles: [30, 40, 25],
      stage,
    }),
  ),
  frame("order", 14, "model", {
    panel: "order",
    angles: [30, 40, 25],
    cameraPosition: [4, 3, 13],
  }),
  ...[0, 0.25, 0.5, 0.75, 1].map((t) =>
    frame(`gimbal-90-${t}`, 15, "gimbal", {
      panel: "gimbal",
      cameraPosition: [6, 4, 11],
      t,
      locked: true,
    }),
  ),
  ...[0.5, 0.75, 1].map((t) =>
    frame(`gimbal-80-${t}`, 15, "gimbal", {
      panel: "gimbal",
      cameraPosition: [6, 4, 11],
      t,
      locked: false,
    }),
  ),
  ...(
    [
      [0, 90, 0],
      [30, 90, 0],
      [30, 90, -30],
    ] as Triple[]
  ).map((angles, i) =>
    frame(`gimbal-independent-${i}`, 15, "gimbal", {
      panel: "gimbal",
      cameraPosition: [6, 4, 11],
      t: i / 2,
      gimbalManual: true,
      angles,
    }),
  ),
  ...[0, 0.25, 0.5, 0.75, 1].map((t) =>
    frame(`boundary-${t}`, 16, "interpolation", {
      panel: "interpolation",
      cameraPosition: [3, 2, 13],
      t,
    }),
  ),
  ...[0, 30, 75].map((angle) =>
    frame(`quaternion-${angle}`, 17, "quaternion", {
      panel: "quaternion",
      axis: [1, 1, 0],
      angle,
    }),
  ),
  ...[75, 90].map((angle) =>
    frame(`q-matrix-${angle}`, 18, "quaternion", {
      panel: "q-matrix",
      axis: [1, 1, 0],
      angle,
    }),
  ),
  ...[false, true].flatMap((compound) =>
    [0, 0.25, 0.5, 0.75, 1].map((t) =>
      frame(
        `slerp-${compound ? "compound" : "axis"}-${t}`,
        19,
        "interpolation",
        { panel: "interpolation", cameraPosition: [3, 2, 13], compound, t },
      ),
    ),
  ),
  frame("object-euler", 20, "object", {
    panel: "object",
    angles: [30, 40, 25],
  }),
  frame("object-quaternion", 20, "object", {
    panel: "object",
    angles: [30, 40, 25],
    input: "quaternion",
    axis: objectAxis,
    angle: objectAngle,
  }),
  frame("object-parent", 20, "object", {
    panel: "object",
    angles: [30, 40, 25],
    input: "quaternion",
    axis: objectAxis,
    angle: objectAngle,
    parent: true,
  }),
  frame("summary", 21, "object", { panel: "summary", angles: [30, 40, 25] }),
];
export const snapshots: readonly RotationSnapshot[] = Object.freeze(
  authored.map((snapshot, index) => {
    const group = authored.filter((step) => step.topic === snapshot.topic);
    if (group.length === 1) return snapshot;
    const position = group.findIndex((step) => step.id === snapshot.id);
    const stage = stageDefinitions[snapshot.topic]?.[position];
    if (!stage) throw new Error(`Missing stage for ${snapshot.id}`);
    return Object.freeze({
      ...snapshot,
      caption: Object.freeze(stage.name),
      operation: stage.operation,
      scene: Object.freeze({
        ...snapshot.scene,
        timeline: Object.freeze({
          group: snapshot.topic,
          position: position / (group.length - 1),
        }),
      }),
    });
  }),
);

export function sequenceFor(index: number) {
  const step = snapshots[index];
  return snapshots.filter((snapshot) => snapshot.topic === step.topic);
}
