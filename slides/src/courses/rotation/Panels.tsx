"use client";

import { worldPoint } from "./transition";
import { Matrix4, Object3D, Vector3 } from "three";
import {
  axisQuaternion,
  deg,
  fmt,
  gimbalAngles,
  interpolation,
  tuple,
  vectorText,
  type Triple,
} from "./math";
import { displayedEulerAngles, orientation, type RotationState } from "./state";
import { StageTimeline } from "./StageTimeline";
import type { Language } from "./content";

const colors = ["#f78189", "#8fd29d", "#7ea9ff", "#d8c598"];
function Matrix({
  matrix,
  symbolic = false,
  size = 4,
}: {
  matrix: Matrix4;
  symbolic?: boolean;
  size?: 3 | 4;
}) {
  return (
    <div
      className={`matrix-grid size-${size}`}
      role="table"
      aria-label={size === 4 ? "Matrix4.set row order" : "Rotation matrix"}
    >
      {Array.from({ length: size }, (_, r) => (
        <div role="row" key={r}>
          {Array.from({ length: size }, (_, c) => (
            <span
              role="cell"
              key={c}
              style={{ color: colors[c] }}
              title={`${"XYZO"[c]}.${"xyz"[r] || "w"}`}
            >
              {symbolic && r < 3
                ? `${"XYZO"[c]}.${"xyz"[r]}`
                : fmt(matrix.elements[c * 4 + r])}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
export function AngleCharts({
  s,
  language,
}: {
  s: RotationState;
  language: Language;
}) {
  const angles =
    s.visual?.gimbalAngles ??
    (s.gimbalManual ? s.angles : gimbalAngles(s.t, s.locked));
  const active = Math.abs(angles[1] - 90) < 0.001;
  const sample = (t: number): Triple =>
    s.gimbalManual
      ? t <= 0.5
        ? [60 * t, 90, 0]
        : [30, 90, -60 * (t - 0.5)]
      : gimbalAngles(t, s.locked);
  return (
    <div className="angle-charts">
      <p className={active ? "lock active" : "lock"}>
        {active
          ? language === "ru"
            ? `Оси X₁ и Z₃ совпали · x + z = ${fmt(angles[0] + angles[2])}°`
            : `X₁ and Z₃ coincide · x + z = ${fmt(angles[0] + angles[2])}°`
          : language === "ru"
            ? "Три независимых угла"
            : "Three independent angles"}
      </p>
      {angles.map((angle, axis) => (
        <div key={axis} className="chart-row">
          <span style={{ color: colors[axis] }}>
            {"xyz"[axis]}
            <small>{fmt(angle)}°</small>
          </span>
          <svg
            viewBox="0 0 260 64"
            role="img"
            aria-label={`${"xyz"[axis]} angle over time`}
          >
            <title>{`t = ${fmt(s.t)}, ${"xyz"[axis]} = ${fmt(angle)}°`}</title>
            {s.locked && (
              <rect
                x={s.gimbalManual ? 0 : 130}
                y="0"
                width={s.gimbalManual ? 260 : 130}
                height="64"
                fill="#ffb966"
                opacity="0.08"
              />
            )}
            <path d="M0 32H260" stroke="#485972" strokeDasharray="3 3" />
            <polyline
              points={Array.from(
                { length: 81 },
                (_, i) =>
                  `${(i / 80) * 260},${32 - (sample(i / 80)[axis] / 90) * 26}`,
              ).join(" ")}
              fill="none"
              stroke={colors[axis]}
              strokeWidth="2"
            />
            <path
              d="M130 0V64"
              stroke={s.locked ? "#ffb966" : "#485972"}
              strokeDasharray="3 3"
            />
            <path d={`M${s.t * 260} 0V64`} stroke="#e7eef7" />
            <circle
              cx={s.t * 260}
              cy={32 - (angle / 90) * 26}
              r="3"
              fill={colors[axis]}
            />
          </svg>
        </div>
      ))}
      <div className="chart-times">
        <span>0</span>
        <span>y = {s.locked ? 90 : 80}°</span>
        <span>1</span>
      </div>
    </div>
  );
}
function Indicator({
  label,
  value,
  min = -180,
  max = 180,
  suffix = "°",
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  suffix?: string;
}) {
  const percent = Math.max(
    0,
    Math.min(100, ((value - min) / (max - min)) * 100),
  );
  return (
    <div
      className="snapshot-indicator"
      role="meter"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
    >
      <div>
        <span>{label}</span>
        <output>
          {fmt(value)}
          {suffix}
        </output>
      </div>
      <div className="snapshot-rail">
        <i style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
/** Values are part of the frame. No inputs or event handlers mutate the lesson. */
export function SnapshotParameters({
  s,
  language,
  index,
}: {
  s: RotationState;
  language: Language;
  index: number;
}) {
  const ru = language === "ru";
  const angles = displayedEulerAngles(s);
  const quaternion =
    s.panel === "quaternion" ||
    s.panel === "q-matrix" ||
    (s.panel === "object" && s.input === "quaternion");
  return (
    <div className="snapshot-parameters">
      <p className="panel-caption">
        {ru ? "Параметры кадра" : "Frame parameters"}
      </p>
      <dl className="snapshot-values">
        <dt>{ru ? "Геометрия" : "Geometry"}</dt>
        <dd>
          {s.mode === "model"
            ? {
                surface: ru ? "поверхность" : "surface",
                wireframe: ru ? "каркас" : "wireframe",
                vertices: ru ? "вершины" : "vertices",
              }[s.surface]
            : s.mode}
        </dd>
        <dt>{ru ? "Начало O" : "Origin O"}</dt>
        <dd>{vectorText(s.origin)}</dd>
        {(s.panel === "euler" ||
          s.panel === "order" ||
          s.panel === "object") && (
          <>
            <dt>Euler order</dt>
            <dd>{s.order}</dd>
          </>
        )}
        {s.panel === "object" && (
          <>
            <dt>{ru ? "Представление" : "Representation"}</dt>
            <dd>{s.input}</dd>
            <dt>{ru ? "Родитель" : "Parent"}</dt>
            <dd>{s.parent ? "Ry(35°)" : ru ? "нет" : "none"}</dd>
          </>
        )}
        {quaternion && (
          <>
            <dt>{ru ? "Ось a" : "Axis a"}</dt>
            <dd>{vectorText(tuple(new Vector3(...s.axis).normalize()))}</dd>
          </>
        )}
      </dl>
      {quaternion ? (
        <Indicator label="θ" value={s.angle} min={0} max={180} />
      ) : (
        s.local &&
        angles.map((value, i) => (
          <Indicator key={i} label={`${"xyz"[i]} angle`} value={value} />
        ))
      )}
      {s.panel === "conditions" && (
        <Indicator
          label="Δ R[0,1]"
          value={s.shear}
          min={-1}
          max={1}
          suffix=""
        />
      )}
      <StageTimeline index={index} scene={s} language={language} />
      {s.panel === "gimbal" && <AngleCharts s={s} language={language} />}
    </div>
  );
}
export function Numbers({
  s,
  language,
}: {
  s: RotationState;
  language: Language;
}) {
  const ru = language === "ru",
    q = orientation(s);
  const m = new Matrix4().compose(
    new Vector3(...s.origin),
    q,
    new Vector3(1, 1, 1),
  );
  m.elements[4] += s.shear;
  const p: Triple = s.zero ? (s.axisPoint ? [2, 0, 0] : [0, 0, 0]) : s.point;
  const world = worldPoint(s);
  const basis = [0, 1, 2].map((c) => new Vector3().setFromMatrixColumn(m, c));
  const showMatrix = [
    "basis",
    "matrix",
    "compute",
    "conditions",
    "q-matrix",
    "object",
    "summary",
  ].includes(s.panel);
  const showQuaternion = [
    "quaternion",
    "q-matrix",
    "object",
    "summary",
  ].includes(s.panel);
  const object = new Object3D();
  object.position.set(...s.origin);
  object.quaternion.copy(q);
  const parentWeight = s.visual?.visibility.parent ?? Number(s.parent);
  if (parentWeight > 0) {
    const parent = new Object3D();
    parent.rotation.y = (Math.PI * 35 * parentWeight) / 180;
    parent.add(object);
  }
  object.updateWorldMatrix(true, false);
  return (
    <div className="numbers">
      {(s.mode === "point" || s.mode === "cube") && (
        <div className="readouts">
          <span>
            {ru ? "Локальная P" : "Local P"}
            <b>{vectorText(p)}</b>
          </span>
          <span>
            {ru ? "Мировая P" : "World P"}
            <b>{vectorText(tuple(world))}</b>
          </span>
        </div>
      )}
      {s.panel === "basis" && (
        <div className="formula">
          pworld = O + <i style={{ color: colors[0] }}>xX</i> +{" "}
          <i style={{ color: colors[1] }}>yY</i> +{" "}
          <i style={{ color: colors[2] }}>zZ</i>
        </div>
      )}
      {showMatrix && (
        <>
          <div className="panel-caption">
            {s.panel === "q-matrix" ? "R(q)" : "localToWorld · Matrix4.set(…)"}
            <span>
              {ru ? "столбцы: X · Y · Z · O" : "columns: X · Y · Z · O"}
            </span>
          </div>
          <Matrix matrix={m} />
          {s.panel === "matrix" && (
            <div className="basis-components">
              <p className="panel-caption">
                {ru ? "Компоненты базиса" : "Basis components"}
              </p>
              <Matrix matrix={m} symbolic />
              <code className="code-block">{`const m = new THREE.Matrix4();\nm.set(\n  X.x, Y.x, Z.x, O.x,\n  X.y, Y.y, Z.y, O.y,\n  X.z, Y.z, Z.z, O.z,\n    0,   0,   0,   1\n);`}</code>
              <small>
                {ru
                  ? "set: по строкам · elements: по столбцам"
                  : "set: row-major · elements: column-major"}
              </small>
            </div>
          )}
        </>
      )}
      {s.panel === "compute" && (
        <>
          <code className="code-block">
            {"const world = local.clone()\n  .applyMatrix4(localToWorld);"}
          </code>
          <div className="expansion">
            <p>O = {vectorText(s.origin)}</p>
            {basis.map((v, i) => (
              <p key={i} style={{ color: colors[i] }}>
                {p[i]}·{"XYZ"[i]} = {vectorText(tuple(v.multiplyScalar(p[i])))}
              </p>
            ))}
            <p>= {vectorText(tuple(world))}</p>
          </div>
        </>
      )}
      {s.panel === "conditions" && (
        <div className="expansion">
          <p>|X|, |Y|, |Z| = {basis.map((v) => fmt(v.length())).join(", ")}</p>
          <p>X·Y = {fmt(basis[0].dot(basis[1]))}</p>
          <p>Y·Z = {fmt(basis[1].dot(basis[2]))}</p>
          <p>Z·X = {fmt(basis[2].dot(basis[0]))}</p>
          <p>det(R) = {fmt(m.determinant())}</p>
        </div>
      )}
      {(s.panel === "axis" || s.panel === "euler") && (
        <>
          <p className="formula">
            R = Rx(x) · Ry(y) · Rz(z) <small>(XYZ)</small>
          </p>
          <code className="code-block">
            {
              "Rx(θ) = [ 1    0       0    ]\n        [ 0  cos θ  −sin θ ]\n        [ 0  sin θ   cos θ ]\n\nRy(θ) = [ cos θ  0  sin θ ]\n        [   0    1    0   ]\n        [−sin θ  0  cos θ ]\n\nRz(θ) = [ cos θ  −sin θ  0 ]\n        [ sin θ   cos θ  0 ]\n        [   0       0    1 ]"
            }
          </code>
        </>
      )}
      {s.panel === "euler" && (
        <p className="formula">
          order = {s.order} · R ={" "}
          {s.order
            .split("")
            .map((a) => `R${a.toLowerCase()}(${a.toLowerCase()})`)
            .join(" · ")}
        </p>
      )}
      {showQuaternion && (
        <>
          <p className="formula">q = (a·sin(θ/2), cos(θ/2))</p>
          {(s.panel === "quaternion" || s.panel === "q-matrix") && (
            <small>
              a = {vectorText(tuple(new Vector3(...s.axis).normalize()))} · θ ={" "}
              {fmt(s.angle)}°
            </small>
          )}
          <div className="quaternion-values">
            {q.toArray().map((n, i) => (
              <span key={i} style={{ color: colors[i] }}>
                {"xyzw"[i]}
                <b>{fmt(n)}</b>
              </span>
            ))}
          </div>
          <small>x² + y² + z² + w² = {fmt(q.lengthSq())}</small>
        </>
      )}
      {s.panel === "q-matrix" && (
        <>
          <code className="code-block">
            {
              "R = [\n [1−2(y²+z²), 2(xy−zw), 2(xz+yw)],\n [2(xy+zw), 1−2(x²+z²), 2(yz−xw)],\n [2(xz−yw), 2(yz+xw), 1−2(x²+y²)]\n]\n\nnew THREE.Matrix4()\n  .makeRotationFromQuaternion(q);"
            }
          </code>
        </>
      )}
      {s.panel === "interpolation" && (
        <>
          <div className="readouts">
            <span>
              Euler °/t<b>{fmt(interpolation(s.t, s.compound).speedEuler)}</b>
            </span>
            <span>
              SLERP °/t<b>{fmt(interpolation(s.t, s.compound).speedSlerp)}</b>
            </span>
          </div>
          <code className="code-block">
            {"current.copy(qStart).slerp(qEnd, t);"}
          </code>
        </>
      )}
      {s.panel === "object" && (
        <>
          <code className="code-block">{`rotation = ${vectorText([deg(object.rotation.x), deg(object.rotation.y), deg(object.rotation.z)])}°\norder = ${object.rotation.order}\nposition = ${vectorText(s.origin)}\nscale = (1, 1, 1)\n\n// Choose either input:\nobject.rotation.set(x, y, z, order);\n// or object.quaternion.copy(q);\n\nobject.updateWorldMatrix(true, false);\nconst world = local.clone()\n  .applyMatrix4(object.matrixWorld);`}</code>
          <p className="panel-caption">matrixWorld</p>
          <Matrix matrix={object.matrixWorld} />
        </>
      )}
      {s.panel === "summary" && (
        <div className="summary-flow">
          Euler / axis–angle<span>↓</span>Quaternion<span>↓</span>Matrix
          <span>↓</span>
          {ru ? "Мировые вершины" : "World vertices"}
        </div>
      )}
    </div>
  );
}
