import { describe, expect, it } from "vitest";
import { Matrix4, Vector3 } from "three";
import {
  axisQuaternion,
  eulerQuaternion,
  interpolation,
  localToWorld,
  rad,
} from "./math";

describe("lesson mathematics", () => {
  it("computes the translated 90° example and fixes points on the axis", () => {
    const p = localToWorld([2, 1, 0], [3, 1, 0], eulerQuaternion([0, 0, 90]));
    expect(p.distanceTo(new Vector3(2, 3, 0))).toBeLessThan(1e-12);
    expect(
      localToWorld(
        [2, 0, 0],
        [3, 1, 0],
        eulerQuaternion([76, 0, 0]),
      ).distanceTo(new Vector3(5, 1, 0)),
    ).toBeLessThan(1e-12);
  });
  it("XYZ is Rx Ry Rz, preserves distances, and differs from YXZ", () => {
    const q = eulerQuaternion([30, 40, 25]);
    const product = new Matrix4()
      .makeRotationX(rad(30))
      .multiply(new Matrix4().makeRotationY(rad(40)))
      .multiply(new Matrix4().makeRotationZ(rad(25)));
    const fromQ = new Matrix4().makeRotationFromQuaternion(q);
    product.elements.forEach((v, i) =>
      expect(v).toBeCloseTo(fromQ.elements[i], 12),
    );
    const a = new Vector3(1, 2, 3),
      b = new Vector3(-2, 4, 1);
    expect(
      a.clone().applyQuaternion(q).distanceTo(b.clone().applyQuaternion(q)),
    ).toBeCloseTo(a.distanceTo(b), 12);
    expect(q.angleTo(eulerQuaternion([30, 40, 25], "YXZ"))).toBeGreaterThan(
      0.1,
    );
  });
  it("x/z compensate at y=90°, but not at 80°", () => {
    const a = eulerQuaternion([0, 90, 0]),
      b = eulerQuaternion([90, 90, -90]);
    expect(a.angleTo(b)).toBeLessThan(1e-7);
    expect(
      eulerQuaternion([0, 80, 0]).angleTo(eulerQuaternion([90, 80, -90])),
    ).toBeGreaterThan(0.1);
  });
  it("SLERP crosses the 179° boundary in 2° and respects both endpoints", () => {
    expect(interpolation(0.5).speedSlerp).toBeCloseTo(2, 7);
    expect(interpolation(0.5).speedEuler).toBeCloseTo(358, 4);
    expect(
      interpolation(0).slerp.angleTo(eulerQuaternion([0, 0, 179])),
    ).toBeLessThan(1e-7);
    expect(
      interpolation(1).slerp.angleTo(eulerQuaternion([0, 0, -179])),
    ).toBeLessThan(1e-7);
    const q = axisQuaternion([1, 1, 0], 75);
    expect(q.length()).toBeCloseTo(1, 12);
    expect(q.x).toBeCloseTo(Math.sin(rad(75) / 2) / Math.sqrt(2), 12);
  });
});
