import { describe, expect, it } from "vitest";
import { Vector3 } from "three";
import { sumVectors } from "./task";

describe("sumVectors", () => {
  it("adds three vectors without mutating them", () => {
    const vectors = [
      new Vector3(1, 0, 2),
      new Vector3(0, 3, 1),
      new Vector3(4, 2, 0),
    ];

    expect(sumVectors(vectors).toArray()).toEqual([5, 5, 3]);
    expect(vectors.map((vector) => vector.toArray())).toEqual([
      [1, 0, 2],
      [0, 3, 1],
      [4, 2, 0],
    ]);
  });

  it("returns the zero vector for an empty array", () => {
    expect(sumVectors([]).toArray()).toEqual([0, 0, 0]);
  });
});
