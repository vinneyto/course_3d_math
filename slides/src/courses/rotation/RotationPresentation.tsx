"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useCourseController } from "../../platform/use-course-controller";
import { CourseControls } from "../../platform/CourseControls";
import { useLanguage } from "../../components/use-language";
import { RotationStage } from "./RotationSlide";
import { snapshots } from "./snapshots";
import { lessons } from "./content";
import {
  GimbalSlide,
  InterpolationSlide,
  ModelSlide,
  ObjectSlide,
  PointSlide,
  QuaternionSlide,
} from "./slides";

export default function RotationPresentation() {
  const controller = useCourseController(lessons.en.length);
  const [language, changeLanguage] = useLanguage();
  const ru = language === "ru";
  const { index } = controller;
  const props = { index, language };
  let slide: ReactNode;

  const snapshot = snapshots[index];
  // React selects a step; the persistent stage renders its complete snapshot.
  switch (snapshot.kind) {
    case "point":
      slide = <PointSlide {...props} scene={snapshot.scene} />;
      break;
    case "model":
      slide = <ModelSlide {...props} scene={snapshot.scene} />;
      break;
    case "gimbal":
      slide = <GimbalSlide {...props} scene={snapshot.scene} />;
      break;
    case "interpolation":
      slide = <InterpolationSlide {...props} scene={snapshot.scene} />;
      break;
    case "quaternion":
      slide = <QuaternionSlide {...props} scene={snapshot.scene} />;
      break;
    case "object":
      slide = <ObjectSlide {...props} scene={snapshot.scene} />;
      break;
  }

  return (
    <main
      className="presentation"
      data-slide={index + 1}
      data-snapshot={snapshot.id}
    >
      <header className="player-header">
        <Link href="/" className="back-link">
          ← <span>{ru ? "Все мануалы" : "All manuals"}</span>
        </Link>
        <span className="course-title">
          {ru ? "Вращение в 3D" : "Rotation in 3D"}
        </span>
        <button
          className="language"
          onClick={() => changeLanguage(ru ? "en" : "ru")}
          aria-label="Change language"
        >
          {ru ? "EN" : "RU"}
        </button>
      </header>
      <RotationStage {...props}>{slide}</RotationStage>
      <CourseControls
        controller={controller}
        titles={lessons[language].map((lesson) => lesson.navigationTitle)}
        language={language}
      />
    </main>
  );
}
