import { describe, expect, it } from "vitest";
import { Matrix4, Vector4 } from "three";
import { applyTransformChain, composeTransformChain } from "./task";

type TransformMatrices = [Matrix4, Matrix4, Matrix4, Matrix4, Matrix4];

function createMatrices(): TransformMatrices {
  return [
    new Matrix4().makeRotationZ(Math.PI / 2),
    new Matrix4().makeTranslation(3, 0, 0),
    new Matrix4().makeRotationY(Math.PI / 2),
    new Matrix4().makeScale(1.5, 0.75, 1),
    new Matrix4().makeTranslation(-1, 2, 4),
  ];
}

describe("long Matrix4 transformation chain", () => {
  it("applies all five transformations in chronological order", () => {
    const [rotation1, translation1, rotation2, scale, translation2] =
      createMatrices();
    const transform = composeTransformChain(
      rotation1,
      translation1,
      rotation2,
      scale,
      translation2,
    );

    const result = applyTransformChain(new Vector4(2, 1, 1, 1), transform);

    expect(result.x).toBeCloseTo(0.5);
    expect(result.y).toBeCloseTo(3.5);
    expect(result.z).toBeCloseTo(2);
    expect(result.w).toBeCloseTo(1);
  });

  it("transforms the local origin through the whole chain", () => {
    const transform = composeTransformChain(...createMatrices());

    const result = applyTransformChain(new Vector4(0, 0, 0, 1), transform);

    expect(result.x).toBeCloseTo(-1);
    expect(result.y).toBeCloseTo(2);
    expect(result.z).toBeCloseTo(1);
    expect(result.w).toBeCloseTo(1);
  });

  it("does not apply translations to a vector with w = 0", () => {
    const transform = composeTransformChain(...createMatrices());

    const result = applyTransformChain(new Vector4(2, 1, 1, 0), transform);

    expect(result.x).toBeCloseTo(1.5);
    expect(result.y).toBeCloseTo(1.5);
    expect(result.z).toBeCloseTo(1);
    expect(result.w).toBeCloseTo(0);
  });

  it("does not modify the matrices or value", () => {
    const matrices = createMatrices();
    const originalMatrices = matrices.map((matrix) => matrix.clone());
    const transform = composeTransformChain(...matrices);
    const originalTransform = transform.clone();
    const value = new Vector4(2, 1, 1, 1);

    applyTransformChain(value, transform);

    matrices.forEach((matrix, index) => {
      expect(matrix.equals(originalMatrices[index])).toBe(true);
    });
    expect(transform.equals(originalTransform)).toBe(true);
    expect(value.toArray()).toEqual([2, 1, 1, 1]);
  });
});
