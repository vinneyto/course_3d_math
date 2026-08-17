import { describe, expect, it } from "vitest";
import { Vector3 } from "three";
import {
  createRotatedLocalBasis,
  rotateLocalVectorInGlobal,
} from "./task";

function expectVectorClose(actual: Vector3, expected: Vector3): void {
  expect(actual.x).toBeCloseTo(expected.x);
  expect(actual.y).toBeCloseTo(expected.y);
  expect(actual.z).toBeCloseTo(expected.z);
}

describe("rotated local basis", () => {
  it("rotates the basis 90 degrees clockwise", () => {
    const basis = createRotatedLocalBasis(Math.PI / 2);

    expectVectorClose(basis.xAxis, new Vector3(0, -1, 0));
    expectVectorClose(basis.yAxis, new Vector3(1, 0, 0));
    expectVectorClose(basis.zAxis, new Vector3(0, 0, 1));
  });

  it.each([
    [0, new Vector3(2, 6, 0)],
    [Math.PI / 2, new Vector3(6, -2, 0)],
    [Math.PI, new Vector3(-2, -6, 0)],
    [(3 * Math.PI) / 2, new Vector3(-6, 2, 0)],
  ])("rotates a local vector with its basis", (angle, expected) => {
    expectVectorClose(
      rotateLocalVectorInGlobal(new Vector3(2, 6, 0), angle),
      expected,
    );
  });
});
