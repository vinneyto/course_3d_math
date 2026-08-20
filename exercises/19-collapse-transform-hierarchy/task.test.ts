import { describe, expect, it } from "vitest";
import { Matrix4, Vector4 } from "three";
import {
  applyTransformsSeparately,
  collapseTransforms,
} from "./task";

function createTransforms(): Matrix4[] {
  return [
    new Matrix4().makeRotationZ(Math.PI / 2),
    new Matrix4().makeTranslation(3, 0, 0),
    new Matrix4().makeRotationY(Math.PI / 2),
    new Matrix4().makeScale(1.5, 0.75, 1),
    new Matrix4().makeTranslation(-1, 2, 4),
  ];
}

function expectVectorClose(actual: Vector4, expected: Vector4): void {
  expect(actual.x).toBeCloseTo(expected.x);
  expect(actual.y).toBeCloseTo(expected.y);
  expect(actual.z).toBeCloseTo(expected.z);
  expect(actual.w).toBeCloseTo(expected.w);
}

describe("collapsing a transform hierarchy", () => {
  it("applies transforms separately in chronological order", () => {
    const result = applyTransformsSeparately(
      new Vector4(2, 1, 1, 1),
      createTransforms(),
    );

    expectVectorClose(result, new Vector4(0.5, 3.5, 2, 1));
  });

  it("builds the same matrix as the explicit product", () => {
    const transforms = createTransforms();
    const [rotation1, translation1, rotation2, scale, translation2] =
      transforms;
    const expected = translation2
      .clone()
      .multiply(scale)
      .multiply(rotation2)
      .multiply(translation1)
      .multiply(rotation1);

    const collapsed = collapseTransforms(transforms);

    collapsed.elements.forEach((value, index) => {
      expect(value).toBeCloseTo(expected.elements[index]);
    });
  });

  it("gives the same result when matrices are applied separately or collapsed", () => {
    const transforms = createTransforms();
    const point = new Vector4(2, 1, 1, 1);

    const separateResult = applyTransformsSeparately(point, transforms);
    const collapsedResult = point
      .clone()
      .applyMatrix4(collapseTransforms(transforms));

    expectVectorClose(collapsedResult, separateResult);
  });

  it("returns the identity matrix for an empty hierarchy", () => {
    expect(collapseTransforms([]).equals(new Matrix4())).toBe(true);
  });

  it("does not modify the value or source matrices", () => {
    const value = new Vector4(2, 1, 1, 1);
    const transforms = createTransforms();
    const originalTransforms = transforms.map((matrix) => matrix.clone());

    applyTransformsSeparately(value, transforms);
    collapseTransforms(transforms);

    expect(value.toArray()).toEqual([2, 1, 1, 1]);
    transforms.forEach((matrix, index) => {
      expect(matrix.equals(originalTransforms[index])).toBe(true);
    });
  });
});
