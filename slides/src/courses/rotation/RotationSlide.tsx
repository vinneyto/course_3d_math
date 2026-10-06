"use client";

import {
  Component,
  createContext,
  useContext,
  useLayoutEffect,
  useCallback,
  useRef,
  useState,
  type ReactNode,
} from "react";
import dynamic from "next/dynamic";
import { useSceneTransition } from "./use-scene-transition";
import { initialState, type RotationState } from "./state";
import { lessons, type Language } from "./content";
import { SnapshotSidebar } from "./SnapshotSidebar";

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

const SceneTarget = createContext<
  ((scene: Partial<RotationState>, index: number) => void) | null
>(null);

/** A React step declares its destination; the stage stays mounted outside the switch. */
export function RotationSlide({
  scene,
  index,
}: SlideProps & { scene: Partial<RotationState> }) {
  const setScene = useContext(SceneTarget);
  const signature = JSON.stringify(scene);
  useLayoutEffect(() => {
    setScene?.(JSON.parse(signature), index);
  }, [setScene, signature, index]);
  return null;
}

/** One persistent stage owns the renderer, interactive state and animated narrative. */
export function RotationStage({
  index,
  language,
  children,
}: SlideProps & { children: ReactNode }) {
  const [state, setParameters] = useState<RotationState>(initialState);
  const previous = useRef(-1);
  const authoredCamera = useRef("");
  const setScene = useCallback(
    (scene: Partial<RotationState>, step: number) => {
      previous.current = step;
      const destination = { ...initialState, ...scene };
      const cameraKey = JSON.stringify([
        destination.cameraPosition,
        destination.cameraTarget,
      ]);
      const preserveView = authoredCamera.current === cameraKey;
      authoredCamera.current = cameraKey;
      setParameters((current) =>
        preserveView
          ? {
              ...destination,
              cameraPosition: current.cameraPosition,
              cameraTarget: current.cameraTarget,
            }
          : destination,
      );
    },
    [],
  );
  const { view, transitioning } = useSceneTransition(state, previous.current);
  const [contextLost, setContextLost] = useState(false);
  const contextFailed = useCallback(() => setContextLost(true), []);
  const changeCamera = useCallback(
    (camera: {
      position: RotationState["cameraPosition"];
      target: RotationState["cameraTarget"];
    }) => {
      setParameters((current) => ({
        ...current,
        cameraPosition: camera.position,
        cameraTarget: camera.target,
      }));
    },
    [],
  );
  const ru = language === "ru";

  return (
    <SceneTarget.Provider value={setScene}>
      {children}
      <div className="player-main" data-transitioning={transitioning}>
        <section
          className="viewport"
          aria-label={ru ? "Интерактивная 3D-сцена" : "Interactive 3D scene"}
        >
          <div className="scene-top">
            <span className="scene-chip">
              <i />
              {state.dimension}D / {lessons[language][index].topicTitle}
            </span>
            <button
              className="icon-button"
              title={ru ? "Вернуть камеру" : "Reset camera"}
              aria-label="Reset camera"
              onClick={() =>
                changeCamera(
                  state.dimension === 2
                    ? { position: [1, 1, 12], target: [1, 1, 0] }
                    : { position: [6, 4, 10], target: [0, 0, 0] },
                )
              }
            >
              ↺
            </button>
          </div>
          <SceneBoundary language={language}>
            <Scene
              state={view}
              changeCamera={changeCamera}
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
                ? "Потяните: камера · Наведите: координаты"
                : "Drag: camera · Hover: coordinates"}
            </span>
          </div>
        </section>
        <SnapshotSidebar
          index={index}
          language={language}
          scene={view}
          destination={state}
        />
      </div>
    </SceneTarget.Provider>
  );
}
