"use client";

import { useEffect } from "react";
import Link from "next/link";
import type { CourseController } from "./use-course-controller";

export function CourseControls({
  controller,
  titles,
  language,
}: {
  controller: CourseController;
  titles: string[];
  language: "en" | "ru";
}) {
  const { index, count, goTo, next, previous } = controller;
  const ru = language === "ru";
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (
        event.altKey ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        (event.target instanceof HTMLElement &&
          (event.target.matches("input,select,textarea,button") ||
            event.target.isContentEditable))
      )
        return;
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        if (event.key === "ArrowRight") next();
        else previous();
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [next, previous]);
  return (
    <footer className="player-footer">
      <div className="progress-track" aria-hidden="true">
        <div style={{ width: `${((index + 1) / count) * 100}%` }} />
      </div>
      <button className="nav-button" disabled={index === 0} onClick={previous}>
        ← <span>{ru ? "Назад" : "Previous"}</span>
      </button>
      <label className="slide-picker">
        <span className="sr-only">{ru ? "Выбрать слайд" : "Choose slide"}</span>
        <select
          aria-label="Choose slide"
          value={index}
          onChange={(e) => goTo(Number(e.target.value))}
        >
          {titles.map((title, i) => (
            <option value={i} key={i}>
              {String(i + 1).padStart(2, "0")} · {title}
            </option>
          ))}
        </select>
      </label>
      {index < count - 1 ? (
        <button className="nav-button primary" onClick={next}>
          <span>{ru ? "Далее" : "Next"}</span> →
        </button>
      ) : (
        <Link className="nav-button primary" href="/">
          {ru ? "Готово" : "Finish"} ✓
        </Link>
      )}
    </footer>
  );
}
