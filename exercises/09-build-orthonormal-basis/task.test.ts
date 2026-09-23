import { describe, expect, it } from "vitest";
import { Vector3 } from "three";
import { buildOrthonormalBasis } from "./task";

describe("buildOrthonormalBasis", () => {
  it.each([1, 7, 0.001])(
    "constructs a right-handed unit basis independent of scale %s",
    (scale) => {
      const a = new Vector3(1, 2, 3).multiplyScalar(scale),
        b = new Vector3(2, -1, 4);
      const beforeA = a.clone(),
        beforeB = b.clone();
      const { x, y, z } = buildOrthonormalBasis(a, b);
      for (const axis of [x, y, z]) expect(axis.length()).toBeCloseTo(1);
      expect(x.dot(y)).toBeCloseTo(0);
      expect(y.dot(z)).toBeCloseTo(0);
      expect(z.dot(x)).toBeCloseTo(0);
      expect(x.distanceTo(a.clone().normalize())).toBeCloseTo(0);
      expect(x.clone().cross(y).distanceTo(z)).toBeCloseTo(0);
      expect(z.dot(b)).toBeCloseTo(0);
      expect(a.equals(beforeA)).toBe(true);
      expect(b.equals(beforeB)).toBe(true);
      for (const axis of [x, y, z]) {
        expect(axis).not.toBe(a);
        expect(axis).not.toBe(b);
      }
      expect(x).not.toBe(y);
      expect(y).not.toBe(z);
      expect(z).not.toBe(x);
    },
  );
  it.each([
    [0, 0, 0],
    [2, 0, 0],
    [-3, 0, 0],
    [1, 1e-8, 0],
  ])("rejects an invalid second direction (%s,%s,%s)", (x, y, z) => {
    expect(() =>
      buildOrthonormalBasis(new Vector3(1, 0, 0), new Vector3(x, y, z)),
    ).toThrow(RangeError);
  });
  it("rejects a zero first direction", () => {
    expect(() =>
      buildOrthonormalBasis(new Vector3(), new Vector3(1, 2, 0)),
    ).toThrow(RangeError);
  });
});
