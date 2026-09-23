import { Matrix4, Vector3, Vector4 } from "three";

export function createLocalToGlobalMatrix(
  rotationRadians: number,
  translation: Vector3,
): Matrix4 {
  throw new Error("TODO: create T * R without changing translation");
}

export function localToGlobal(value: Vector4, matrix: Matrix4): Vector4 {
  throw new Error("TODO: apply matrix to a copy of value");
}
