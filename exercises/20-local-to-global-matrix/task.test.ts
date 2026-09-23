import { describe, expect, it } from "vitest";
import { Matrix3, Vector3 } from "three";
import { localVectorToGlobalWithMatrix } from "./task";

describe("localVectorToGlobalWithMatrix", () => {
  it("converts the clock-hand vector to global coordinates", () => {
    const localToGlobalMatrix = new Matrix3().set(
      0, 1, 0,
      -1, 0, 0,
      0, 0, 1,
    );
    const localVector = new Vector3(2, 6, 0);

    const globalVector = localVectorToGlobalWithMatrix(
      localVector,
      localToGlobalMatrix,
    );

    expect(globalVector.toArray()).toEqual([6, -2, 0]);
    expect(localVector.toArray()).toEqual([2, 6, 0]);
  });
});
