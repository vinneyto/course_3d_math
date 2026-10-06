import { describe, expect, it } from "vitest";
import { Matrix4, Quaternion, Vector3, type EulerOrder } from "three";
import {
  eulerSweeps,
  eulerRingFrames,
  gimbalTurnSweeps,
  sweepAxis,
  sweepVertex,
} from "./euler-sweeps";
import { eulerQuaternion, rad, type Triple } from "./math";
import {
  displayedEulerAngles,
  displayedEulerOrder,
  orientation,
  type RotationState,
} from "./state";
import { snapshots, sequenceFor } from "./snapshots";
import { blendScene, visibility } from "./transition";

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
  it("keeps ring normals aligned with the successive Euler rotation axes", () => {
    for (const angles of [
      [0, 0, 0],
      [30, 45, 0],
      [30, 90, -30],
      [90, 90, -90],
    ] as Triple[]) {
      const axes = eulerSweeps(angles, "XYZ");
      eulerRingFrames(angles).forEach((ring, i) => {
        const normal = new Vector3(0, 0, 1).applyQuaternion(
          new Quaternion(...ring.frame),
        );
        expect(normal.distanceTo(sweepAxis(axes[i]))).toBeLessThan(1e-12);
      });
    }
  });
  it("draws the Z undo sector along the X sector in reverse", () => {
    const sweeps = gimbalTurnSweeps([30, 90, -30]);
    const point = (i: number, angle: number) =>
      new Vector3(
        ...sweepVertex(sweeps[i].axis, rad(angle), 2),
      ).applyQuaternion(new Quaternion(...sweeps[i].frame));
    expect(point(0, 30).distanceTo(point(2, 0))).toBeLessThan(1e-10);
    expect(point(0, 0).distanceTo(point(2, -30))).toBeLessThan(1e-10);
    expect(sweepAxis(sweeps[0]).distanceTo(sweepAxis(sweeps[2]))).toBeLessThan(
      1e-10,
    );
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
    // Keep the early restoration/reset free of sectors, including their transition.
    const restored = scene("conditions-3"),
      reset = scene("axis-X-0");
    for (const [from, to] of [
      [restored, reset],
      [reset, restored],
    ]) {
      for (const t of [0, 0.1, 0.5, 0.9, 1]) {
        const frame = blendScene(from, to, t);
        expect(
          (frame.visual?.visibility ?? visibility(frame)).eulerSectors,
        ).toBe(0);
      }
    }
    const interrupted = blendScene(restored, reset, 0.4);
    expect(
      blendScene(interrupted, restored, 0.3).visual!.visibility.eulerSectors,
    ).toBe(0);
    expect(visibility(scene("axis-X-60")).eulerSectors).toBe(1);
    expect(displayedEulerAngles(reset)).toEqual([0, 0, 0]);
  });
  it("resets XYZ sectors before switching to YXZ, without moving their planes or radii at the boundary", () => {
    const xyz = scene("euler-3"),
      reset = scene("order-0");
    const vertices = (s: RotationState) =>
      eulerSweeps(displayedEulerAngles(s), displayedEulerOrder(s)).flatMap(
        (sweep, i) =>
          [0, 0.5, 1].map((fraction) =>
            new Vector3(
              ...sweepVertex(
                sweep.axis,
                rad(sweep.angle * fraction),
                2.15 - i * 0.2,
              ),
            ).applyQuaternion(new Quaternion(...sweep.frame)),
          ),
      );
    const expectSameSectors = (a: RotationState, b: RotationState) =>
      vertices(a).forEach((v, i) =>
        expect(v.distanceTo(vertices(b)[i])).toBeLessThan(1e-10),
      );
    expectSameSectors(xyz, blendScene(xyz, reset, 0));
    for (const t of [0, 0.1, 0.5, 0.9, 0.999]) {
      const frame = blendScene(xyz, reset, t);
      expect(displayedEulerOrder(frame)).toBe("XYZ");
      expect(
        eulerQuaternion(displayedEulerAngles(frame), "XYZ").angleTo(
          orientation(frame),
        ),
      ).toBeLessThan(1e-7);
    }
    expect(
      displayedEulerAngles(blendScene(xyz, reset, 0.999)).every(
        (angle) => Math.abs(angle) < 0.001,
      ),
    ).toBe(true);
    expect(displayedEulerOrder(blendScene(xyz, reset, 1))).toBe("YXZ");
    // A reverse visit grows the original XYZ sectors, not a YXZ decomposition.
    const reverse = blendScene(reset, xyz, 0.5);
    expect(displayedEulerOrder(reverse)).toBe("XYZ");
    expectSameSectors(reverse, blendScene(reverse, reset, 0));
    const interrupted = blendScene(xyz, reset, 0.4);
    expectSameSectors(interrupted, blendScene(interrupted, xyz, 0));
    // Advancing again before the reset finishes retains the visible sectors.
    const next = scene("order-1");
    expectSameSectors(interrupted, blendScene(interrupted, next, 0));
    let previous = interrupted;
    for (let i = 1; i <= 1000; i++) {
      const frame = blendScene(interrupted, next, i / 1000);
      if (displayedEulerOrder(frame) !== displayedEulerOrder(previous))
        expect(
          Math.max(...displayedEulerAngles(previous).map(Math.abs)),
        ).toBeLessThan(0.2);
      expect(orientation(previous).angleTo(orientation(frame))).toBeLessThan(
        0.005,
      );
      previous = frame;
    }
  });
});

describe("operation timeline", () => {
  it("names every multi-step stage and keeps the sequence moving while model motion cancels", () => {
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
    const before = scene("gimbal-z-minus30"),
      after = scene("gimbal-cancel90");
    expect(orientation(after).angleTo(orientation(before))).toBeLessThan(1e-7);
    expect(after.timeline!.position).toBeGreaterThan(before.timeline!.position);
    const middle = blendScene(before, after, 0.5);
    expect(middle.timeline!.position).toBeGreaterThan(
      before.timeline!.position,
    );
    expect(middle.timeline!.position).toBeLessThan(after.timeline!.position);
    expect(blendScene(after, before, 1).timeline).toEqual(before.timeline);
  });
});
