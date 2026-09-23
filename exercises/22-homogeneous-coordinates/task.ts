import { Vector3, Vector4 } from "three";

export function toHomogeneousPoint(point: Vector3): Vector4 {
  throw new Error("TODO: copy the point components and set w to 1");
}

export function toHomogeneousVector(vector: Vector3): Vector4 {
  throw new Error("TODO: copy the vector components and set w to 0");
}

export function homogeneousPointToCartesian(point: Vector4): Vector3 {
  throw new Error("TODO: divide x, y, z by w and reject w = 0");
}
