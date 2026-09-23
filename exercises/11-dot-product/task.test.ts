import { describe, expect, it } from "vitest";
import { Vector3 } from "three";
import { dotProduct } from "./task";

describe("dotProduct", () => {
  it("returns a commutative scalar using every component without mutation", () => {
    const a = new Vector3(1, 2, 3),
      b = new Vector3(4, -2, 1);
    expect(dotProduct(a, b)).toBe(3);
    expect(dotProduct(b, a)).toBe(3);
    expect(a.toArray()).toEqual([1, 2, 3]);
    expect(b.toArray()).toEqual([4, -2, 1]);
  });
  it("distinguishes lengths from directions", () => {
    const a = new Vector3(2, 0, 0),
      b = new Vector3(-3, 0, 0);
    expect(dotProduct(a, b)).toBe(-6);
    expect(
      dotProduct(a.clone().normalize(), b.clone().normalize()),
    ).toBeCloseTo(-1);
    expect(dotProduct(a, a)).toBeCloseTo(a.lengthSq());
  });
  it("handles perpendicular and zero inputs", () => {
    expect(dotProduct(new Vector3(1, 2, 0), new Vector3(-2, 1, 0))).toBe(0);
    expect(dotProduct(new Vector3(), new Vector3(4, 5, 6))).toBe(0);
  });
});
