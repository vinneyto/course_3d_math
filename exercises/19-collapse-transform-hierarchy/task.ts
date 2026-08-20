import { Matrix4, Vector4 } from "three";

export function applyTransformsSeparately(
  value: Vector4,
  transforms: readonly Matrix4[],
): Vector4 {
  throw new Error("TODO: apply every transform to a copy of value");
}

export function collapseTransforms(
  transforms: readonly Matrix4[],
): Matrix4 {
  throw new Error("TODO: collapse transforms with premultiply()");
}
