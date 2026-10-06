import { describe, expect, it } from "vitest";
import { Matrix4, Quaternion, Vector3, type EulerOrder } from "three";
import { eulerSweeps, sweepAxis, sweepVertex } from "./euler-sweeps";
import { eulerQuaternion, rad, type Triple } from "./math";
import { displayedEulerAngles, orientation } from "./state";
import { snapshots, sequenceFor } from "./snapshots";
import { blendScene } from "./transition";

const scene = (id: string) => snapshots.find((step) => step.id === id)!.scene;
describe("Euler angle sectors", () => {
  it("moves each sector's plane with the preceding rotations in every Euler order", () => {
    const angles: Triple = [35, -25, 55];
    for (const order of [
      "XYZ",
      "XZY",
      "YXZ",
      "YZX",
      "ZXY",
      "ZYX",
    ] as EulerOrder[]) {
      const accumulated = new Matrix4();
      for (const sweep of eulerSweeps(angles, order)) {
        const frame = new Matrix4().makeRotationFromQuaternion(
          new Quaternion(...sweep.frame),
        );
        frame.elements.forEach((n, i) =>
          expect(n).toBeCloseTo(accumulated.elements[i], 12),
        );
        const rotation =
          sweep.axis === "X"
            ? new Matrix4().makeRotationX(rad(sweep.angle))
            : sweep.axis === "Y"
              ? new Matrix4().makeRotationY(rad(sweep.angle))
              : new Matrix4().makeRotationZ(rad(sweep.angle));
        const expected = new Vector3(...sweepVertex(sweep.axis, 0, 2))
          .applyMatrix4(rotation)
          .applyMatrix4(accumulated);
        const endpoint = new Vector3(
          ...sweepVertex(sweep.axis, rad(sweep.angle), 2),
        ).applyMatrix4(frame);
        expect(endpoint.distanceTo(expected)).toBeLessThan(1e-10);
        accumulated.multiply(rotation);
      }
      const actual = new Matrix4().makeRotationFromQuaternion(
        eulerQuaternion(angles, order),
      );
      actual.elements.forEach((n, i) =>
        expect(n).toBeCloseTo(accumulated.elements[i], 12),
      );
    }
  });
  it("coincides X and Z sector normals at gimbal lock while retaining signed sweeps", () => {
    const sweeps = eulerSweeps([30, 90, -30], "XYZ");
    expect(sweepAxis(sweeps[0]).distanceTo(sweepAxis(sweeps[2]))).toBeLessThan(
      1e-10,
    );
    expect(sweepVertex("Z", -Math.PI / 2, 2)[1]).toBeCloseTo(-2, 12);
  });
  it("shows only Euler angles applied so far and follows the displayed transform", () => {
    const expected = [
      [0, 0, 0],
      [30, 0, 0],
      [30, 40, 0],
      [30, 40, 25],
    ];
    expected.forEach((angles, i) =>
      expect(displayedEulerAngles(scene(`euler-${i}`))).toEqual(angles),
    );
    const middle = blendScene(scene("euler-1"), scene("euler-2"), 0.5);
    const angles = displayedEulerAngles(middle);
    expect(angles[1]).toBeGreaterThan(0);
    expect(angles[1]).toBeLessThan(40);
    expect(eulerQuaternion(angles).angleTo(orientation(middle))).toBeLessThan(
      1e-7,
    );
  });
});

describe("operation timeline", () => {
  it("names every multi-step stage and keeps the sequence moving when example time resets", () => {
    for (const [index, step] of snapshots.entries()) {
      const group = sequenceFor(index);
      if (group.length === 1) continue;
      expect(step.caption?.en).toBeTruthy();
      expect(step.caption?.ru).toBeTruthy();
      expect(step.caption!.en).not.toContain("%");
      expect(step.caption!.ru).not.toContain("%");
      expect(step.operation).toBeTruthy();
      expect(Object.isFrozen(step.scene.timeline)).toBe(true);
      expect(new Set(group.map((frame) => frame.caption!.en)).size).toBe(
        group.length,
      );
    }
    const before = scene("gimbal-90-1"),
      after = scene("gimbal-80-0.5");
    expect(after.t).toBeLessThan(before.t);
    expect(after.timeline!.position).toBeGreaterThan(before.timeline!.position);
    const middle = blendScene(before, after, 0.5);
    expect(middle.timeline!.position).toBeGreaterThan(
      before.timeline!.position,
    );
    expect(middle.timeline!.position).toBeLessThan(after.timeline!.position);
    expect(blendScene(after, before, 1).timeline).toEqual(before.timeline);
  });
});
