"use client";
import Link from "next/link";
import { useLanguage } from "./use-language";

export function RotationArtwork() {
  return (
    <svg viewBox="0 0 480 300" aria-hidden="true">
      <defs>
        <radialGradient id="glow">
          <stop stopColor="#284951" />
          <stop offset="1" stopColor="#111e31" />
        </radialGradient>
      </defs>
      <rect width="480" height="300" fill="url(#glow)" />
      <g stroke="#33465d" strokeWidth="1" opacity=".6">
        {Array.from({ length: 9 }, (_, i) => (
          <path key={i} d={`M${i * 60} 300L240 140M0 ${170 + i * 16}H480`} />
        ))}
      </g>
      <ellipse
        cx="240"
        cy="166"
        rx="138"
        ry="49"
        fill="none"
        stroke="#a3e7d6"
        strokeWidth="1.5"
        strokeDasharray="5 6"
        transform="rotate(-18 240 166)"
      />
      <g fill="#a3e7d6" fillOpacity=".07" stroke="#a3e7d6" strokeWidth="2">
        <path d="M185 133L254 107L309 147L241 176Z" />
        <path d="M185 133V204L241 244V176Z" />
        <path d="M241 176L309 147V217L241 244Z" />
      </g>
      <path d="M240 178H365" stroke="#f78189" strokeWidth="2" />
      <path d="M240 178V65" stroke="#8fd29d" strokeWidth="2" />
      <path d="M240 178L141 231" stroke="#7ea9ff" strokeWidth="2" />
      <g fontFamily="monospace" fontSize="14">
        <text x="374" y="183" fill="#f78189">
          X
        </text>
        <text x="237" y="54" fill="#8fd29d">
          Y
        </text>
        <text x="120" y="244" fill="#7ea9ff">
          Z
        </text>
        <text x="352" y="107" fill="#c5dedb">
          θ
        </text>
      </g>
    </svg>
  );
}
export default function Catalogue() {
  const [language, change] = useLanguage(),
    ru = language === "ru";
  return (
    <main className="catalogue">
      <header className="site-header">
        <Link href="/" className="brand">
          3D<span> / </span>MATH
        </Link>
        <button
          className="language"
          onClick={() => change(ru ? "en" : "ru")}
          aria-label="Change language"
        >
          {ru ? "EN" : "RU"}
        </button>
      </header>
      <section className="catalogue-intro">
        <p className="eyebrow">
          {ru ? "ИНТЕРАКТИВНЫЕ ПРЕЗЕНТАЦИИ" : "INTERACTIVE PRESENTATIONS"}
        </p>
        <h1>
          {ru ? (
            <>
              Математика,
              <br />
              которую можно <em>увидеть.</em>
            </>
          ) : (
            <>
              Math you can
              <br />
              <em>see and move.</em>
            </>
          )}
        </h1>
        <p>
          {ru
            ? "Исследуйте идеи в живой 3D-сцене. Один шаг, один эксперимент, одно новое понимание."
            : "Explore the ideas inside a live 3D scene. One step, one experiment, one new way to understand."}
        </p>
      </section>
      <section
        className="catalogue-grid"
        aria-label={ru ? "Демонстрации" : "Presentations"}
      >
        <Link className="course-card" href="/presentations/rotation">
          <div className="card-art">
            <RotationArtwork />
            <span className="card-badge">22 {ru ? "слайда" : "slides"}</span>
          </div>
          <div className="card-copy">
            <p className="eyebrow">
              01 / {ru ? "ПРЕОБРАЗОВАНИЯ" : "TRANSFORMATIONS"}
            </p>
            <h2>
              {ru ? "Вращение в 3D" : "Rotation in 3D"}
              <span aria-hidden="true">↗</span>
            </h2>
            <p>
              {ru
                ? "От одной точки к базисам, углам Эйлера и кватернионам."
                : "From a single point to local bases, Euler angles and quaternions."}
            </p>
            <div className="tags">
              <span>Three.js</span>
              <span>WebGL</span>
              <span>{ru ? "Практика" : "Hands-on"}</span>
            </div>
          </div>
        </Link>
      </section>
      <footer className="catalogue-footer">
        {ru
          ? "Понимание начинается с эксперимента."
          : "Understanding starts with an experiment."}
        <span>course_3d_math</span>
      </footer>
    </main>
  );
}
