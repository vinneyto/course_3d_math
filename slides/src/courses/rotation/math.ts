import { Euler, Matrix4, Quaternion, Vector3, type EulerOrder } from "three";

export type Triple = [number, number, number];
export const rad = (degrees: number): number => (degrees * Math.PI) / 180;
export const deg = (radians: number): number => (radians * 180) / Math.PI;
export const fmt = (n: number): string =>
  (Math.abs(n) < 0.0005 ? 0 : n).toFixed(2);
export const tuple = (v: Vector3): Triple => [v.x, v.y, v.z];
export const vectorText = (v: Triple): string => `(${v.map(fmt).join(", ")})`;

export function eulerQuaternion(
  angles: Triple,
  order: EulerOrder = "XYZ",
): Quaternion {
  return new Quaternion().setFromEuler(
    new Euler(...(angles.map(rad) as Triple), order),
  );
}
export function axisQuaternion(axis: Triple, angle: number): Quaternion {
  const a = new Vector3(...axis);
  if (a.lengthSq() < 1e-10) return new Quaternion();
  return new Quaternion().setFromAxisAngle(a.normalize(), rad(angle));
}
export function localToWorld(
  point: Triple,
  origin: Triple,
  q: Quaternion,
): Vector3 {
  return new Vector3(...point).applyMatrix4(
    new Matrix4().compose(new Vector3(...origin), q, new Vector3(1, 1, 1)),
  );
}
export function gimbalAngles(t: number, locked: boolean): Triple {
  // Approach the singularity, then demonstrate the cancelling x/z motion.
  const middle = locked ? 90 : 80;
  return t <= 0.5
    ? [0, middle * t * 2, 0]
    : [(t - 0.5) * 180, middle, -(t - 0.5) * 180];
}
export function interpolation(
  t: number,
  compound = false,
): {
  euler: Quaternion;
  slerp: Quaternion;
  speedEuler: number;
  speedSlerp: number;
} {
  const start: Triple = compound ? [25, -35, 50] : [0, 0, 179];
  const end: Triple = compound ? [130, 70, -85] : [0, 0, -179];
  const qa = eulerQuaternion(start),
    qb = eulerQuaternion(end);
  const at = (u: number) =>
    eulerQuaternion(start.map((a, i) => a + (end[i] - a) * u) as Triple);
  const dt = 0.0001,
    lo = Math.max(0, t - dt),
    hi = Math.min(1, t + dt);
  return {
    euler: at(t),
    slerp: qa.clone().slerp(qb, t),
    speedEuler: deg(at(lo).angleTo(at(hi))) / (hi - lo),
    speedSlerp: deg(qa.angleTo(qb)),
  };
}
