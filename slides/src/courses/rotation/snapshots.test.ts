import { describe, expect, it } from "vitest";
import { snapshots } from "./snapshots";
import { lessons } from "./content";
import { orientation } from "./state";
import {
  worldPoint,
  blendScene,
  modelOrientation,
  visibility,
} from "./transition";
import { eulerQuaternion, interpolation } from "./math";

const scene = (id: string) => snapshots.find((step) => step.id === id)!.scene;
describe("authored manual snapshots", () => {
  it("covers every topic in both languages with immutable, unique destinations", () => {
    expect(new Set(snapshots.map((step) => step.id)).size).toBe(
      snapshots.length,
    );
    expect(new Set(snapshots.map((step) => step.topic)).size).toBe(21);
    expect(lessons.en.length).toBe(snapshots.length);
    expect(lessons.ru.length).toBe(snapshots.length);
    expect(snapshots.length).toBeGreaterThan(22);
    for (const step of snapshots) {
      expect(Object.isFrozen(step.scene)).toBe(true);
      expect(Object.isFrozen(step.scene.angles)).toBe(true);
      expect(step.scene.visual).toBeUndefined();
    }
  });
  it("changes the representation without changing Object3D orientation", () => {
    expect(
      orientation(scene("object-euler")).angleTo(
        orientation(scene("object-quaternion")),
      ),
    ).toBeLessThan(1e-7);
    worldPoint(scene("compute-90"))
      .toArray()
      .forEach((value, index) => {
        expect(value).toBeCloseTo([2, 3, 0][index], 10);
      });
  });
  it("shows separate X/Z turns and compensation throughout simultaneous changes", () => {
    const base = orientation(scene("gimbal-y90"));
    expect(base.angleTo(orientation(scene("gimbal-x30")))).toBeCloseTo(
      Math.PI / 6,
      8,
    );
    expect(base.angleTo(orientation(scene("gimbal-z-minus30")))).toBeLessThan(
      1e-7,
    );
    for (const [from, to] of [
      ["gimbal-cancel-ready", "gimbal-cancel90"],
      ["gimbal-cancel90", "gimbal-cancel-ready"],
    ]) {
      for (const t of [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1]) {
        const frame = blendScene(scene(from), scene(to), t);
        expect(base.angleTo(modelOrientation(frame))).toBeLessThan(1e-7);
        expect(
          orientation(frame).angleTo(
            eulerQuaternion(frame.visual?.gimbalAngles ?? frame.angles),
          ),
        ).toBeLessThan(1e-7);
        expect(
          (frame.visual?.visibility ?? visibility(frame)).eulerSectors,
        ).toBe(0);
      }
    }
    const interrupted = blendScene(
      scene("gimbal-cancel-ready"),
      scene("gimbal-cancel90"),
      0.4,
    );
    const reversed = blendScene(interrupted, scene("gimbal-cancel45"), 0.5);
    expect(base.angleTo(modelOrientation(reversed))).toBeLessThan(1e-7);
  });
  it("animates one model through the second Euler order with the same final angles", () => {
    const finalXYZ = orientation(scene("euler-3"));
    const finalYXZ = modelOrientation(scene("order-3"));
    expect(finalXYZ.angleTo(finalYXZ)).toBeGreaterThan(0.3);
    expect(finalYXZ.angleTo(eulerQuaternion([30, 40, 25], "YXZ"))).toBeLessThan(
      1e-7,
    );
    for (const id of ["order-0", "order-1", "order-2", "order-3"])
      expect(visibility(scene(id)).comparison).toBe(0);
    for (let i = 0; i < 3; i++) {
      const start = modelOrientation(scene(`order-${i}`));
      const end = modelOrientation(scene(`order-${i + 1}`));
      const mid = modelOrientation(
        blendScene(scene(`order-${i}`), scene(`order-${i + 1}`), 0.5),
      );
      expect(start.angleTo(mid)).toBeCloseTo(start.angleTo(end) / 2, 8);
    }
  });
  it("keeps displayed angles and orientation consistent between frames", () => {
    const middle = blendScene(
      scene("gimbal-x30"),
      scene("gimbal-z-minus30"),
      0.5,
    );
    expect(
      orientation(middle).angleTo(eulerQuaternion(middle.visual!.gimbalAngles)),
    ).toBeLessThan(1e-7);
    const compound = blendScene(
      scene("slerp-compound-0.25"),
      scene("slerp-compound-0.5"),
      0.5,
    );
    expect(
      modelOrientation(compound).angleTo(interpolation(compound.t, true).euler),
    ).toBeLessThan(1e-7);
  });
  it("retargets an interrupted entrance without snapping onto the new example's path", () => {
    for (const [first, next] of [
      ["gimbal-y90", "gimbal-x30"],
      ["slerp-compound-0.25", "slerp-compound-0.5"],
    ]) {
      const visible = blendScene(scene("cube-30"), scene(first), 0.4);
      const retargeted = blendScene(visible, scene(next), 0);
      expect(
        orientation(visible).angleTo(orientation(retargeted)),
      ).toBeLessThan(1e-7);
      expect(
        modelOrientation(visible).angleTo(modelOrientation(retargeted)),
      ).toBeLessThan(1e-7);
      expect(
        worldPoint(visible).distanceTo(worldPoint(retargeted)),
      ).toBeLessThan(1e-7);
    }
  });
});
