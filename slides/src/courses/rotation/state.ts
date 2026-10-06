import type { EulerOrder, Quaternion } from "three";
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
export function orientation(s: RotationState): Quaternion {
  if (s.panel === "gimbal")
    return eulerQuaternion(
      s.gimbalManual ? s.angles : gimbalAngles(s.t, s.locked),
    );
  if (s.panel === "interpolation") return interpolation(s.t, s.compound).slerp;
  if (s.panel === "quaternion" || s.panel === "q-matrix")
    return axisQuaternion(s.axis, s.angle);
  if (s.panel === "object" && s.input === "quaternion") {
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
