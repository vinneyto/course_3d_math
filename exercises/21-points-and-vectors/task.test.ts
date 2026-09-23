import { describe, expect, it } from "vitest";
import { Vector3 } from "three";
import { createVectorFromPoints } from "./task";

describe("createVectorFromPoints", () => {
  it("creates a vector directed from point A to point B", () => {
    const pointA = new Vector3(1, 2, 0);
    const pointB = new Vector3(4, 6, 0);

    const vector = createVectorFromPoints(pointA, pointB);

    expect(vector.toArray()).toEqual([3, 4, 0]);
  });

  it("returns a new vector and preserves both points", () => {
    const pointA = new Vector3(3, -1, 2);
    const pointB = new Vector3(-2, 4, 1);

    const vector = createVectorFromPoints(pointA, pointB);

    expect(vector.toArray()).toEqual([-5, 5, -1]);
    expect(vector).not.toBe(pointA);
    expect(vector).not.toBe(pointB);
    expect(pointA.toArray()).toEqual([3, -1, 2]);
    expect(pointB.toArray()).toEqual([-2, 4, 1]);
  });
});
