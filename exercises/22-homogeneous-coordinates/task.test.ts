import { describe, expect, it } from "vitest";
import { Vector3, Vector4 } from "three";
import {
  homogeneousPointToCartesian,
  toHomogeneousPoint,
  toHomogeneousVector,
} from "./task";

describe("homogeneous coordinates", () => {
  it("adds w = 1 to a point", () => {
    const point = new Vector3(2, 3, 4);

    const homogeneousPoint = toHomogeneousPoint(point);

    expect(homogeneousPoint.toArray()).toEqual([2, 3, 4, 1]);
    expect(point.toArray()).toEqual([2, 3, 4]);
  });

  it("adds w = 0 to a vector", () => {
    const vector = new Vector3(2, 3, 4);

    const homogeneousVector = toHomogeneousVector(vector);

    expect(homogeneousVector.toArray()).toEqual([2, 3, 4, 0]);
    expect(vector.toArray()).toEqual([2, 3, 4]);
  });

  it("converts a homogeneous point to Cartesian coordinates", () => {
    const point = new Vector4(4, 6, 8, 2);

    const cartesianPoint = homogeneousPointToCartesian(point);

    expect(cartesianPoint.toArray()).toEqual([2, 3, 4]);
    expect(point.toArray()).toEqual([4, 6, 8, 2]);
  });

  it("supports a non-unit w", () => {
    const point = new Vector4(1, 1.5, 2, 0.5);

    expect(homogeneousPointToCartesian(point).toArray()).toEqual([2, 3, 4]);
  });

  it("rejects w = 0 as a finite Cartesian point", () => {
    const direction = new Vector4(2, 3, 4, 0);

    expect(() => homogeneousPointToCartesian(direction)).toThrow();
  });
});
