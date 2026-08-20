import { Matrix4, Vector4 } from "three";

export function composeTransformChain(
  rotation1: Matrix4,
  translation1: Matrix4,
  rotation2: Matrix4,
  scale: Matrix4,
  translation2: Matrix4,
): Matrix4 {
  throw new Error("TODO: compose T2 * S * R2 * T1 * R1 with multiply()");
}

export function applyTransformChain(
  value: Vector4,
  transform: Matrix4,
): Vector4 {
  throw new Error("TODO: apply transform to a copy of value");
}
