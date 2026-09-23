import { describe, expect, it } from "vitest";
import { Matrix3, Vector3 } from "three";
import { multiplyMatrixByVector } from "./task";

describe("multiplyMatrixByVector", () => {
  it("multiplies rows by the vector column", () => {
    const matrix = new Matrix3().set(1, 2, 0, 0, 1, 0, 0, 0, 1);
    const vector = new Vector3(3, 4, 5);

    const result = multiplyMatrixByVector(matrix, vector);

    expect(result.toArray()).toEqual([11, 4, 5]);
    expect(vector.toArray()).toEqual([3, 4, 5]);
  });
});
