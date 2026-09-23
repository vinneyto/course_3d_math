import { Vector3 } from "three";

export function diffuseIntensity(normal: Vector3, toLight: Vector3): number {
  throw new Error(
    "TODO: normalize both directions and clamp their dot product; reject zero vectors",
  );
}
