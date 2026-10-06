import type { EulerOrder, Quaternion } from "three";
import { Presentation, reversibleSlide } from "../../platform/presentation";
import {
  axisQuaternion,
  eulerQuaternion,
  gimbalAngles,
  interpolation,
  type Triple,
} from "./math";

export type Mode = "point" | "cube" | "model";
export type Panel =
  | "coordinates"
  | "basis"
  | "matrix"
  | "compute"
  | "conditions"
  | "axis"
  | "euler"
  | "order"
  | "gimbal"
  | "interpolation"
  | "quaternion"
  | "q-matrix"
  | "object"
  | "summary";
export interface RotationState {
  mode: Mode;
  panel: Panel;
  dimension: 2 | 3;
  origin: Triple;
  point: Triple;
  angles: Triple;
  axis: Triple;
  angle: number;
  order: EulerOrder;
  t: number;
  local: boolean;
  arc: boolean;
  translation: boolean;
  zero: boolean;
  axisPoint: boolean;
  shear: number;
  locked: boolean;
  compound: boolean;
  surface: "surface" | "wireframe" | "vertices";
  input: "euler" | "quaternion";
  stage: number;
  parent: boolean;
  gimbalManual: boolean;
  singleAxis: "X" | "Y" | "Z";
  cameraPosition: Triple;
  cameraTarget: Triple;
}
export const initialState: RotationState = {
  mode: "point",
  panel: "coordinates",
  dimension: 2,
  origin: [0, 0, 0],
  point: [2, 1, 0],
  angles: [0, 0, 0],
  axis: [0, 1, 0],
  angle: 60,
  order: "XYZ",
  t: 0,
  local: false,
  arc: false,
  translation: false,
  zero: false,
  axisPoint: false,
  shear: 0,
  locked: true,
  compound: false,
  surface: "surface",
  input: "euler",
  stage: 1,
  parent: false,
  gimbalManual: false,
  singleAxis: "X",
  cameraPosition: [1, 1, 12],
  cameraTarget: [1, 1, 0],
};
const patches: Partial<RotationState>[] = [
  {},
  { translation: true, t: 0 },
  {
    translation: false,
    local: true,
    arc: true,
    point: [2, 1, 0],
    angles: [0, 0, 45],
    t: 0,
  },
  { origin: [3, 1, 0] },
  {
    dimension: 3,
    panel: "basis",
    angles: [30, 0, 0],
    point: [2, 1, 1],
    cameraPosition: [8, 6, 11],
    cameraTarget: [1, 1, 0],
  },
  { panel: "matrix" },
  { panel: "compute", origin: [3, 1, 0], angles: [0, 0, 90], point: [2, 1, 0] },
  { zero: true, panel: "coordinates", angles: [45, 0, 0] },
  { zero: false, panel: "basis", angles: [40, 0, 0], point: [2, 1, 1] },
  {
    mode: "cube",
    origin: [0, 0, 0],
    point: [-1, -1, -1],
    angles: [20, 25, 15],
    arc: false,
    cameraPosition: [6, 4, 8],
    cameraTarget: [0, 0, 0],
  },
  { mode: "model", surface: "surface" },
  { panel: "conditions", shear: 0 },
  { panel: "axis", angles: [35, 0, 0], shear: 0, singleAxis: "X" },
  { panel: "euler", angles: [30, 40, 25], stage: 1 },
  {
    panel: "order",
    order: "XYZ",
    cameraPosition: [4, 3, 13],
    cameraTarget: [0, 0, 0],
  },
  {
    panel: "gimbal",
    t: 0,
    locked: true,
    gimbalManual: false,
    cameraPosition: [6, 4, 11],
  },
  { panel: "interpolation", t: 0, compound: false, cameraPosition: [3, 2, 13] },
  {
    panel: "quaternion",
    axis: [1, 1, 0],
    angle: 75,
    cameraPosition: [6, 4, 8],
  },
  { panel: "q-matrix" },
  { panel: "interpolation", t: 0, compound: false, cameraPosition: [3, 2, 13] },
  {
    panel: "object",
    angles: [30, 40, 25],
    input: "euler",
    cameraPosition: [6, 4, 8],
  },
  { panel: "summary", input: "euler" },
];
export function createRotationPresentation(): Presentation<RotationState> {
  return new Presentation(
    patches.map((patch, i) =>
      reversibleSlide(`rotation-${i + 1}`, { ...patch, t: patch.t ?? 0 }),
    ),
    initialState,
  );
}
export function orientation(s: RotationState): Quaternion {
  if (s.panel === "gimbal")
    return eulerQuaternion(
      s.gimbalManual ? s.angles : gimbalAngles(s.t, s.locked),
    );
  if (s.panel === "interpolation") return interpolation(s.t, s.compound).slerp;
  if (s.panel === "quaternion" || s.panel === "q-matrix")
    return axisQuaternion(s.axis, s.angle);
  if (s.panel === "object" && s.input === "quaternion") {
    // setFromEuler is used by the controls; reconstruct without mutation.
    return axisQuaternion(s.axis, s.angle);
  }
  if (s.panel === "euler") {
    const angles = [...s.angles] as Triple;
    for (let i = 0; i < 3; i++)
      angles[s.order[i] === "X" ? 0 : s.order[i] === "Y" ? 1 : 2] *= Math.max(
        0,
        Math.min(1, s.stage * 3 - i),
      );
    return eulerQuaternion(angles, s.order);
  }
  return eulerQuaternion(s.angles, s.order);
}
