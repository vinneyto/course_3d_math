import { describe, expect, it } from "vitest";
import { Vector3 } from "three";
import { normalizeWithThree } from "./task";

describe("normalizeWithThree", () => {
  it("returns a normalized copy", () => {
    const vector = new Vector3(3, 4, 0);
    const result = normalizeWithThree(vector);

    expect(result.toArray()).toEqual([0.6, 0.8, 0]);
    expect(result.length()).toBeCloseTo(1);
    expect(vector.toArray()).toEqual([3, 4, 0]);
    expect(result).not.toBe(vector);
  });
});
