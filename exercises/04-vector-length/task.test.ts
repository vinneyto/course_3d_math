import { describe, expect, it } from "vitest";
import { Vector3 } from "three";
import { calculateVectorLength } from "./task";

describe("calculateVectorLength", () => {
  it("calculates the Euclidean length", () => {
    const vector = new Vector3(3, 4, 12);

    expect(calculateVectorLength(vector)).toBeCloseTo(13);
    expect(calculateVectorLength(vector)).toBeCloseTo(vector.length());
  });
});
