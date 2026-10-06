"use client";
import { Matrix4, Object3D, Vector3, type EulerOrder } from "three";
import {
  axisQuaternion,
  deg,
  fmt,
  gimbalAngles,
  interpolation,
  localToWorld,
  tuple,
  vectorText,
  type Triple,
} from "./math";
import { orientation, type RotationState } from "./state";
import type { Language } from "./content";

const colors = ["#f78189", "#8fd29d", "#7ea9ff", "#d8c598"];
export function Range({
  label,
  value,
  min = -180,
  max = 180,
  step = 1,
  change,
  suffix = "°",
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  change: (n: number) => void;
  suffix?: string;
}) {
  return (
    <label className="range">
      <span>
        {label}
        <output>
          {value.toFixed(step < 1 ? 2 : 0)}
          {suffix}
        </output>
      </span>
      <input
        aria-label={label}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => change(Number(e.target.value))}
      />
    </label>
  );
}
function VectorInputs({
  label,
  value,
  change,
}: {
  label: string;
  value: Triple;
  change: (v: Triple) => void;
}) {
  return (
    <fieldset className="vector-inputs">
      <legend>{label}</legend>
      {value.map((n, i) => (
        <label key={i} style={{ color: colors[i] }}>
          {"xyz"[i]}
          <input
            aria-label={`${label} ${"xyz"[i]}`}
            type="number"
            step="0.1"
            min="-8"
            max="8"
            value={Number(n.toFixed(2))}
            onChange={(e) => {
              if (!Number.isFinite(e.target.valueAsNumber)) return;
              const next = [...value] as Triple;
              next[i] = Math.max(-8, Math.min(8, e.target.valueAsNumber));
              change(next);
            }}
          />
        </label>
      ))}
    </fieldset>
  );
}
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
  patch,
  language,
}: {
  s: RotationState;
  patch: (p: Partial<RotationState>) => void;
  language: Language;
}) {
  const angles = gimbalAngles(s.t, s.locked),
    active = s.locked && s.t >= 0.5;
  return (
    <div className="angle-charts">
      <p className={active ? "lock active" : "lock"}>
        {active
          ? language === "ru"
            ? "Оси X₁ и Z₃ совпали · x + z = 0"
            : "X₁ and Z₃ coincide · x + z = 0"
          : language === "ru"
            ? "Три независимых управления"
            : "Three independent controls"}
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
            onPointerDown={(e) => {
              const bounds = e.currentTarget.getBoundingClientRect();
              patch({
                t: Math.max(
                  0,
                  Math.min(1, (e.clientX - bounds.left) / bounds.width),
                ),
              });
            }}
          >
            {s.locked && (
              <rect
                x="130"
                y="0"
                width="130"
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
                  `${(i / 80) * 260},${32 - (gimbalAngles(i / 80, s.locked)[axis] / 90) * 26}`,
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
export function Controls({
  s,
  patch,
  language,
  index,
}: {
  s: RotationState;
  patch: (p: Partial<RotationState>) => void;
  language: Language;
  index: number;
}) {
  const ru = language === "ru";
  const angles = s.panel === "gimbal" ? gimbalAngles(s.t, s.locked) : s.angles;
  const timeline =
    s.translation || s.panel === "gimbal" || s.panel === "interpolation";
  const axisInput =
    s.panel === "quaternion" ||
    s.panel === "q-matrix" ||
    (s.panel === "object" && s.input === "quaternion");
  return (
    <div className="controls">
      {s.panel === "object" && (
        <>
          <label className="select-control">
            {ru ? "Ввод ориентации" : "Orientation input"}
            <select
              aria-label="Orientation input"
              value={s.input}
              onChange={(e) => {
                const input = e.target.value as "euler" | "quaternion";
                const q = orientation(s);
                if (input === "quaternion") {
                  const angle = 2 * Math.acos(Math.max(-1, Math.min(1, q.w)));
                  const v = new Vector3(q.x, q.y, q.z);
                  patch({
                    input,
                    angle: deg(angle),
                    axis:
                      v.lengthSq() < 1e-10 ? [0, 1, 0] : tuple(v.normalize()),
                  });
                } else {
                  const object = new Object3D();
                  object.quaternion.copy(q);
                  patch({
                    input,
                    angles: [
                      deg(object.rotation.x),
                      deg(object.rotation.y),
                      deg(object.rotation.z),
                    ],
                    order: object.rotation.order,
                  });
                }
              }}
            >
              <option value="euler">Euler</option>
              <option value="quaternion">Axis → quaternion</option>
            </select>
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={s.parent}
              onChange={(e) => patch({ parent: e.target.checked })}
            />
            {ru ? "Родитель: Ry(35°)" : "Parent: Ry(35°)"}
          </label>
        </>
      )}
      {!s.local && !s.translation && (
        <VectorInputs
          label={ru ? "Точка" : "Point"}
          value={s.point}
          change={(point) => patch({ point })}
        />
      )}
      {timeline && (
        <Range
          label={ru ? "Время" : "Time"}
          value={s.t}
          min={0}
          max={1}
          step={0.001}
          suffix=""
          change={(t) => patch({ t })}
        />
      )}
      {s.panel === "gimbal" && (
        <>
          <label className="check">
            <input
              type="checkbox"
              checked={s.locked}
              onChange={(e) => patch({ locked: e.target.checked })}
            />
            {ru
              ? "Средний угол 90° (иначе 80°)"
              : "Middle angle 90° (otherwise 80°)"}
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={s.gimbalManual}
              onChange={(e) =>
                patch({
                  gimbalManual: e.target.checked,
                  angles: gimbalAngles(s.t, s.locked),
                })
              }
            />
            {ru ? "Изменять углы отдельно" : "Change angles independently"}
          </label>
          {s.gimbalManual ? (
            [0, 1, 2].map((i) => (
              <Range
                key={i}
                label={`${"xyz"[i]} angle`}
                value={s.angles[i]}
                change={(n) => {
                  const next = [...s.angles] as Triple;
                  next[i] = n;
                  patch({ angles: next });
                }}
              />
            ))
          ) : (
            <AngleCharts s={s} patch={patch} language={language} />
          )}
        </>
      )}
      {s.panel === "interpolation" && (
        <label className="check">
          <input
            type="checkbox"
            checked={s.compound}
            onChange={(e) => patch({ compound: e.target.checked })}
          />
          {ru ? "Составное вращение" : "Compound rotation"}
        </label>
      )}
      {axisInput ? (
        <>
          <VectorInputs
            label={ru ? "Ось a (нормализуется)" : "Axis a (normalized)"}
            value={s.axis}
            change={(axis) => patch({ axis })}
          />
          <Range
            label="θ"
            value={s.angle}
            min={0}
            max={360}
            change={(angle) => patch({ angle })}
          />
          {s.axis.every((n) => n === 0) && (
            <p role="alert">
              {ru
                ? "Для нулевой оси показываем единичное вращение. Задайте ненулевую ось."
                : "A zero axis shows the identity rotation. Choose a nonzero axis."}
            </p>
          )}
        </>
      ) : (
        s.local &&
        !timeline && (
          <>
            {s.panel === "axis" && (
              <label className="select-control">
                {ru ? "Ось вращения" : "Rotation axis"}
                <select
                  aria-label="Rotation axis"
                  value={s.singleAxis}
                  onChange={(e) => {
                    const singleAxis = e.target.value as "X" | "Y" | "Z";
                    const next: Triple = [0, 0, 0];
                    next["XYZ".indexOf(singleAxis)] =
                      s.angles["XYZ".indexOf(s.singleAxis)];
                    patch({ singleAxis, angles: next });
                  }}
                >
                  {["X", "Y", "Z"].map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </select>
              </label>
            )}
            {(s.dimension === 2
              ? [2]
              : s.zero || s.panel === "matrix"
                ? [0]
                : s.panel === "compute"
                  ? [2]
                  : s.panel === "axis"
                    ? ["XYZ".indexOf(s.singleAxis)]
                    : [0, 1, 2]
            ).map((i) => (
              <Range
                key={i}
                label={`${"xyz"[i]} angle`}
                value={angles[i]}
                change={(n) => {
                  const next = [...s.angles] as Triple;
                  next[i] = n;
                  patch({ angles: next });
                }}
              />
            ))}
            {(s.panel === "euler" || s.panel === "object") && (
              <label className="select-control">
                Euler order
                <select
                  aria-label="Euler order"
                  value={s.order}
                  onChange={(e) =>
                    patch({ order: e.target.value as EulerOrder })
                  }
                >
                  {["XYZ", "YXZ", "ZXY", "ZYX", "YZX", "XZY"].map((order) => (
                    <option key={order}>{order}</option>
                  ))}
                </select>
              </label>
            )}
          </>
        )
      )}
      {s.panel === "euler" && (
        <Range
          label={ru ? "Этапы композиции" : "Composition stages"}
          value={s.stage}
          min={0}
          max={1}
          step={0.001}
          suffix=""
          change={(stage) => patch({ stage })}
        />
      )}
      {index === 3 && (
        <VectorInputs
          label={ru ? "Начало O" : "Origin O"}
          value={s.origin}
          change={(origin) => patch({ origin })}
        />
      )}
      {s.zero && (
        <label className="check">
          <input
            type="checkbox"
            checked={s.axisPoint}
            onChange={(e) => patch({ axisPoint: e.target.checked })}
          />
          {ru ? "Точка (2,0,0) на оси X" : "Point (2,0,0) on X"}
        </label>
      )}
      {s.mode === "model" && (
        <label className="select-control">
          {ru ? "Геометрия" : "Geometry"}
          <select
            aria-label="Geometry display"
            value={s.surface}
            onChange={(e) =>
              patch({ surface: e.target.value as RotationState["surface"] })
            }
          >
            <option value="surface">{ru ? "Поверхность" : "Surface"}</option>
            <option value="wireframe">{ru ? "Каркас" : "Wireframe"}</option>
            <option value="vertices">{ru ? "Вершины" : "Vertices"}</option>
          </select>
        </label>
      )}
      {s.panel === "conditions" && (
        <Range
          label="Δ R[0,1]"
          value={s.shear}
          min={-1}
          max={1}
          step={0.01}
          suffix=""
          change={(shear) => patch({ shear })}
        />
      )}
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
  const world = localToWorld(p, s.origin, q);
  if (s.translation) world.set(s.point[0] + s.t, s.point[1] + s.t * 2, 0);
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
  if (s.parent) {
    const parent = new Object3D();
    parent.rotation.y = (Math.PI * 35) / 180;
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
            <details open>
              <summary>{ru ? "Компоненты базиса" : "Basis components"}</summary>
              <Matrix matrix={m} symbolic />
              <code className="code-block">{`const m = new THREE.Matrix4();\nm.set(\n  X.x, Y.x, Z.x, O.x,\n  X.y, Y.y, Z.y, O.y,\n  X.z, Y.z, Z.z, O.z,\n    0,   0,   0,   1\n);`}</code>
              <small>
                {ru
                  ? "set: по строкам · elements: по столбцам"
                  : "set: row-major · elements: column-major"}
              </small>
            </details>
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
