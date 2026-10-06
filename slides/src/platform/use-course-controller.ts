"use client";

import { useCallback, useState } from "react";

/** React owns navigation; a jump simply selects the requested component. */
export function useCourseController(count: number) {
  const [index, setIndex] = useState(0);
  const goTo = useCallback(
    (target: number) => {
      if (Number.isInteger(target) && target >= 0 && target < count)
        setIndex(target);
    },
    [count],
  );
  const next = useCallback(() => {
    setIndex((current) => Math.min(count - 1, current + 1));
  }, [count]);
  const previous = useCallback(() => {
    setIndex((current) => Math.max(0, current - 1));
  }, []);
  return { index, count, goTo, next, previous };
}

export type CourseController = ReturnType<typeof useCourseController>;
