"use client";
import {
  Component,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import type {
  Presentation,
  PresentationSnapshot,
} from "../platform/presentation";
import {
  createRotationPresentation,
  initialState,
  type RotationState,
} from "../courses/rotation/state";
import { chapterIndex, chapters, lessons } from "../courses/rotation/content";
import { Controls, Numbers } from "../courses/rotation/Panels";
import { useLanguage } from "./use-language";

const Scene = dynamic(() => import("../courses/rotation/Scene"), {
  ssr: false,
  loading: () => <div className="scene-loading">Loading scene…</div>,
});
class SceneBoundary extends Component<
  { children: ReactNode; language: string },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <div className="canvas-fallback" role="status">
          {this.props.language === "ru"
            ? "WebGL недоступен. Текст и численные демонстрации продолжают работать."
            : "WebGL is unavailable. The lesson and numerical demonstrations still work."}
        </div>
      );
    return this.props.children;
  }
}
export default function PresentationPlayer() {
  const [language, changeLanguage] = useLanguage(),
    ru = language === "ru";
  const [engine, setEngine] = useState<Presentation<RotationState> | null>(
    null,
  );
  const [view, setView] = useState<PresentationSnapshot<RotationState>>({
    state: initialState,
    index: -1,
    busy: true,
    error: null,
  });
  const [playing, setPlaying] = useState(false),
    [contextLost, setContextLost] = useState(false);
  const index = Math.max(0, view.index),
    text = lessons[language][index];
  const timeline =
    view.state.translation ||
    (view.state.panel === "gimbal" && !view.state.gimbalManual) ||
    view.state.panel === "interpolation";
  useEffect(() => {
    const presentation = createRotationPresentation();
    setEngine(presentation);
    const unsubscribe = presentation.subscribe(() =>
      setView(presentation.getSnapshot()),
    );
    void presentation.goTo(0).catch(() => {});
    return () => {
      unsubscribe();
      presentation.dispose();
    };
  }, []);
  const patch = useCallback(
    (p: Partial<RotationState>) => {
      engine?.context.patch(p);
    },
    [engine],
  );
  const go = useCallback(
    (target: number) => {
      setPlaying(false);
      if (engine && target >= 0 && target < lessons.en.length)
        void engine.goTo(target).catch(() => {});
    },
    [engine],
  );
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (
        event.altKey ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        view.busy ||
        (event.target instanceof HTMLElement &&
          (event.target.matches("input,select,textarea,button") ||
            event.target.isContentEditable))
      )
        return;
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        go(index + (event.key === "ArrowRight" ? 1 : -1));
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [go, index, view.busy]);
  useEffect(() => {
    if (!playing || !engine || !timeline) return;
    let frame = 0,
      last = performance.now();
    const tick = (now: number) => {
      const t = Math.min(
        1,
        engine.context.state.t +
          Math.min(100, now - last) /
            (engine.context.state.panel === "gimbal" ? 8000 : 6000),
      );
      last = now;
      engine.context.patch({ t });
      if (t < 1) frame = requestAnimationFrame(tick);
      else setPlaying(false);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, engine, timeline]);
  const title = ru ? "Вращение в 3D" : "Rotation in 3D";
  return (
    <main className="presentation" data-slide={index + 1}>
      <header className="player-header">
        <Link href="/" className="back-link">
          ← <span>{ru ? "Все презентации" : "All presentations"}</span>
        </Link>
        <span className="course-title">{title}</span>
        <button
          className="language"
          onClick={() => changeLanguage(ru ? "en" : "ru")}
          aria-label="Change language"
        >
          {ru ? "EN" : "RU"}
        </button>
      </header>
      <div className="player-main">
        <section
          className="viewport"
          aria-label={ru ? "Интерактивная 3D-сцена" : "Interactive 3D scene"}
        >
          <div className="scene-top">
            <span className="scene-chip">
              <i />
              {view.state.dimension}D /{" "}
              {chapters[language][chapterIndex(index)]}
            </span>
            <button
              className="icon-button"
              title={ru ? "Вернуть камеру" : "Reset camera"}
              aria-label="Reset camera"
              onClick={() =>
                patch(
                  view.state.dimension === 2
                    ? { cameraPosition: [1, 1, 12], cameraTarget: [1, 1, 0] }
                    : { cameraPosition: [6, 4, 10], cameraTarget: [0, 0, 0] },
                )
              }
            >
              ↺
            </button>
          </div>
          <SceneBoundary language={language}>
            <Scene
              state={view.state}
              patch={patch}
              language={language}
              failed={() => setContextLost(true)}
            />
          </SceneBoundary>
          {contextLost && (
            <div className="context-lost" role="alert">
              {ru
                ? "Графический контекст потерян. Перезагрузите страницу."
                : "Graphics context lost. Reload the page to restore the scene."}
            </div>
          )}
          <div className="scene-bottom">
            <span className="axis-key">
              <i>X</i>
              <i>Y</i>
              <i>Z</i>
            </span>
            <span>
              {ru
                ? view.state.dimension === 2
                  ? "Точка: перетащить · Колесо: масштаб"
                  : "Потяните: орбита · Щипок: масштаб"
                : view.state.dimension === 2
                  ? "Drag point · Scroll to zoom"
                  : "Drag to orbit · Pinch to zoom"}
            </span>
          </div>
        </section>
        <section
          className="lesson"
          aria-label={ru ? "Объяснение и управления" : "Lesson and controls"}
        >
          <p className="eyebrow">
            {chapters[language][chapterIndex(index)]}{" "}
            <span>{String(index + 1).padStart(2, "0")} / 22</span>
          </p>
          <h1 aria-live="polite">{text.title}</h1>
          <p className="lesson-body">{text.body}</p>
          <div className="takeaway">
            <span>{ru ? "ИДЕЯ" : "THE IDEA"}</span>
            <p>{text.takeaway}</p>
          </div>
          <p className="try-it">{text.hint}</p>
          {timeline && (
            <div className="play-controls">
              <button
                className="play-button"
                onClick={() => {
                  if (!playing && view.state.t >= 1) patch({ t: 0 });
                  setPlaying(!playing);
                }}
              >
                {playing
                  ? ru
                    ? "Ⅱ Пауза"
                    : "Ⅱ Pause"
                  : ru
                    ? "▶ Воспроизвести"
                    : "▶ Play"}
              </button>
              <button
                className="quiet-button"
                onClick={() => {
                  setPlaying(false);
                  patch({ t: 0 });
                }}
              >
                {ru ? "В начало" : "Restart"}
              </button>
            </div>
          )}
          <Controls
            s={view.state}
            patch={patch}
            language={language}
            index={index}
          />
          <Numbers s={view.state} language={language} />
          {view.error && <p role="alert">{view.error}</p>}
        </section>
      </div>
      <footer className="player-footer">
        <div className="progress-track" aria-hidden="true">
          <div style={{ width: `${((index + 1) / 22) * 100}%` }} />
        </div>
        <button
          className="nav-button"
          disabled={view.busy || index === 0}
          onClick={() => go(index - 1)}
        >
          ← <span>{ru ? "Назад" : "Previous"}</span>
        </button>
        <label className="slide-picker">
          <span className="sr-only">
            {ru ? "Выбрать слайд" : "Choose slide"}
          </span>
          <select
            aria-label="Choose slide"
            value={index}
            disabled={view.busy}
            onChange={(e) => go(Number(e.target.value))}
          >
            {lessons[language].map((lesson, i) => (
              <option value={i} key={i}>
                {String(i + 1).padStart(2, "0")} · {lesson.title}
              </option>
            ))}
          </select>
        </label>
        {index < 21 ? (
          <button
            className="nav-button primary"
            disabled={view.busy}
            onClick={() => go(index + 1)}
          >
            <span>{ru ? "Далее" : "Next"}</span> →
          </button>
        ) : (
          <Link className="nav-button primary" href="/">
            {ru ? "Готово" : "Finish"} ✓
          </Link>
        )}
      </footer>
    </main>
  );
}
