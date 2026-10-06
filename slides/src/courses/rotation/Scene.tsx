"use client";

import {
  Children,
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentRef,
  type RefObject,
  type ReactNode,
} from "react";
import { Canvas, events, useFrame, useThree } from "@react-three/fiber";
import { Line, OrbitControls } from "@react-three/drei";
import {
  Euler,
  BufferGeometry,
  Float32BufferAttribute,
  DoubleSide,
  Group,
  Material,
  Matrix4,
  Mesh,
  Quaternion,
  Vector3,
} from "three";
import { createSky } from "@course/sandbox/sky";
import { createKnotGeometry, modelVertex } from "./geometry";
import {
  axisQuaternion,
  interpolation,
  rad,
  tuple,
  vectorText,
  type Triple,
} from "./math";
import { displayedEulerAngles, orientation, type RotationState } from "./state";
import {
  eulerSweeps,
  gimbalTurnSweeps,
  sweepVertex,
  eulerRingFrames,
  type EulerSweep,
} from "./euler-sweeps";
import type { Language } from "./content";
import {
  comparisonOrientation,
  modelOrientation,
  rotationPath,
  visibility,
  worldPoint,
} from "./transition";

const colors = ["#f78189", "#8fd29d", "#7ea9ff"];
// Projected DOM labels have an effect-owned layer, with no secondary React roots.
const LabelPortal = createContext<RefObject<HTMLDivElement | null> | undefined>(
  undefined,
);
const FadeOpacity = createContext(1);
function Fade({ opacity, children }: { opacity: number; children: ReactNode }) {
  const inherited = useContext(FadeOpacity);
  return (
    <FadeOpacity.Provider value={inherited * opacity}>
      <group visible={opacity > 0.001} userData={{ fadeOpacity: opacity }}>
        {children}
      </group>
    </FadeOpacity.Provider>
  );
}
/** Fade existing materials without replacing geometry or the WebGL renderer. */
function SceneOpacity() {
  const bases = useMemo(
    () =>
      new WeakMap<
        Material,
        { opacity: number; transparent: boolean; depthWrite: boolean }
      >(),
    [],
  );
  useFrame(({ scene }) => {
    const visit = (object: import("three").Object3D, opacity: number) => {
      const alpha = opacity * (object.userData.fadeOpacity ?? 1);
      const material = (object as Mesh).material;
      if (material)
        for (const m of Array.isArray(material) ? material : [material]) {
          let base = bases.get(m);
          if (!base) {
            base = {
              opacity: m.opacity,
              transparent: m.transparent,
              depthWrite: m.depthWrite,
            };
            bases.set(m, base);
          }
          const transparent = base.transparent || alpha < 0.999;
          if (transparent !== m.transparent) {
            m.transparent = transparent;
            m.needsUpdate = true;
          }
          m.opacity = base.opacity * alpha;
          m.depthWrite = alpha < 0.999 ? false : base.depthWrite;
        }
      object.children.forEach((child) => visit(child, alpha));
    };
    visit(scene, 1);
  });
  return null;
}
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
  const opacity = useContext(FadeOpacity);
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
    node.style.opacity = String(opacity);
    node.replaceChildren(
      ...text.split("\n").map((line, i) => {
        const item = document.createElement(tooltip && i === 0 ? "b" : "span");
        item.textContent = line;
        return item;
      }),
    );
  }, [text, color, tooltip, opacity]);
  useFrame(({ camera, size }) => {
    if (!group.current || !element.current) return;
    group.current.updateWorldMatrix(true, false);
    projected.setFromMatrixPosition(group.current.matrixWorld).project(camera);
    let x = ((projected.x + 1) * size.width) / 2;
    let y = ((1 - projected.y) * size.height) / 2;
    if (tooltip) {
      if (element.current) {
        element.current.dataset.anchorX = String(x);
        element.current.dataset.anchorY = String(y);
      }
      x = Math.max(112, Math.min(size.width - 112, x));
      y = Math.max(125, y);
    }
    const node = element.current;
    node.style.display =
      opacity < 0.001 || projected.z < -1 || projected.z > 1 ? "none" : "";
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
  const [hovered, setHovered] = useState(false);
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
    <group
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
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
      <Fade opacity={hovered ? 1 : 0}>
        <ScreenLabel
          position={to}
          tooltip
          text={`${label ?? "v"}\n${vectorText(from)} → ${vectorText(to)}\n|v| = ${length.toFixed(2)}`}
        />
      </Fade>
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
  zOpacity = 1,
}: {
  origin: Triple;
  q: Quaternion;
  length?: number;
  world?: boolean;
  dimension?: number;
  shear?: number;
  zOpacity?: number;
}) {
  return (
    <group>
      {axes.map((a, i) => {
        const tip = new Vector3(...a).applyQuaternion(q);
        if (i === 1) tip.x += shear;
        tip.multiplyScalar(length).add(new Vector3(...origin));
        return (
          <Fade
            key={i}
            opacity={i === 2 ? zOpacity * Number(dimension === 3) : 1}
          >
            <Arrow
              from={origin}
              to={tuple(tip)}
              color={world ? "#6b819b" : colors[i]}
              label={world ? `${"XYZ"[i]}w` : "XYZ"[i]}
            />
          </Fade>
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
  changeCamera,
}: {
  state: RotationState;
  changeCamera: (camera: { position: Triple; target: Triple }) => void;
}) {
  const { camera, invalidate } = useThree();
  const ref = useRef<ComponentRef<typeof OrbitControls>>(null);
  const position = state.cameraPosition.join(","),
    target = state.cameraTarget.join(",");
  useLayoutEffect(() => {
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
      enableRotate
      minDistance={4}
      maxDistance={25}
      onEnd={() => {
        if (ref.current)
          changeCamera({
            position: tuple(camera.position),
            target: tuple(ref.current.target),
          });
      }}
    />
  );
}
function Point({
  point,
  world,
  language,
  forceTooltip = false,
}: {
  point: Triple;
  world: Triple;
  language: Language;
  forceTooltip?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <group>
      <mesh
        position={world}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.09, 24, 16]} />
        <meshStandardMaterial color="#fff1a0" roughness={0.35} />
      </mesh>
      <Fade opacity={forceTooltip || hovered ? 1 : 0}>
        <ScreenLabel
          position={world}
          tooltip
          text={`P\n${language === "ru" ? "лок." : "local"} ${vectorText(point)}\n${language === "ru" ? "мир" : "world"} ${vectorText(world)}`}
        />
      </Fade>
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
  language,
}: {
  s: RotationState;
  q: Quaternion;
  color?: string;
  position?: Triple;
  language: Language;
}) {
  const [hoverPoint, setHoverPoint] = useState<Triple | null>(null);
  const geometry = useMemo(createKnotGeometry, []);
  const weights = s.visual?.visibility ?? visibility(s);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const matrix = new Matrix4().makeRotationFromQuaternion(q);
  matrix.elements[4] += s.shear;
  if (weights.parent > 0)
    matrix.premultiply(new Matrix4().makeRotationY(rad(35 * weights.parent)));
  matrix.setPosition(new Vector3(...position));
  return (
    <group matrixAutoUpdate={false} matrix={matrix}>
      <Fade opacity={weights.cube}>
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
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoverPoint(p);
              }}
              onPointerOut={() => setHoverPoint(null)}
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
      </Fade>
      <Fade opacity={weights.model}>
        <group
          onPointerMove={(e) => {
            e.stopPropagation();
            setHoverPoint(
              tuple(e.point.clone().applyMatrix4(matrix.clone().invert())),
            );
          }}
          onPointerOut={() => setHoverPoint(null)}
        >
          <Fade opacity={weights.surface}>
            <mesh geometry={geometry} dispose={null}>
              <meshStandardMaterial
                color={color}
                roughness={0.38}
                metalness={0.15}
              />
            </mesh>
          </Fade>
          <Fade opacity={weights.wireframe}>
            <mesh geometry={geometry} dispose={null}>
              <meshStandardMaterial
                color={color}
                roughness={0.38}
                metalness={0.15}
                wireframe
              />
            </mesh>
          </Fade>
          <Fade opacity={weights.vertices}>
            <points geometry={geometry} dispose={null}>
              <pointsMaterial color={color} size={0.035} sizeAttenuation />
            </points>
          </Fade>
        </group>
      </Fade>
      {hoverPoint && (
        <Fade opacity={s.mode === "cube" ? weights.cube : weights.model}>
          <ScreenLabel
            position={hoverPoint}
            tooltip
            text={`V\n${language === "ru" ? "лок." : "local"} ${vectorText(hoverPoint)}\n${language === "ru" ? "мир" : "world"} ${vectorText(tuple(new Vector3(...hoverPoint).applyMatrix4(matrix)))}`}
          />
        </Fade>
      )}
      <Fade opacity={weights.model}>
        <mesh position={modelVertex}>
          <sphereGeometry args={[0.07, 20, 16]} />
          <meshStandardMaterial color="#fff1a0" />
        </mesh>
      </Fade>
    </group>
  );
}
/** Fixed geometry buffers let the signed angular sector grow without remounting. */
function SweptSector({
  sweep,
  radius,
  language,
}: {
  sweep: EulerSweep;
  radius: number;
  language: Language;
}) {
  const [hovered, setHovered] = useState(false);
  const geometry = useMemo(() => {
    const geometry = new BufferGeometry();
    geometry.setAttribute(
      "position",
      new Float32BufferAttribute(new Float32Array(66 * 3), 3),
    );
    geometry.setIndex(
      Array.from({ length: 64 }, (_, i) => [0, i + 1, i + 2]).flat(),
    );
    return geometry;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useLayoutEffect(() => {
    const positions = geometry.getAttribute("position");
    for (let i = 0; i <= 64; i++) {
      positions.setXYZ(
        i + 1,
        ...sweepVertex(sweep.axis, (rad(sweep.angle) * i) / 64, radius),
      );
    }
    positions.needsUpdate = true;
    geometry.computeBoundingSphere();
  }, [geometry, sweep.axis, sweep.angle, radius]);
  const color = colors["XYZ".indexOf(sweep.axis)];
  const start = sweepVertex(sweep.axis, 0, radius);
  const end = sweepVertex(sweep.axis, rad(sweep.angle), radius);
  const middle = sweepVertex(sweep.axis, rad(sweep.angle) / 2, radius * 0.8);
  return (
    <group quaternion={sweep.frame} visible={Math.abs(sweep.angle) > 0.01}>
      <mesh
        geometry={geometry}
        dispose={null}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.19}
          side={DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <Line
        points={[start, [0, 0, 0], end]}
        color={color}
        transparent
        opacity={0.55}
        lineWidth={1}
      />
      <Fade opacity={hovered ? 1 : 0}>
        <ScreenLabel
          position={middle}
          tooltip
          color={color}
          text={`R${sweep.axis.toLowerCase()} · ${sweep.angle.toFixed(2)}°\n${language === "ru" ? "Заметённый угол вокруг" : "Swept angle about"} ${sweep.axis}`}
        />
      </Fade>
    </group>
  );
}
function EulerSectors({
  s,
  language,
  comparison = false,
}: {
  s: RotationState;
  language: Language;
  comparison?: boolean;
}) {
  const order = s.order;
  const angles: Triple =
    s.panel === "gimbal"
      ? displayedEulerAngles(s)
      : s.visual
        ? (new Euler()
            .setFromQuaternion(
              comparison ? comparisonOrientation(s) : modelOrientation(s),
              order,
            )
            .toArray()
            .slice(0, 3)
            .map((n) => (Number(n) * 180) / Math.PI) as Triple)
        : displayedEulerAngles(s);
  return (
    <>
      {(s.panel === "gimbal"
        ? gimbalTurnSweeps(angles)
        : eulerSweeps(angles, order)
      ).map((sweep, i) => (
        <Fade
          key={sweep.axis}
          opacity={
            s.panel === "gimbal"
              ? (s.visual?.visibility ?? visibility(s))[`gimbal${sweep.axis}`]
              : 1
          }
        >
          <SweptSector
            sweep={sweep}
            radius={s.panel === "gimbal" ? 2.15 : 2.15 - i * 0.2}
            language={language}
          />
        </Fade>
      ))}
    </>
  );
}
/** Remember the first Euler axis while the current object basis keeps turning. */
function SavedXAxis({ s }: { s: RotationState }) {
  const tip = tuple(new Vector3(...s.gimbalReferenceX).multiplyScalar(3.65));
  return (
    <>
      <Line
        points={[[0, 0, 0], tip]}
        color={colors[0]}
        dashed
        dashSize={0.16}
        gapSize={0.08}
        lineWidth={2.5}
      />
      <Label
        position={tip}
        color={colors[0]}
      >{`X₀ ${vectorText(s.gimbalReferenceX)}`}</Label>
    </>
  );
}
/** The second pass adds mounted rings without changing the authored rotations. */
function EulerRings({ s }: { s: RotationState }) {
  return (
    <>
      {eulerRingFrames(displayedEulerAngles(s)).map((ring, i) => (
        <mesh key={ring.axis} quaternion={ring.frame}>
          <torusGeometry args={[2.65 - i * 0.22, 0.035, 12, 96]} />
          <meshStandardMaterial
            color={colors["XYZ".indexOf(ring.axis)]}
            roughness={0.4}
            metalness={0.15}
          />
        </mesh>
      ))}
    </>
  );
}
function World({
  state: s,
  changeCamera,
  language,
}: {
  state: RotationState;
  changeCamera: (camera: { position: Triple; target: Triple }) => void;
  language: Language;
}) {
  const weights = s.visual?.visibility ?? visibility(s);
  const q = orientation(s),
    origin = new Vector3(...s.origin);
  const p: Triple = s.zero ? (s.axisPoint ? [2, 0, 0] : [0, 0, 0]) : s.point;
  const world = worldPoint(s);
  const comparison = s.panel === "interpolation";
  const offset: Triple = [
    s.origin[0] - 2.6 * weights.comparison,
    s.origin[1],
    s.origin[2],
  ];
  const modelQ = modelOrientation(s);
  const path = rotationPath(s);
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
      <Camera state={s} changeCamera={changeCamera} />
      <SceneOpacity />
      <Fade opacity={1 - weights.grid3D}>
        <gridHelper
          args={[16, 16, "#536c90", "#324762"]}
          rotation={[Math.PI / 2, 0, 0]}
          position={[0, 0, -0.015]}
        />
      </Fade>
      <Fade opacity={weights.grid3D}>
        <gridHelper
          args={[16, 16, "#536c90", "#324762"]}
          position={[0, -1.6, 0]}
        />
      </Fade>
      <Basis
        origin={[0, 0, 0]}
        q={new Quaternion()}
        world
        dimension={3}
        zOpacity={weights.grid3D}
        length={2.7 + 0.8 * weights.point}
      />
      <Fade opacity={weights.local}>
        <Basis
          origin={s.origin}
          q={
            weights.parent > 0
              ? axisQuaternion([0, 1, 0], 35 * weights.parent).multiply(
                  q.clone(),
                )
              : q
          }
          dimension={3}
          zOpacity={weights.grid3D}
          shear={s.shear}
        />
      </Fade>
      <Fade opacity={weights.point}>
        <>
          <Point
            point={p}
            world={tuple(world)}
            language={language}
            forceTooltip={s.pointTooltip}
          />
          <Fade opacity={weights.vector}>
            <Arrow from={s.origin} to={tuple(world)} color="#fff1a0" />
          </Fade>
          <Fade opacity={weights.arc}>
            <Line
              points={path}
              color="#ffca80"
              dashed
              dashSize={0.09}
              gapSize={0.04}
              lineWidth={2}
            />
          </Fade>
          <Fade opacity={weights.translation}>
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
          </Fade>
          <Fade opacity={weights.addends}>
            {addends.slice(0, 3).map(
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
          </Fade>
          <Label position={[s.origin[0], s.origin[1] - 0.3, s.origin[2]]}>
            T {vectorText(s.origin)}
          </Label>
        </>
      </Fade>
      <Fade opacity={1}>
        <>
          <Model
            s={s}
            q={modelQ}
            position={offset}
            color={comparison ? "#ffbd80" : "#a3e7d6"}
            language={language}
          />
          <Fade opacity={weights.cubePoint}>
            <Point
              point={s.point}
              world={tuple(
                new Vector3(...s.point).applyQuaternion(q).add(origin),
              )}
              language={language}
            />
          </Fade>
          <Fade opacity={weights.comparison}>
            <>
              <Model
                s={s}
                language={language}
                q={comparisonOrientation(s)}
                position={[2.6 * weights.comparison, 0, 0]}
              />
              <Label position={[-2.6, -1.65, 0]} color="#ffbd80">
                Euler · lerp
              </Label>
              <Label position={[2.6, -1.65, 0]} color="#a3e7d6">
                Quaternion · SLERP
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
          </Fade>
          <group position={offset}>
            <Fade opacity={weights.eulerSectors}>
              <EulerSectors s={s} language={language} />
            </Fade>
          </group>
          <group position={[2.6 * weights.comparison, 0, 0]}>
            <Fade opacity={weights.eulerSectors * weights.comparison}>
              <EulerSectors s={s} language={language} comparison />
            </Fade>
          </group>
          <Fade opacity={weights.gimbalReference}>
            <SavedXAxis s={s} />
          </Fade>
          <Fade opacity={weights.gimbalAlignment}>
            <Label position={[0, 2.9, 0]} color={colors[2]}>
              Z = X₀ = (1, 0, 0)
            </Label>
          </Fade>
          <Fade opacity={weights.gimbalRings}>
            <EulerRings s={s} />
          </Fade>
          <Fade opacity={weights.axis}>
            <Arrow
              from={tuple(
                new Vector3(...s.axis).normalize().multiplyScalar(-2.4),
              )}
              to={tuple(new Vector3(...s.axis).normalize().multiplyScalar(2.4))}
              color="#ffca80"
              label="a"
            />
          </Fade>
          <Fade opacity={weights.parent}>
            <Basis
              origin={[0, 0, 0]}
              q={axisQuaternion([0, 1, 0], 35)}
              length={2.6}
            />
          </Fade>
        </>
      </Fade>
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
  changeCamera: (camera: { position: Triple; target: Triple }) => void;
  language: Language;
  failed: () => void;
}) {
  const portal = useRef<HTMLDivElement>(null);
  return (
    <div className="rotation-canvas">
      <div ref={portal} className="scene-label-layer" />
      <Canvas
        events={(store) => ({
          ...events(store),
          // Mounted objects from other frames must not intercept visible hover targets.
          filter: (hits) =>
            hits.filter(({ object }) => {
              for (
                let node: import("three").Object3D | null = object;
                node;
                node = node.parent
              )
                if (!node.visible) return false;
              return true;
            }),
        })}
        frameloop="demand"
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: false }}
        camera={{ fov: 45, near: 0.1, far: 250 }}
        fallback={
          <div className="canvas-fallback">
            WebGL is unavailable. You can still read the lesson and use the
            frame values.
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
