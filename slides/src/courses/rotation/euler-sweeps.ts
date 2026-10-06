import { Quaternion, Vector3, type EulerOrder } from "three";
import { axisQuaternion, type Triple } from "./math";

export type RotationAxis = "X" | "Y" | "Z";
export interface EulerSweep {
  axis: RotationAxis;
  angle: number;
  frame: [number, number, number, number];
}
const vectors: Record<RotationAxis, Triple> = {
  X: [1, 0, 0],
  Y: [0, 1, 0],
  Z: [0, 0, 1],
};

/** Intrinsic Euler axes move with the preceding rotations, not with the final basis. */
export function eulerSweeps(angles: Triple, order: EulerOrder): EulerSweep[] {
  const frame = new Quaternion();
  return order.split("").map((letter) => {
    const axis = letter as RotationAxis;
    const angle = angles["XYZ".indexOf(axis)];
    const sweep = { axis, angle, frame: frame.toArray() };
    frame.multiply(axisQuaternion(vectors[axis], angle));
    return sweep;
  });
}

/** A signed right-handed sweep from a reference ray perpendicular to its axis. */
export function sweepVertex(
  axis: RotationAxis,
  radians: number,
  radius: number,
): Triple {
  const c = radius * Math.cos(radians),
    s = radius * Math.sin(radians);
  return axis === "X" ? [0, c, s] : axis === "Y" ? [s, 0, c] : [c, s, 0];
}
export function sweepAxis(sweep: EulerSweep) {
  return new Vector3(...vectors[sweep.axis]).applyQuaternion(
    new Quaternion(...sweep.frame),
  );
}

/** At Y=90°, use the same physical reference ray to show Z undoing the X sector. */
export function gimbalTurnSweeps(angles: Triple): EulerSweep[] {
  const sweeps = eulerSweeps(angles, "XYZ");
  sweeps[2].frame = new Quaternion(...sweeps[2].frame)
    .multiply(axisQuaternion([0, 0, 1], 90))
    .toArray();
  return sweeps;
}
