import { describe, expect, it } from "vitest";
import { Vector3 } from "three";
import { triangleNormal } from "./task";

describe("triangleNormal", () => {
  it("normalizes nonorthogonal edges and follows winding", () => {
    const a = new Vector3(1, 1, 1),
      b = new Vector3(3, 1, 1),
      c = new Vector3(2, 3, 1);
    expect(triangleNormal(a, b, c).toArray()).toEqual([0, 0, 1]);
    expect(triangleNormal(a, c, b).z).toBeCloseTo(-1);
    expect([a.toArray(), b.toArray(), c.toArray()]).toEqual([
      [1, 1, 1],
      [3, 1, 1],
      [2, 3, 1],
    ]);
  });
  it("is perpendicular to tilted edges and invariant under translation", () => {
    const a = new Vector3(2, -1, 3),
      b = new Vector3(4, 2, 1),
      c = new Vector3(-1, 3, 5);
    const n = triangleNormal(a, b, c),
      offset = new Vector3(5, -2, 3);
    expect(n.length()).toBeCloseTo(1);
    expect(n.dot(b.clone().sub(a))).toBeCloseTo(0);
    expect(n.dot(c.clone().sub(a))).toBeCloseTo(0);
    expect(
      n.distanceTo(
        triangleNormal(
          a.clone().add(offset),
          b.clone().add(offset),
          c.clone().add(offset),
        ),
      ),
    ).toBeCloseTo(0);
    expect(n).not.toBe(a);
    expect(n).not.toBe(b);
    expect(n).not.toBe(c);
  });
  it.each([
    [2, 0, 0],
    [0, 0, 0],
    [1, 1e-7, 0],
  ])("rejects degenerate or too-small triangles (%s,%s,%s)", (x, y, z) => {
    expect(() =>
      triangleNormal(new Vector3(), new Vector3(1, 0, 0), new Vector3(x, y, z)),
    ).toThrow(RangeError);
  });
});
