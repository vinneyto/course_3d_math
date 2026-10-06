import { Quaternion, Vector3 } from "three";
import { orientation, type RotationState } from "./state";
import { eulerQuaternion, interpolation, type Triple } from "./math";

export const transitionDuration = 1100;
export type Visibility = ReturnType<typeof visibility>;
export interface SceneVisual {
  path?: "gimbal" | "interpolation";
  quaternion: [number, number, number, number];
  modelQuaternion: [number, number, number, number];
  comparisonQuaternion: [number, number, number, number];
  worldPoint: Triple;
  gimbalAngles: Triple;
  visibility: Visibility;
}

export function visibility(s: RotationState) {
  const comparison = s.panel === "interpolation";
  const model = s.mode !== "point";
  return {
    point: Number(!model),
    cube: Number(s.mode === "cube"),
    model: Number(s.mode === "model"),
    // The final object basis is not the successive Euler rotation axes X₁/Z₃.
    local: Number(s.local && !comparison && s.panel !== "gimbal"),
    arc: Number(s.arc && !s.zero),
    translation: Number(s.translation),
    vector: Number(!model && s.local),
    addends: Number(!model && (s.panel === "basis" || s.panel === "compute")),
    gimbalPlanes: Number(s.panel === "gimbal" && s.gimbalView === "planes"),
    gimbalX: Number(s.gimbalView === "turn-x"),
    gimbalY: Number(s.gimbalView === "turn-y"),
    gimbalZ: Number(s.gimbalView === "turn-z"),
    comparison: Number(comparison),
    axis: Number(
      s.panel === "quaternion" ||
        s.panel === "q-matrix" ||
        (s.panel === "object" && s.input === "quaternion"),
    ),
    parent: Number(s.panel === "object" && s.parent),
    grid3D: Number(s.dimension === 3),
    cubePoint: Number(s.mode === "cube"),
    eulerSectors: Number(
      ["axis", "euler", "order"].includes(s.panel) ||
        (s.panel === "gimbal" && s.gimbalView.startsWith("turn-")),
    ),
    surface: Number(s.surface === "surface"),
    wireframe: Number(s.surface === "wireframe"),
    vertices: Number(s.surface === "vertices"),
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
  if (s.panel === "interpolation") return interpolation(s.t, s.compound).euler;
  return orientation(s);
}
export function comparisonOrientation(s: RotationState): Quaternion {
  if (s.visual) return new Quaternion(...s.visual.comparisonQuaternion);
  return orientation(s);
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
  const gimbal = triple(from.visual?.gimbalAngles ?? from.angles, to.angles, t);
  const timeline = from.t + (to.t - from.t) * t;
  const sameGimbal =
    from.panel === "gimbal" &&
    to.panel === "gimbal" &&
    (!from.visual || from.visual.path === "gimbal");
  const q = sameGimbal
    ? eulerQuaternion(gimbal)
    : orientation(from).clone().slerp(orientation(to), t);
  const sameInterpolation =
    from.panel === "interpolation" &&
    to.panel === "interpolation" &&
    from.compound === to.compound &&
    (!from.visual || from.visual.path === "interpolation");
  const leftQ = sameInterpolation
    ? interpolation(timeline, to.compound).euler
    : modelOrientation(from).clone().slerp(modelOrientation(to), t);
  const rightQ = sameInterpolation
    ? interpolation(timeline, to.compound).slerp
    : comparisonOrientation(from).clone().slerp(comparisonOrientation(to), t);
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
    timeline: to.timeline && {
      ...to.timeline,
      position:
        from.timeline?.group === to.timeline.group
          ? from.timeline.position +
            (to.timeline.position - from.timeline.position) * t
          : to.timeline.position,
    },
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
      path: sameGimbal
        ? "gimbal"
        : sameInterpolation
          ? "interpolation"
          : undefined,
      quaternion: q.toArray(),
      modelQuaternion: sameGimbal ? q.toArray() : leftQ.toArray(),
      comparisonQuaternion: rightQ.toArray(),
      gimbalAngles: gimbal,
      worldPoint: world.toArray(),
      visibility: weights,
    },
  };
}
