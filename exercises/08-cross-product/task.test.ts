import { describe, expect, it } from "vitest";
import { Vector3 } from "three";
import { crossProduct } from "./task";

describe("crossProduct", () => {
  it("uses all components and is perpendicular to both nonorthogonal inputs", () => {
    const a = new Vector3(1, 2, 3),
      b = new Vector3(4, -2, 1);
    const c = crossProduct(a, b);
    expect(c.toArray()).toEqual([8, 11, -10]);
    expect(c.dot(a)).toBeCloseTo(0);
    expect(c.dot(b)).toBeCloseTo(0);
    expect(a.toArray()).toEqual([1, 2, 3]);
    expect(b.toArray()).toEqual([4, -2, 1]);
    expect(c).not.toBe(a);
    expect(c).not.toBe(b);
  });
  it("reverses with order and has parallelogram area as its length", () => {
    const a = new Vector3(2, 0, 0),
      b = new Vector3(1, 2, 0);
    expect(crossProduct(a, b).length()).toBeCloseTo(4);
    expect(crossProduct(a, b).add(crossProduct(b, a)).length()).toBeCloseTo(0);
  });
  it.each([5, -3, 0])(
    "returns zero for collinear vectors with scale %s",
    (scale) => {
      expect(
        crossProduct(new Vector3(2, 0, 0), new Vector3(scale, 0, 0)).length(),
      ).toBe(0);
      expect(crossProduct(new Vector3(), new Vector3(1, 2, 3)).length()).toBe(
        0,
      );
    },
  );
});
