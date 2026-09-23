import { describe, expect, it } from "vitest";
import { Vector3 } from "three";
import { diffuseIntensity } from "./task";

describe("diffuseIntensity", () => {
  it.each([1, 5, 0.2])("ignores direction lengths at scale %s", (scale) => {
    const n = new Vector3(0, 0, 2),
      l = new Vector3(Math.sqrt(3), 0, 1).multiplyScalar(scale);
    const before = l.clone();
    expect(diffuseIntensity(n, l)).toBeCloseTo(0.5);
    expect(n.toArray()).toEqual([0, 0, 2]);
    expect(l.equals(before)).toBe(true);
  });
  it("handles front, grazing, and back light", () => {
    const n = new Vector3(0, 0, 1);
    expect(diffuseIntensity(n, new Vector3(0, 0, 3))).toBeCloseTo(1);
    expect(diffuseIntensity(n, new Vector3(1, 0, 0))).toBeCloseTo(0);
    expect(diffuseIntensity(n, new Vector3(1, 0, -1))).toBe(0);
  });
  it("rejects missing directions", () => {
    expect(() => diffuseIntensity(new Vector3(), new Vector3(1, 0, 0))).toThrow(
      RangeError,
    );
    expect(() => diffuseIntensity(new Vector3(1, 0, 0), new Vector3())).toThrow(
      RangeError,
    );
  });
});
