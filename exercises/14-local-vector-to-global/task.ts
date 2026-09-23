import { Vector3 } from "three";

export function localVectorToGlobal(
  localVector: Vector3,
  localXAxisInGlobal: Vector3,
  localYAxisInGlobal: Vector3,
  localZAxisInGlobal: Vector3,
): Vector3 {
  throw new Error("TODO: combine the global representations of the local axes");
}
