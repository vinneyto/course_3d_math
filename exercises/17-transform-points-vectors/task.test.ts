import { describe, expect, it } from "vitest";
import { Vector3, Vector4 } from "three";
import { createLocalToGlobalMatrix, localToGlobal } from "./task";

const ROTATION_RADIANS = Math.PI / 2;
const TRANSLATION = new Vector3(4, 1, 0);

describe("Matrix4 point and vector transformations", () => {
  it("rotates a point and then translates it in global coordinates", () => {
    const matrix = createLocalToGlobalMatrix(
      ROTATION_RADIANS,
      TRANSLATION,
    );
    const localPoint = new Vector4(2, 0, 0, 1);

    const globalPoint = localToGlobal(localPoint, matrix);

    expect(globalPoint.x).toBeCloseTo(4);
    expect(globalPoint.y).toBeCloseTo(3);
    expect(globalPoint.z).toBeCloseTo(0);
    expect(globalPoint.w).toBeCloseTo(1);
  });

  it("moves the local origin to the translation", () => {
    const matrix = createLocalToGlobalMatrix(
      ROTATION_RADIANS,
      TRANSLATION,
    );

    const globalOrigin = localToGlobal(new Vector4(0, 0, 0, 1), matrix);

    expect(globalOrigin.toArray()).toEqual([4, 1, 0, 1]);
  });

  it("rotates a vector but does not translate it", () => {
    const matrix = createLocalToGlobalMatrix(
      ROTATION_RADIANS,
      TRANSLATION,
    );
    const localVector = new Vector4(2, 0, 0, 0);

    const globalVector = localToGlobal(localVector, matrix);

    expect(globalVector.x).toBeCloseTo(0);
    expect(globalVector.y).toBeCloseTo(2);
    expect(globalVector.z).toBeCloseTo(0);
    expect(globalVector.w).toBeCloseTo(0);
  });

  it("does not modify its arguments", () => {
    const translation = TRANSLATION.clone();
    const matrix = createLocalToGlobalMatrix(ROTATION_RADIANS, translation);
    const originalMatrix = matrix.clone();
    const value = new Vector4(2, 0, 0, 1);

    localToGlobal(value, matrix);

    expect(translation.toArray()).toEqual(TRANSLATION.toArray());
    expect(value.toArray()).toEqual([2, 0, 0, 1]);
    expect(matrix.equals(originalMatrix)).toBe(true);
  });
});
