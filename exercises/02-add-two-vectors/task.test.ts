import { describe, expect, it } from "vitest";
import { Vector3 } from "three";
import { addVectors } from "./task";

describe("addVectors", () => {
  it("adds vectors component by component without mutating inputs", () => {
    const first = new Vector3(1, 2, 3);
    const second = new Vector3(4, 5, 6);

    const result = addVectors(first, second);

    expect(result.toArray()).toEqual([5, 7, 9]);
    expect(first.toArray()).toEqual([1, 2, 3]);
    expect(second.toArray()).toEqual([4, 5, 6]);
    expect(result).not.toBe(first);
    expect(result).not.toBe(second);
  });
});
