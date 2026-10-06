"use client";
import { useLayoutEffect, useRef } from "react";
import { snapshots } from "./snapshots";
import { chapterIndex, chapters, lessons, type Language } from "./content";
import type { RotationState } from "./state";
import { Numbers, SnapshotParameters } from "./Panels";

function FramePanel({
  index,
  language,
  scene,
}: {
  index: number;
  language: Language;
  scene: RotationState;
}) {
  const text = lessons[language][index];
  return (
    <>
      <p className="eyebrow">
        {chapters[language][chapterIndex(index)]}
        <span>
          {String(index + 1).padStart(2, "0")} / {lessons.en.length}
        </span>
      </p>
      <h1 aria-live="polite">{text.title}</h1>
      <p className="lesson-body">{text.body}</p>
      <div className="takeaway">
        <span>{language === "ru" ? "ИДЕЯ" : "THE IDEA"}</span>
        <p>{text.takeaway}</p>
      </div>
      <p className="try-it">{text.hint}</p>
      <SnapshotParameters s={scene} language={language} index={index} />
      <Numbers s={scene} language={language} />
    </>
  );
}

/** Sidebar content switches immediately; readouts still follow the displayed scene. */
export function SnapshotSidebar({
  index,
  language,
  scene,
  destination,
}: {
  index: number;
  language: Language;
  scene: RotationState;
  destination: RotationState;
}) {
  const panel = useRef<HTMLElement>(null);
  const snapshot = snapshots[index];
  const group = snapshot.scene.timeline?.group ?? snapshot.id;
  const previousGroup = useRef(group);
  useLayoutEffect(() => {
    if (previousGroup.current === group) return;
    previousGroup.current = group;
    const node = panel.current;
    if (!node) return;
    node.scrollTo({ top: 0, behavior: "instant" });
    // On narrow screens the document, rather than the sidebar, scrolls.
    // Keep the scene in view if the reader has not scrolled into the lesson.
    if (getComputedStyle(node).overflowY === "visible") {
      const header = node
        .closest(".presentation")
        ?.querySelector(".player-header");
      const top = Math.max(
        0,
        node.getBoundingClientRect().top +
          window.scrollY -
          (header?.getBoundingClientRect().height ?? 0),
      );
      if (window.scrollY > top) window.scrollTo({ top, behavior: "instant" });
    }
  }, [group]);
  const displayed = {
    ...scene,
    mode: destination.mode,
    panel: destination.panel,
  };
  return (
    <section
      ref={panel}
      className="lesson"
      aria-label={language === "ru" ? "Кадр мануала" : "Manual frame"}
    >
      <div className="sidebar-active" key={index}>
        <FramePanel index={index} language={language} scene={displayed} />
      </div>
    </section>
  );
}
