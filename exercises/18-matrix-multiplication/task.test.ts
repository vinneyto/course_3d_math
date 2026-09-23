import { describe, expect, it } from "vitest";
import { Matrix3 } from "three";
import { multiplyMatrices } from "./task";

describe("multiplyMatrices", () => {
  it("calculates first * second", () => {
    const first = new Matrix3().set(1, 2, 0, 0, 1, 0, 0, 0, 1);
    const second = new Matrix3().set(2, 0, 0, 0, 3, 0, 0, 0, 1);
    const expected = new Matrix3().set(2, 6, 0, 0, 3, 0, 0, 0, 1);

    const firstBefore = first.toArray();
    const secondBefore = second.toArray();
    const result = multiplyMatrices(first, second);

    expect(result.toArray()).toEqual(expected.toArray());
    expect(first.toArray()).toEqual(firstBefore);
    expect(second.toArray()).toEqual(secondBefore);
  });
});
