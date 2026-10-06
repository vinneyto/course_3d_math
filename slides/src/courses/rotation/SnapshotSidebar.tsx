"use client";
import { useLayoutEffect, useRef, useState } from "react";
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

/** Scene and sidebar belong to the same frame; the entire previous panel fades out. */
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
  const last = useRef({ index, scene });
  const [outgoing, setOutgoing] = useState<typeof last.current | null>(null);
  const [height, setHeight] = useState<number>();
  const active = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (last.current.index === index) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setOutgoing(null);
      return;
    }
    setOutgoing(last.current);
    const timer = setTimeout(() => setOutgoing(null), 420);
    return () => clearTimeout(timer);
  }, [index]);
  useLayoutEffect(() => {
    last.current = { index, scene };
  });
  useLayoutEffect(() => {
    const measure = () =>
      setHeight(active.current?.getBoundingClientRect().height);
    const observer = new ResizeObserver(measure);
    if (active.current) observer.observe(active.current);
    measure();
    return () => observer.disconnect();
  }, [index, language]);
  const displayed = {
    ...scene,
    mode: destination.mode,
    panel: destination.panel,
  };
  return (
    <section
      className="lesson"
      aria-label={language === "ru" ? "Кадр мануала" : "Manual frame"}
    >
      <div className="sidebar-stack" style={{ height }}>
        {outgoing && (
          <div className="sidebar-outgoing" aria-hidden="true" inert>
            <FramePanel
              index={outgoing.index}
              language={language}
              scene={outgoing.scene}
            />
          </div>
        )}
        <div className="sidebar-active" ref={active} key={index}>
          <FramePanel index={index} language={language} scene={displayed} />
        </div>
      </div>
    </section>
  );
}
