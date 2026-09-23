import { Vector3 } from "three";

export function buildOrthonormalBasis(
  a: Vector3,
  b: Vector3,
): { x: Vector3; y: Vector3; z: Vector3 } {
  throw new Error(
    "TODO: construct a right-handed orthonormal basis; reject zero or parallel directions",
  );
}
