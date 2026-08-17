import { Vector3 } from "three";
import { localVectorToGlobal } from "../08-local-vector-to-global/task";

export interface LocalBasisInGlobal {
  xAxis: Vector3;
  yAxis: Vector3;
  zAxis: Vector3;
}

export function createRotatedLocalBasis(
  clockwiseAngleRadians: number,
): LocalBasisInGlobal {
  throw new Error("TODO: calculate the rotated local axes");
}

export function rotateLocalVectorInGlobal(
  localVector: Vector3,
  clockwiseAngleRadians: number,
): Vector3 {
  const basis = createRotatedLocalBasis(clockwiseAngleRadians);

  return localVectorToGlobal(
    localVector,
    basis.xAxis,
    basis.yAxis,
    basis.zAxis,
  );
}
