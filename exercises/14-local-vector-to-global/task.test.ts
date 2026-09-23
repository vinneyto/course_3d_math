import { describe, expect, it } from "vitest";
import { Vector3 } from "three";
import { localVectorToGlobal } from "./task";

describe("localVectorToGlobal", () => {
  it("keeps components when local and global bases coincide", () => {
    const result = localVectorToGlobal(
      new Vector3(2, 6, 0),
      new Vector3(1, 0, 0),
      new Vector3(0, 1, 0),
      new Vector3(0, 0, 1),
    );

    expect(result.toArray()).toEqual([2, 6, 0]);
  });

  it("uses the rotated local axes expressed in global coordinates", () => {
    const localVector = new Vector3(2, 6, 0);
    const xAxis = new Vector3(0, -1, 0);
    const yAxis = new Vector3(1, 0, 0);
    const zAxis = new Vector3(0, 0, 1);

    const result = localVectorToGlobal(localVector, xAxis, yAxis, zAxis);

    expect(result.toArray()).toEqual([6, -2, 0]);
    expect(localVector.toArray()).toEqual([2, 6, 0]);
    expect(xAxis.toArray()).toEqual([0, -1, 0]);
    expect(yAxis.toArray()).toEqual([1, 0, 0]);
    expect(zAxis.toArray()).toEqual([0, 0, 1]);
  });
});
