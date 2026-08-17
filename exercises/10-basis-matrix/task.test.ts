import { describe, expect, it } from "vitest";
import { Vector3 } from "three";
import { createBasisMatrix } from "./task";

describe("createBasisMatrix", () => {
  it("creates the identity matrix from the standard basis", () => {
    const matrix = createBasisMatrix(
      new Vector3(1, 0, 0),
      new Vector3(0, 1, 0),
      new Vector3(0, 0, 1),
    );

    expect(matrix.elements).toEqual([1, 0, 0, 0, 1, 0, 0, 0, 1]);
  });

  it("stores each basis vector in one column", () => {
    const matrix = createBasisMatrix(
      new Vector3(0, -1, 0),
      new Vector3(1, 0, 0),
      new Vector3(0, 0, 1),
    );

    expect(matrix.elements).toEqual([0, -1, 0, 1, 0, 0, 0, 0, 1]);
  });
});
