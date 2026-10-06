"use client";

import {
  Children,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ComponentRef,
  type RefObject,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Line, OrbitControls } from "@react-three/drei";
import { Euler, Group, Matrix4, Quaternion, Vector3 } from "three";
import { createSky } from "@course/sandbox/sky";
import { createKnotGeometry, modelVertex } from "./geometry";
import {
  axisQuaternion,
  eulerQuaternion,
  gimbalAngles,
  interpolation,
  rad,
  tuple,
  vectorText,
  type Triple,
} from "./math";
import { orientation, type RotationState } from "./state";
import type { Language } from "./content";

const colors = ["#f78189", "#8fd29d", "#7ea9ff"];
// Projected DOM labels have an effect-owned layer, with no secondary React roots.
const LabelPortal = createContext<RefObject<HTMLDivElement | null> | undefined>(
  undefined,
);
const axes: Triple[] = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];
function ScreenLabel({
  position,
  text,
  color = "#e6eef8",
  tooltip = false,
}: {
  position: Triple;
  text: string;
  color?: string;
  tooltip?: boolean;
}) {
  const portal = useContext(LabelPortal);
  const invalidate = useThree((state) => state.invalidate);
  const group = useRef<Group>(null);
  const element = useRef<HTMLDivElement | null>(null);
  const projected = useMemo(() => new Vector3(), []);
  useEffect(() => {
    const node = document.createElement("div");
    node.style.position = "absolute";
    node.style.top = node.style.left = "0";
    node.style.pointerEvents = "none";
    portal?.current?.appendChild(node);
    element.current = node;
    invalidate();
    return () => {
      node.remove();
      element.current = null;
    };
  }, [portal, invalidate]);
  useEffect(() => {
    const node = element.current;
    if (!node) return;
    node.className = tooltip ? "point-tooltip" : "scene-label";
    node.style.color = color;
    node.replaceChildren(
      ...text.split("\n").map((line, i) => {
        const item = document.createElement(tooltip && i === 0 ? "b" : "span");
        item.textContent = line;
        return item;
      }),
    );
  }, [text, color, tooltip]);
  useFrame(({ camera, size }) => {
    if (!group.current || !element.current) return;
    group.current.updateWorldMatrix(true, false);
    projected.setFromMatrixPosition(group.current.matrixWorld).project(camera);
    let x = ((projected.x + 1) * size.width) / 2;
    let y = ((1 - projected.y) * size.height) / 2;
    if (tooltip) {
      x = Math.max(112, Math.min(size.width - 112, x));
      y = Math.max(125, y);
    }
    const node = element.current;
    node.style.display = projected.z < -1 || projected.z > 1 ? "none" : "";
    node.style.zIndex = tooltip ? "25" : "10";
    node.style.transform = `translate(${x}px, ${y}px) translate(-50%, ${tooltip ? "calc(-100% - 18px)" : "-50%"})`;
  });
  return <group ref={group} position={position} />;
}
function Label({
  position,
  children,
  color = "#e6eef8",
}: {
  position: Triple;
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <ScreenLabel
      position={position}
      color={color}
      text={Children.toArray(children).join("")}
    />
  );
}
function Arrow({
  from = [0, 0, 0],
  to,
  color,
  label,
}: {
  from?: Triple;
  to: Triple;
  color: string;
  label?: string;
}) {
  const start = new Vector3(...from),
    end = new Vector3(...to),
    direction = end.clone().sub(start);
  const length = direction.length();
  if (length < 1e-6) return null;
  const q = new Quaternion().setFromUnitVectors(
    new Vector3(0, 1, 0),
    direction.normalize(),
  );
  const head = Math.min(0.17, length * 0.2);
  return (
    <group>
      <mesh position={tuple(start.clone().lerp(end, 0.5))} quaternion={q}>
        <cylinderGeometry
          args={[0.018, 0.018, Math.max(0.001, length - head), 16]}
        />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh
        position={tuple(end.clone().addScaledVector(direction, -head * 0.5))}
        quaternion={q}
      >
        <coneGeometry args={[0.065, head, 24]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {label && (
        <Label
          position={tuple(end.clone().addScaledVector(direction, 0.16))}
          color={color}
        >
          {label}
        </Label>
      )}
    </group>
  );
}
function Basis({
  origin,
  q,
  length = 2,
  world = false,
  dimension = 3,
  shear = 0,
}: {
  origin: Triple;
  q: Quaternion;
  length?: number;
  world?: boolean;
  dimension?: number;
  shear?: number;
}) {
  return (
    <group>
      {axes.slice(0, dimension).map((a, i) => {
        const tip = new Vector3(...a).applyQuaternion(q);
        if (i === 1) tip.x += shear;
        tip.multiplyScalar(length).add(new Vector3(...origin));
        return (
          <Arrow
            key={i}
            from={origin}
            to={tuple(tip)}
            color={world ? "#6b819b" : colors[i]}
            label={world ? `${"XYZ"[i]}w` : "XYZ"[i]}
          />
        );
      })}
    </group>
  );
}
function Environment() {
  const sky = useMemo(() => createSky(), []);
  useFrame(({ camera }) => sky.follow(camera.position));
  useEffect(() => () => sky.dispose(), [sky]);
  return (
    <>
      <primitive object={sky.mesh} />
      <hemisphereLight args={[0xd9ecff, 0x182033, 1.7]} />
      <directionalLight position={[6, 9, 7]} intensity={2.8} />
    </>
  );
}
function Camera({
  state,
  patch,
}: {
  state: RotationState;
  patch: (p: Partial<RotationState>) => void;
}) {
  const { camera, invalidate } = useThree();
  const ref = useRef<ComponentRef<typeof OrbitControls>>(null);
  const position = state.cameraPosition.join(","),
    target = state.cameraTarget.join(",");
  useEffect(() => {
    camera.position.set(...state.cameraPosition);
    ref.current?.target.set(...state.cameraTarget);
    ref.current?.update();
    invalidate();
    // Coordinate keys prevent unrelated parameter changes from resetting the view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera, invalidate, position, target]);
  return (
    <OrbitControls
      ref={ref}
      makeDefault
      enableRotate={state.dimension === 3}
      minDistance={4}
      maxDistance={25}
      onEnd={() => {
        if (ref.current)
          patch({
            cameraPosition: tuple(camera.position),
            cameraTarget: tuple(ref.current.target),
          });
      }}
    />
  );
}
function Point({
  point,
  world,
  language,
  onMove,
}: {
  point: Triple;
  world: Triple;
  language: Language;
  onMove?: (p: Triple) => void;
}) {
  const dragging = useRef(false);
  const controls = useThree((state) => state.controls) as ComponentRef<
    typeof OrbitControls
  > | null;
  useEffect(
    () => () => {
      if (controls && dragging.current) controls.enabled = true;
    },
    [controls],
  );
  return (
    <group>
      <mesh
        position={world}
        onPointerDown={(e) => {
          if (!onMove) return;
          e.stopPropagation();
          dragging.current = true;
          if (controls) controls.enabled = false;
          (e.target as Element).setPointerCapture(e.pointerId);
        }}
        onPointerUp={(e) => {
          if (dragging.current) {
            dragging.current = false;
            if (controls) controls.enabled = true;
            (e.target as Element).releasePointerCapture(e.pointerId);
          }
        }}
        onPointerMove={(e) => {
          if (!dragging.current || !onMove) return;
          e.stopPropagation();
          const planeDistance = -e.ray.origin.z / e.ray.direction.z;
          if (Number.isFinite(planeDistance))
            onMove(tuple(e.ray.at(planeDistance, new Vector3())));
        }}
      >
        <sphereGeometry args={[0.09, 24, 16]} />
        <meshStandardMaterial color="#fff1a0" roughness={0.35} />
      </mesh>
      <ScreenLabel
        position={world}
        tooltip
        text={`P\n${language === "ru" ? "лок." : "local"} ${vectorText(point)}\n${language === "ru" ? "мир" : "world"} ${vectorText(world)}`}
      />
    </group>
  );
}
const cube: Triple[] = Array.from({ length: 8 }, (_, i) => [
  i & 1 ? 1 : -1,
  i & 2 ? 1 : -1,
  i & 4 ? 1 : -1,
]);
function Model({
  s,
  q,
  color = "#a3e7d6",
  position = [0, 0, 0],
  select,
}: {
  s: RotationState;
  q: Quaternion;
  color?: string;
  position?: Triple;
  select?: (point: Triple) => void;
}) {
  const geometry = useMemo(createKnotGeometry, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const matrix = new Matrix4().makeRotationFromQuaternion(q);
  matrix.elements[4] += s.shear;
  if (s.parent && s.panel === "object")
    matrix.premultiply(new Matrix4().makeRotationY(rad(35)));
  matrix.setPosition(new Vector3(...position));
  return (
    <group matrixAutoUpdate={false} matrix={matrix}>
      {s.mode === "cube" ? (
        <>
          <mesh>
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial
              color={color}
              transparent
              opacity={0.12}
              depthWrite={false}
            />
          </mesh>
          {cube.map((p, i) => (
            <mesh
              key={i}
              position={p}
              onClick={(e) => {
                e.stopPropagation();
                select?.(p);
              }}
            >
              <sphereGeometry args={[0.075, 20, 12]} />
              <meshStandardMaterial color={color} />
            </mesh>
          ))}
          {cube.flatMap((p, i) =>
            [1, 2, 4]
              .filter((bit) => (i & bit) === 0)
              .map((bit) => (
                <Line
                  key={`${i}-${bit}`}
                  points={[p, cube[i | bit]]}
                  color={color}
                  lineWidth={1.5}
                />
              )),
          )}
        </>
      ) : s.surface === "vertices" ? (
        <points geometry={geometry} dispose={null}>
          <pointsMaterial color={color} size={0.035} sizeAttenuation />
        </points>
      ) : (
        <mesh geometry={geometry} dispose={null}>
          <meshStandardMaterial
            color={color}
            roughness={0.38}
            metalness={0.15}
            wireframe={s.surface === "wireframe"}
          />
        </mesh>
      )}
      {s.mode === "model" && (
        <mesh position={modelVertex}>
          <sphereGeometry args={[0.07, 20, 16]} />
          <meshStandardMaterial color="#fff1a0" />
        </mesh>
      )}
    </group>
  );
}
function Gimbals({ s }: { s: RotationState }) {
  const [x, y, z] = (
    s.gimbalManual ? s.angles : gimbalAngles(s.t, s.locked)
  ).map(rad);
  const qx = new Quaternion().setFromEuler(new Euler(x, 0, 0));
  const qxy = new Quaternion().setFromEuler(new Euler(x, y, 0, "XYZ"));
  const active = Math.abs(Math.abs(y) - Math.PI / 2) < 1e-5;
  return (
    <>
      <Arrow
        to={[2.8, 0, 0]}
        color={active ? "#ffb966" : colors[0]}
        label="X₁"
      />
      <Arrow
        to={tuple(new Vector3(0, 2.8, 0).applyQuaternion(qx))}
        color={colors[1]}
        label="Y₂"
      />
      <Arrow
        to={tuple(new Vector3(0, 0, 3.2).applyQuaternion(qxy))}
        color={active ? "#ffb966" : colors[2]}
        label="Z₃"
      />
      <group rotation={[x, 0, 0]}>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[2.15, 0.025, 12, 80]} />
          <meshStandardMaterial color={colors[0]} />
        </mesh>
        <group rotation={[0, y, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.95, 0.025, 12, 80]} />
            <meshStandardMaterial color={colors[1]} />
          </mesh>
          <group rotation={[0, 0, z]}>
            <mesh>
              <torusGeometry args={[1.75, 0.025, 12, 80]} />
              <meshStandardMaterial color={colors[2]} />
            </mesh>
          </group>
        </group>
      </group>
    </>
  );
}
function World({
  state: s,
  patch,
  language,
}: {
  state: RotationState;
  patch: (p: Partial<RotationState>) => void;
  language: Language;
}) {
  const q = orientation(s),
    origin = new Vector3(...s.origin);
  const p: Triple = s.zero ? (s.axisPoint ? [2, 0, 0] : [0, 0, 0]) : s.point;
  const localPoint = new Vector3(...p);
  const world = localPoint.clone().applyQuaternion(q).add(origin);
  if (s.translation) world.set(s.point[0] + s.t, s.point[1] + 2 * s.t, 0);
  const comparison = s.panel === "order" || s.panel === "interpolation";
  const offset: Triple = comparison ? [-2.6, 0, 0] : s.origin;
  const modelQ = comparison
    ? s.panel === "interpolation"
      ? interpolation(s.t, s.compound).euler
      : eulerQuaternion(s.angles, "XYZ")
    : q;
  const path = Array.from({ length: 65 }, (_, i) => {
    const u = i / 64;
    const quat = eulerQuaternion(
      s.angles.map((angle) => angle * u) as Triple,
      s.order,
    );
    return tuple(localPoint.clone().applyQuaternion(quat).add(origin));
  });
  const addends = [origin.clone()];
  for (let i = 0; i < 3; i++)
    addends.push(
      addends[i]
        .clone()
        .add(new Vector3(...axes[i]).applyQuaternion(q).multiplyScalar(p[i])),
    );
  return (
    <>
      <Environment />
      <Camera state={s} patch={patch} />
      {s.dimension === 2 ? (
        <gridHelper
          args={[16, 16, "#536c90", "#324762"]}
          rotation={[Math.PI / 2, 0, 0]}
          position={[0, 0, -0.015]}
        />
      ) : (
        <gridHelper
          args={[16, 16, "#536c90", "#324762"]}
          position={[0, -1.6, 0]}
        />
      )}
      <Basis
        origin={[0, 0, 0]}
        q={new Quaternion()}
        world
        dimension={s.dimension}
        length={s.mode === "point" ? 3.5 : 2.7}
      />
      {s.local && !comparison && s.panel !== "gimbal" && (
        <Basis
          origin={s.origin}
          q={
            s.panel === "object" && s.parent
              ? axisQuaternion([0, 1, 0], 35).multiply(q.clone())
              : q
          }
          dimension={s.dimension}
          shear={s.shear}
        />
      )}
      {s.mode === "point" ? (
        <>
          <Point
            point={p}
            world={tuple(world)}
            language={language}
            onMove={
              !s.local && !s.translation
                ? (point) => patch({ point: [point[0], point[1], 0] })
                : undefined
            }
          />
          {s.local && (
            <Arrow from={s.origin} to={tuple(world)} color="#fff1a0" />
          )}
          {s.arc && !s.zero && (
            <Line
              points={path}
              color="#ffca80"
              dashed
              dashSize={0.09}
              gapSize={0.04}
              lineWidth={2}
            />
          )}
          {s.translation && (
            <>
              <Arrow
                from={s.point}
                to={[s.point[0] + 1, s.point[1] + 2, 0]}
                color="#a3e7d6"
                label="d = (1, 2, 0)"
              />
              <mesh position={s.point}>
                <sphereGeometry args={[0.06, 20, 12]} />
                <meshStandardMaterial color="#899bb4" />
              </mesh>
            </>
          )}
          {(s.panel === "basis" || s.panel === "compute") &&
            addends.slice(0, 3).map(
              (a, i) =>
                Math.abs(p[i]) > 1e-6 && (
                  <group key={i}>
                    <Arrow
                      from={tuple(a)}
                      to={tuple(addends[i + 1])}
                      color={colors[i]}
                    />
                    <Label
                      position={tuple(a.clone().lerp(addends[i + 1], 0.5))}
                      color={colors[i]}
                    >{`${"xyz"[i]}${"XYZ"[i]} = ${p[i].toFixed(1)}·${"XYZ"[i]}`}</Label>
                  </group>
                ),
            )}
          <Label position={[s.origin[0], s.origin[1] - 0.3, s.origin[2]]}>
            O {vectorText(s.origin)}
          </Label>
        </>
      ) : (
        <>
          <Model
            s={s}
            q={modelQ}
            position={offset}
            color={comparison ? "#ffbd80" : "#a3e7d6"}
            select={(point) => patch({ point })}
          />
          {s.mode === "cube" && (
            <Point
              point={s.point}
              world={tuple(
                new Vector3(...s.point).applyQuaternion(q).add(origin),
              )}
              language={language}
            />
          )}
          {comparison && (
            <>
              <Model
                s={s}
                q={s.panel === "order" ? eulerQuaternion(s.angles, "YXZ") : q}
                position={[2.6, 0, 0]}
              />
              <Label position={[-2.6, -1.65, 0]} color="#ffbd80">
                {s.panel === "order" ? "XYZ" : "Euler · lerp"}
              </Label>
              <Label position={[2.6, -1.65, 0]} color="#a3e7d6">
                {s.panel === "order" ? "YXZ" : "Quaternion · SLERP"}
              </Label>
              {s.panel === "interpolation" &&
                [false, true].map((short, i) => (
                  <Line
                    key={i}
                    points={Array.from({ length: 96 }, (_, j) => {
                      const sample = interpolation(j / 95, s.compound);
                      return tuple(
                        new Vector3(...modelVertex)
                          .applyQuaternion(short ? sample.slerp : sample.euler)
                          .add(new Vector3(short ? 2.6 : -2.6, 0, 0)),
                      );
                    })}
                    color={short ? "#a3e7d6" : "#ffbd80"}
                    lineWidth={2}
                  />
                ))}
            </>
          )}
          {s.panel === "gimbal" && <Gimbals s={s} />}
          {(s.panel === "quaternion" ||
            s.panel === "q-matrix" ||
            (s.panel === "object" && s.input === "quaternion")) && (
            <Arrow
              from={tuple(
                new Vector3(...s.axis).normalize().multiplyScalar(-2.4),
              )}
              to={tuple(new Vector3(...s.axis).normalize().multiplyScalar(2.4))}
              color="#ffca80"
              label="a"
            />
          )}
          {s.panel === "object" && s.parent && (
            <Basis
              origin={[0, 0, 0]}
              q={axisQuaternion([0, 1, 0], 35)}
              length={2.6}
            />
          )}
        </>
      )}
    </>
  );
}
function RendererLifecycle({ failed }: { failed: () => void }) {
  const gl = useThree((state) => state.gl);
  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (event: Event) => {
      event.preventDefault();
      failed();
    };
    canvas.addEventListener("webglcontextlost", lost);
    canvas.dataset.webglReady = "true";
    return () => {
      canvas.removeEventListener("webglcontextlost", lost);
      delete canvas.dataset.webglReady;
    };
  }, [gl, failed]);
  return null;
}

export default function RotationScene(props: {
  state: RotationState;
  patch: (p: Partial<RotationState>) => void;
  language: Language;
  failed: () => void;
}) {
  const portal = useRef<HTMLDivElement>(null);
  return (
    <div className="rotation-canvas">
      <div ref={portal} className="scene-label-layer" />
      <Canvas
        frameloop="demand"
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: false }}
        camera={{ fov: 45, near: 0.1, far: 250 }}
        fallback={
          <div className="canvas-fallback">
            WebGL is unavailable. You can still read the lesson and use the
            numerical controls.
          </div>
        }
      >
        <RendererLifecycle failed={props.failed} />
        <LabelPortal.Provider value={portal}>
          <World {...props} />
        </LabelPortal.Provider>
      </Canvas>
    </div>
  );
}
