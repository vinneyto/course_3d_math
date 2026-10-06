import { Euler, Quaternion, type EulerOrder } from "three";
import {
  axisQuaternion,
  eulerQuaternion,
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
  timeline?: { group: number; position: number };
  visual?: import("./transition").SceneVisual;
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
  compound: boolean;
  surface: "surface" | "wireframe" | "vertices";
  input: "euler" | "quaternion";
  stage: number;
  parent: boolean;
  gimbalView: import("./gimbal-story").GimbalView;
  singleAxis: "X" | "Y" | "Z";
  cameraPosition: Triple;
  cameraTarget: Triple;
}
/** Match angle indicators and sectors to the displayed orientation. */
export function displayedEulerAngles(s: RotationState): Triple {
  if (s.panel === "gimbal") return s.visual?.gimbalAngles ?? s.angles;
  if (s.visual)
    return new Euler()
      .setFromQuaternion(orientation(s), s.order)
      .toArray()
      .slice(0, 3)
      .map((n) => (Number(n) * 180) / Math.PI) as Triple;
  if (s.panel === "euler") {
    const angles = [...s.angles] as Triple;
    for (let i = 0; i < 3; i++)
      angles["XYZ".indexOf(s.order[i])] *= Math.max(
        0,
        Math.min(1, s.stage * 3 - i),
      );
    return angles;
  }
  return s.angles;
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
  compound: false,
  surface: "surface",
  input: "euler",
  stage: 1,
  parent: false,
  gimbalView: "turn-y",
  singleAxis: "X",
  cameraPosition: [1, 1, 12],
  cameraTarget: [1, 1, 0],
};
export function orientation(s: RotationState): Quaternion {
  if (s.visual) return new Quaternion(...s.visual.quaternion);
  if (s.panel === "gimbal") return eulerQuaternion(s.angles, s.order);
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
