"use client";
import { useLayoutEffect, useRef, useState } from "react";
import type { RotationState } from "./state";
import { blendScene, transitionDuration } from "./transition";

export function useSceneTransition(target: RotationState, step: number) {
  const [view, setView] = useState(target);
  const current = useRef(target);
  const previousStep = useRef(step);
  const active = useRef(false);
  const generation = useRef(0);
  useLayoutEffect(() => {
    const changedStep = previousStep.current !== step;
    previousStep.current = step;
    const animated = changedStep || active.current;
    const from = current.current;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const token = ++generation.current;
    let frame = 0;
    const show = (next: RotationState) => {
      current.current = next;
      setView(next);
    };
    if (!animated || reduced) {
      active.current = false;
      show(target);
      return;
    }
    active.current = true;
    const start = performance.now();
    const tick = (now: number) => {
      if (token !== generation.current) return;
      const progress = Math.min(1, (now - start) / transitionDuration);
      show(blendScene(from, target, progress));
      if (progress < 1) frame = requestAnimationFrame(tick);
      else active.current = false;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, step]);
  return { view, transitioning: view !== target };
}
