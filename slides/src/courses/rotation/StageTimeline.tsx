"use client";
import { useId, useState } from "react";
import { stepLabel, type Language } from "./content";
import type { RotationState } from "./state";
import { sequenceFor, snapshots } from "./snapshots";

/** Read-only operation timeline. Hover/focus inspects a stage; navigation selects it. */
export function StageTimeline({
  index,
  scene,
  language,
}: {
  index: number;
  scene: RotationState;
  language: Language;
}) {
  const group = sequenceFor(index);
  const [hovered, setHovered] = useState<number | null>(null);
  const tooltipId = useId();
  if (group.length < 2) return null;
  const current = group.findIndex((step) => step.id === snapshots[index].id);
  const position =
    scene.timeline &&
    scene.timeline.group === snapshots[index].scene.timeline?.group
      ? scene.timeline.position
      : current / (group.length - 1);
  const inspected = hovered === null ? undefined : group[hovered];
  return (
    <div className="stage-timeline" data-timeline-position={position}>
      <p className="panel-caption stage-timeline-title">
        {stepLabel(group[current], language)}
      </p>
      <div className="stage-timeline-track">
        <div className="stage-timeline-rail" aria-hidden="true">
          <i style={{ width: `${position * 100}%` }} />
        </div>
        <ol
          aria-label={
            language === "ru" ? "Этапы демонстрации" : "Demonstration stages"
          }
        >
          {group.map((step, i) => (
            <li
              key={step.id}
              style={{ left: `${(i / (group.length - 1)) * 100}%` }}
              className={
                i === current
                  ? "stage-current"
                  : i < current
                    ? "stage-past"
                    : ""
              }
            >
              <span
                tabIndex={0}
                data-timeline-stage={step.id}
                aria-current={i === current ? "step" : undefined}
                aria-label={stepLabel(step, language)}
                aria-describedby={hovered === i ? tooltipId : undefined}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(i)}
                onBlur={() => setHovered(null)}
              >
                <i aria-hidden="true" />
              </span>
            </li>
          ))}
        </ol>
        <div
          className="stage-timeline-playhead"
          aria-hidden="true"
          style={{ left: `${position * 100}%` }}
        />
        {inspected && (
          <div
            className="stage-timeline-tooltip"
            role="tooltip"
            id={tooltipId}
            style={{
              left: `clamp(0px, calc(${(hovered! / (group.length - 1)) * 100}% - 110px), calc(100% - 220px))`,
            }}
          >
            <strong>{stepLabel(inspected, language)}</strong>
            <span>{inspected.operation}</span>
          </div>
        )}
      </div>
    </div>
  );
}
