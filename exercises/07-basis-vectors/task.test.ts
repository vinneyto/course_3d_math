import { describe, expect, it } from "vitest";
import { createVectorFromBasis } from "./task";

describe("createVectorFromBasis", () => {
  it("builds a vector from the standard basis", () => {
    expect(createVectorFromBasis(2, 3, 4).toArray()).toEqual([2, 3, 4]);
  });

  it("supports negative and zero coefficients", () => {
    expect(createVectorFromBasis(-2, 0, 5).toArray()).toEqual([-2, 0, 5]);
  });
});
