import { Quaternion, Vector3 } from "three";
import { orientation, type RotationState } from "./state";
import { eulerQuaternion, interpolation, type Triple } from "./math";

export const transitionDuration = 1100;
export type Visibility = ReturnType<typeof visibility>;
export interface SceneVisual {
  quaternion: [number, number, number, number];
  modelQuaternion: [number, number, number, number];
  comparisonQuaternion: [number, number, number, number];
  worldPoint: Triple;
  visibility: Visibility;
}

export function visibility(s: RotationState) {
  const comparison = s.panel === "order" || s.panel === "interpolation";
  const model = s.mode !== "point";
  return {
    point: Number(!model),
    cube: Number(s.mode === "cube"),
    model: Number(s.mode === "model"),
    local: Number(s.local && !comparison && s.panel !== "gimbal"),
    arc: Number(s.arc && !s.zero),
    translation: Number(s.translation),
    vector: Number(!model && s.local),
    addends: Number(!model && (s.panel === "basis" || s.panel === "compute")),
    gimbal: Number(s.panel === "gimbal"),
    comparison: Number(comparison),
    axis: Number(
      s.panel === "quaternion" ||
        s.panel === "q-matrix" ||
        (s.panel === "object" && s.input === "quaternion"),
    ),
    parent: Number(s.panel === "object" && s.parent),
    grid3D: Number(s.dimension === 3),
    cubePoint: Number(s.mode === "cube"),
  };
}
export function localPoint(s: RotationState): Triple {
  return s.zero ? (s.axisPoint ? [2, 0, 0] : [0, 0, 0]) : s.point;
}
function pointOrigin(s: RotationState): Triple {
  if (!s.translation) return s.origin;
  return [s.t, 2 * s.t, 0];
}
export function worldPoint(s: RotationState): Vector3 {
  if (s.visual) return new Vector3(...s.visual.worldPoint);
  return new Vector3(...localPoint(s))
    .applyQuaternion(orientation(s))
    .add(new Vector3(...pointOrigin(s)));
}
const triple = (a: Triple, b: Triple, t: number): Triple =>
  a.map((n, i) => n + (b[i] - n) * t) as Triple;

export function modelOrientation(s: RotationState): Quaternion {
  if (s.visual) return new Quaternion(...s.visual.modelQuaternion);
  if (s.panel === "order") return eulerQuaternion(s.angles, "XYZ");
  if (s.panel === "interpolation") return interpolation(s.t, s.compound).euler;
  return orientation(s);
}
export function comparisonOrientation(s: RotationState): Quaternion {
  if (s.visual) return new Quaternion(...s.visual.comparisonQuaternion);
  return s.panel === "order"
    ? eulerQuaternion(s.angles, "YXZ")
    : orientation(s);
}

/** Interpolate actual transforms, rather than lerping Euler representations. */
export function blendScene(
  from: RotationState,
  to: RotationState,
  progress: number,
): RotationState {
  if (progress >= 1) return to;
  const u = Math.max(0, progress);
  const t = u * u * (3 - 2 * u);
  const q = orientation(from).clone().slerp(orientation(to), t);
  const point = triple(localPoint(from), localPoint(to), t);
  // Recover the current effective origin when retargeting an unfinished transition.
  const fromOrigin = from.visual
    ? (worldPoint(from)
        .sub(
          new Vector3(...localPoint(from)).applyQuaternion(orientation(from)),
        )
        .toArray() as Triple)
    : pointOrigin(from);
  const pointFrame = triple(fromOrigin, pointOrigin(to), t);
  const world = new Vector3(...point)
    .applyQuaternion(q)
    .add(new Vector3(...pointFrame));
  const a = from.visual?.visibility ?? visibility(from),
    b = visibility(to);
  const weights = Object.fromEntries(
    Object.keys(b).map((key) => {
      const k = key as keyof Visibility;
      return [k, a[k] + (b[k] - a[k]) * t];
    }),
  ) as Visibility;
  return {
    ...to,
    origin: triple(from.origin, to.origin, t),
    point,
    zero: false,
    angles: triple(from.angles, to.angles, t),
    axis: triple(from.axis, to.axis, t),
    angle: from.angle + (to.angle - from.angle) * t,
    t: from.t + (to.t - from.t) * t,
    shear: from.shear + (to.shear - from.shear) * t,
    cameraPosition: triple(from.cameraPosition, to.cameraPosition, t),
    cameraTarget: triple(from.cameraTarget, to.cameraTarget, t),
    visual: {
      quaternion: q.toArray(),
      modelQuaternion: modelOrientation(from)
        .clone()
        .slerp(modelOrientation(to), t)
        .toArray(),
      comparisonQuaternion: comparisonOrientation(from)
        .clone()
        .slerp(comparisonOrientation(to), t)
        .toArray(),
      worldPoint: world.toArray(),
      visibility: weights,
    },
  };
}
