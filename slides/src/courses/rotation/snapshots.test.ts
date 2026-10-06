import { describe, expect, it } from "vitest";
import { Matrix4, Vector3 } from "three";
import { gimbalPass } from "./gimbal-story";
import { snapshots, sequenceKey, sequenceFor } from "./snapshots";
import { lessons } from "./content";
import { displayedEulerAngles, orientation } from "./state";
import {
  worldPoint,
  blendScene,
  modelOrientation,
  visibility,
  rotationPath,
} from "./transition";
import { eulerQuaternion, interpolation } from "./math";

const scene = (id: string) => snapshots.find((step) => step.id === id)!.scene;
describe("authored manual snapshots", () => {
  it("accounts for every original step once and shares one transform across merged representations", () => {
    expect(
      snapshots.flatMap((step) => [...step.sourceSteps]).sort((a, b) => a - b),
    ).toEqual(Array.from({ length: 104 }, (_, i) => i + 1));
    for (const id of [
      "basis-0",
      "basis-90",
      "basis-180",
      "basis-reset",
      "basis-45",
    ]) {
      const s = scene(id);
      expect(s.point).toEqual([2, 1, 1]);
      expect(s.angles.slice(1)).toEqual([0, 0]);
      expect(s.panel).toBe("compute");
      const m = new Matrix4().compose(
        new Vector3(...s.origin),
        orientation(s),
        new Vector3(1, 1, 1),
      );
      expect(
        new Vector3(...s.point).applyMatrix4(m).distanceTo(worldPoint(s)),
      ).toBeLessThan(1e-12);
    }
    expect(visibility(scene("model-vertices")).wireframe).toBe(1);
    expect(visibility(scene("model-vertices")).vertices).toBe(1);
    for (const id of ["conditions-0", "conditions-2", "conditions-3"])
      expect(scene(id).angles).toEqual(scene("model-vertices").angles);
    expect(gimbalPass).toHaveLength(6);
  });
  it("keeps both origin and axis points fixed through the combined turn, then moves only the off-axis point", () => {
    const start = scene("axis-point-0"),
      end = scene("axis-point-135");
    for (const t of [0, 0.25, 0.5, 0.75, 1]) {
      const s = blendScene(start, end, t);
      expect(worldPoint(s).distanceTo(new Vector3(5, 1, 0))).toBeLessThan(
        1e-12,
      );
      expect(s.origin).toEqual([3, 1, 0]);
      expect((s.visual?.visibility ?? visibility(s)).fixedOrigin).toBe(1);
    }
    expect(
      orientation(end).angleTo(orientation(scene("local-recap-offset"))),
    ).toBeLessThan(1e-7);
    expect(scene("local-recap-offset").point).toEqual([2, 1, 1]);
  });
  it("covers every topic in both languages with immutable, unique destinations", () => {
    expect(new Set(snapshots.map((step) => step.id)).size).toBe(
      snapshots.length,
    );
    expect(new Set(snapshots.map((step) => step.topic)).size).toBe(17);
    expect(snapshots).toHaveLength(58);
    expect(snapshots[0].id).toBe("local-z-0");
    expect(
      snapshots.some(
        (step) => step.id === "point" || step.id.startsWith("translation-"),
      ),
    ).toBe(false);
    expect(lessons.en.length).toBe(snapshots.length);
    expect(lessons.ru.length).toBe(snapshots.length);
    expect(snapshots.length).toBeGreaterThan(22);
    for (const step of snapshots) {
      expect(Object.isFrozen(step.scene)).toBe(true);
      expect(Object.isFrozen(step.scene.angles)).toBe(true);
      expect(step.scene.visual).toBeUndefined();
    }
  });
  it("starts the off-axis orbit at the previous 135° position and ends at the displayed point", () => {
    const start = scene("local-recap-offset");
    const target = scene("local-recap-80");
    const reference = worldPoint(start);
    expect(visibility(start).arc).toBe(0);
    for (const frame of [
      start,
      ...[0, 0.1, 0.5, 0.9, 1].map((t) => blendScene(start, target, t)),
      blendScene(target, start, 0.4),
      blendScene(blendScene(start, target, 0.4), start, 0.2),
      scene("local-recap-80"),
    ]) {
      const path = rotationPath(frame);
      expect(new Vector3(...path[0]).distanceTo(reference)).toBeLessThan(1e-12);
      expect(
        new Vector3(...path.at(-1)!).distanceTo(worldPoint(frame)),
      ).toBeLessThan(1e-12);
      for (const sample of path) {
        // Fixed X component and radius in the plane perpendicular to X.
        expect(sample[0]).toBeCloseTo(5, 12);
        expect(Math.hypot(sample[1] - 1, sample[2])).toBeCloseTo(
          Math.SQRT2,
          12,
        );
      }
    }
    // At half of the first turn, the growing arc matches the model's path.
    const middle = worldPoint(blendScene(start, target, 0.5));
    expect(
      new Vector3(...rotationPath(target)[32]).distanceTo(middle),
    ).toBeLessThan(1e-12);
  });
  it("uses timeline boundaries for topic labels and introduces gimbal lock before the demonstration", () => {
    expect(new Set(snapshots.map(sequenceKey)).size).toBe(19);
    for (const language of ["en", "ru"] as const) {
      expect(
        new Set(lessons[language].map((lesson) => lesson.topicTitle)).size,
      ).toBe(19);
      snapshots.forEach((step, index) => {
        const lesson = lessons[language][index];
        expect(lesson.navigationTitle).toBe(
          `${lesson.topicTitle}: ${lesson.title}`,
        );
        for (const member of sequenceFor(index)) {
          const memberIndex = snapshots.findIndex(
            (item) => item.id === member.id,
          );
          expect(lessons[language][memberIndex].topicTitle).toBe(
            lesson.topicTitle,
          );
        }
      });
    }
    const intro = snapshots.findIndex((step) => step.id === "gimbal-intro");
    expect(snapshots[intro - 1].id).toBe("order-3");
    expect(snapshots[intro + 1].id).toBe("gimbal-start");
    expect(sequenceFor(intro)).toHaveLength(1);
    expect(sequenceFor(intro + 1)).toHaveLength(gimbalPass.length);
    expect(
      orientation(scene("gimbal-intro")).angleTo(orientation(scene("order-3"))),
    ).toBeLessThan(1e-7);
    expect(lessons.en[intro].body).toContain("gimbal lock");
    expect(lessons.ru[intro].body).toContain("гимбал лок");
  });
  it("shows consistent Object3D representations and the common world-coordinate example", () => {
    expect(
      orientation(scene("object-euler")).angleTo(
        eulerQuaternion(scene("object-euler").angles),
      ),
    ).toBeLessThan(1e-7);
    worldPoint(scene("basis-90"))
      .toArray()
      .forEach((value, index) => {
        expect(value).toBeCloseTo([5, 0, 1][index], 10);
      });
  });
  it("shows separate X/Z turns and compensation throughout simultaneous changes", () => {
    const base = orientation(scene("gimbal-equivalent"));
    expect(base.angleTo(orientation(scene("gimbal-y90")))).toBeCloseTo(
      Math.PI / 6,
      8,
    );
    expect(base.angleTo(orientation(scene("gimbal-z-minus30")))).toBeLessThan(
      1e-7,
    );
    for (const [from, to] of [
      ["gimbal-equivalent", "gimbal-cancel90"],
      ["gimbal-cancel90", "gimbal-equivalent"],
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
      scene("gimbal-equivalent"),
      scene("gimbal-cancel90"),
      0.4,
    );
    const reversed = blendScene(interrupted, scene("gimbal-equivalent"), 0.5);
    expect(base.angleTo(modelOrientation(reversed))).toBeLessThan(1e-7);
  });
  it("remembers the original X while the current Z aligns with it after the Y turn", () => {
    for (const prefix of ["gimbal-", "gimbal-rings-"]) {
      const remembered = scene(`${prefix}start`).gimbalReferenceX;
      expect(remembered).toEqual([1, 0, 0]);
      expect(Object.isFrozen(remembered)).toBe(true);
      const turned = scene(`${prefix}y90`),
        q = orientation(turned);
      const z = new Vector3(0, 0, 1).applyQuaternion(q);
      const x = new Vector3(1, 0, 0).applyQuaternion(q);
      expect(z.distanceTo(new Vector3(...remembered))).toBeLessThan(1e-12);
      expect(x.dot(z)).toBeCloseTo(0, 12);
      expect(x.distanceTo(new Vector3(...remembered))).toBeGreaterThan(1);
      expect(
        orientation(scene(`${prefix}z-minus30`)).angleTo(
          orientation(scene(`${prefix}equivalent`)),
        ),
      ).toBeLessThan(1e-7);
    }
    // −45° would overcompensate the first +30° turn by 15°.
    expect(
      eulerQuaternion([30, 90, -45]).angleTo(eulerQuaternion([-15, 90, 0])),
    ).toBeLessThan(1e-7);
  });
  it("repeats identical rotations with rings and restores independent per-pass timelines", () => {
    for (const step of gimbalPass) {
      const plain = scene(step.id),
        rings = scene(step.id.replace("gimbal-", "gimbal-rings-"));
      expect(orientation(plain).angleTo(orientation(rings))).toBeLessThan(1e-7);
      expect(rings.gimbalReferenceX).toEqual(plain.gimbalReferenceX);
      expect(rings.t).toBe(plain.t);
      expect(rings.timeline!.position).toBe(plain.timeline!.position);
      expect(rings.timeline!.group).not.toBe(plain.timeline!.group);
      expect(visibility(plain).gimbalRings).toBe(0);
      expect(visibility(rings).gimbalRings).toBe(1);
    }
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
      scene("slerp-compound-0"),
      scene("slerp-compound-0.5"),
      0.5,
    );
    expect(
      modelOrientation(compound).angleTo(interpolation(compound.t, true).euler),
    ).toBeLessThan(1e-7);
  });
  it("shows the Euler model's interpolation angles during motion and at rest", () => {
    for (const prefix of ["boundary", "slerp-compound"]) {
      const start = scene(`${prefix}-0`),
        midpoint = scene(`${prefix}-0.5`),
        end = scene(`${prefix}-1`);
      for (const state of [start, midpoint, end]) {
        expect(displayedEulerAngles(state)).toEqual(
          interpolation(state.t, state.compound).eulerAngles,
        );
      }
      for (const [from, to] of [
        [start, midpoint],
        [midpoint, end],
        [end, midpoint],
        [midpoint, start],
      ]) {
        for (const t of [0, 0.25, 0.5, 0.75, 0.999, 1]) {
          const frame = blendScene(from, to, t);
          const angles = displayedEulerAngles(frame);
          expect(
            eulerQuaternion(angles).angleTo(modelOrientation(frame)),
          ).toBeLessThan(1e-7);
          interpolation(frame.t, frame.compound).eulerAngles.forEach(
            (angle, i) => expect(angles[i]).toBeCloseTo(angle, 8),
          );
        }
      }
      const interrupted = blendScene(start, midpoint, 0.4);
      expect(displayedEulerAngles(blendScene(interrupted, end, 0))).toEqual(
        displayedEulerAngles(interrupted),
      );
    }
    expect(displayedEulerAngles(scene("boundary-0"))).toEqual([0, 0, 179]);
    expect(displayedEulerAngles(scene("boundary-0.5"))).toEqual([0, 0, 0]);
    expect(displayedEulerAngles(scene("boundary-1"))).toEqual([0, 0, -179]);
  });
  it("retargets an interrupted entrance without snapping onto the new example's path", () => {
    for (const [first, next] of [
      ["gimbal-y90", "gimbal-x30"],
      ["slerp-compound-0", "slerp-compound-0.5"],
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
