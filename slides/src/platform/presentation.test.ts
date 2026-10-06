import { describe, expect, it } from "vitest";
import {
  Presentation,
  reversibleSlide,
  SceneContext,
  type Slide,
} from "./presentation";

describe("sequential reversible navigation", () => {
  it("replays jumps and restores interactions at the previous boundary", async () => {
    const p = new Presentation(
      [
        reversibleSlide<{ x: number; y: number }>("one", { x: 1 }),
        reversibleSlide<{ x: number; y: number }>("two", { y: 2 }),
        reversibleSlide<{ x: number; y: number }>("three", { x: 3 }),
      ],
      { x: 0, y: 0 },
    );
    await p.goTo(0);
    p.context.patch({ x: 17 });
    await p.goTo(2);
    p.context.patch({ y: 99 });
    await p.goTo(0);
    expect(p.context.state).toEqual({ x: 17, y: 0 });
    await p.goTo(2);
    expect(p.context.state).toEqual({ x: 3, y: 2 });
  });
  it("serializes overlapping asynchronous jumps", async () => {
    const calls: string[] = [];
    const slides: Slide<SceneContext<{ x: number }>>[] = [0, 1, 2].map((i) => ({
      id: String(i),
      async apply(c) {
        calls.push(`apply ${i}`);
        await Promise.resolve();
        c.patch({ x: i });
      },
      async revert(c) {
        calls.push(`revert ${i}`);
        c.patch({ x: i - 1 });
      },
    }));
    const p = new Presentation(slides, { x: -1 });
    await Promise.all([p.goTo(2), p.goTo(0)]);
    expect(calls).toEqual([
      "apply 0",
      "apply 1",
      "apply 2",
      "revert 2",
      "revert 1",
    ]);
    expect(p.getSnapshot().index).toBe(0);
  });
  it("rolls back failed operations and allows a later retry", async () => {
    let fail = true;
    const p = new Presentation(
      [
        reversibleSlide("one", { x: 1 }),
        {
          id: "two",
          async apply(c) {
            c.patch({ x: 2 });
            if (fail) throw new Error("failure");
          },
          async revert(c) {
            c.patch({ x: 1 });
          },
        },
      ],
      { x: 0 },
    );
    await expect(p.goTo(1)).rejects.toThrow("failure");
    expect(p.getSnapshot()).toMatchObject({
      state: { x: 1 },
      index: 0,
      busy: false,
      error: "failure",
    });
    fail = false;
    await p.goTo(1);
    expect(p.getSnapshot()).toMatchObject({
      state: { x: 2 },
      index: 1,
      error: null,
    });
  });
  it("aborts pending work on disposal and rejects invalid targets", async () => {
    let signal: AbortSignal | undefined;
    let release: () => void = () => {};
    const p = new Presentation(
      [
        {
          id: "pending",
          async apply(c, s) {
            signal = s;
            await new Promise<void>((r) => {
              release = r;
            });
            c.patch({ x: 9 });
          },
          async revert() {},
        },
      ],
      { x: 0 },
    );
    const op = p.goTo(0);
    await Promise.resolve();
    p.dispose();
    release();
    await expect(op).rejects.toThrow();
    expect(signal?.aborted).toBe(true);
    expect(p.context.state).toEqual({ x: 0 });
    await expect(p.goTo(99)).rejects.toThrow(RangeError);
  });
});
