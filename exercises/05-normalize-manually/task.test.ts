import { describe, expect, it } from "vitest";
import { Vector3 } from "three";
import { normalizeManually } from "./task";

describe("normalizeManually", () => {
  it("returns a new unit vector", () => {
    const vector = new Vector3(3, 4, 0);
    const result = normalizeManually(vector);

    expect(result.x).toBeCloseTo(0.6);
    expect(result.y).toBeCloseTo(0.8);
    expect(result.z).toBeCloseTo(0);
    expect(result.length()).toBeCloseTo(1);
    expect(vector.toArray()).toEqual([3, 4, 0]);
  });
});
