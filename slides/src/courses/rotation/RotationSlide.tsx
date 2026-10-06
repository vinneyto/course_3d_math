"use client";

import {
  Component,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import dynamic from "next/dynamic";
import { initialState, type RotationState } from "./state";
import { chapterIndex, chapters, lessons, type Language } from "./content";
import { Controls, Numbers } from "./Panels";

const Scene = dynamic(() => import("./Scene"), {
  ssr: false,
  loading: () => <div className="scene-loading">Loading scene…</div>,
});

class SceneBoundary extends Component<
  { children: ReactNode; language: Language },
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

export interface SlideProps {
  index: number;
  language: Language;
}

/** The active component owns its controls, camera, playback and effect cleanup. */
export function RotationSlide({
  index,
  language,
  scene,
}: SlideProps & {
  scene: Partial<RotationState>;
}) {
  const {
    mode = initialState.mode,
    panel = initialState.panel,
    dimension = initialState.dimension,
    local = initialState.local,
    arc = initialState.arc,
    translation = initialState.translation,
    zero = initialState.zero,
    ...defaults
  } = scene;
  const [parameters, setParameters] = useState<RotationState>(() => ({
    ...initialState,
    ...defaults,
  }));
  // Features follow props immediately; interactive values belong to this instance.
  const state = {
    ...parameters,
    mode,
    panel,
    dimension,
    local,
    arc,
    translation,
    zero,
  };
  const [playing, setPlaying] = useState(false);
  const [contextLost, setContextLost] = useState(false);
  const contextFailed = useCallback(() => setContextLost(true), []);
  const time = useRef(state.t);
  const patch = useCallback((update: Partial<RotationState>) => {
    if (update.t !== undefined) time.current = update.t;
    if (update.gimbalManual) setPlaying(false);
    setParameters((current) => ({ ...current, ...update }));
  }, []);
  const timeline =
    state.translation ||
    (state.panel === "gimbal" && !state.gimbalManual) ||
    state.panel === "interpolation";
  const duration = state.panel === "gimbal" ? 8000 : 6000;
  useEffect(() => {
    if (!playing || !timeline) return;
    let frame = 0,
      last = performance.now();
    const tick = (now: number) => {
      const t = Math.min(
        1,
        time.current + Math.min(100, now - last) / duration,
      );
      last = now;
      patch({ t });
      if (t < 1) frame = requestAnimationFrame(tick);
      else setPlaying(false);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, timeline, duration, patch]);

  const ru = language === "ru",
    text = lessons[language][index];
  return (
    <div className="player-main">
      <section
        className="viewport"
        aria-label={ru ? "Интерактивная 3D-сцена" : "Interactive 3D scene"}
      >
        <div className="scene-top">
          <span className="scene-chip">
            <i />
            {state.dimension}D / {chapters[language][chapterIndex(index)]}
          </span>
          <button
            className="icon-button"
            title={ru ? "Вернуть камеру" : "Reset camera"}
            aria-label="Reset camera"
            onClick={() =>
              patch(
                state.dimension === 2
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
            state={state}
            patch={patch}
            language={language}
            failed={contextFailed}
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
              ? state.dimension === 2
                ? "Точка: перетащить · Колесо: масштаб"
                : "Потяните: орбита · Щипок: масштаб"
              : state.dimension === 2
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
          <span>
            {String(index + 1).padStart(2, "0")} / {lessons.en.length}
          </span>
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
                if (!playing && state.t >= 1) patch({ t: 0 });
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
        <Controls s={state} patch={patch} language={language} index={index} />
        <Numbers s={state} language={language} />
      </section>
    </div>
  );
}
