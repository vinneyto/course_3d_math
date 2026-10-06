"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useCourseController } from "../../platform/use-course-controller";
import { CourseControls } from "../../platform/CourseControls";
import { useLanguage } from "../../components/use-language";
import { RotationStage } from "./RotationSlide";
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

  // Each step describes the full example. Direct jumps do not depend on earlier steps.
  switch (index) {
    case 0:
      slide = <PointSlide {...props} />;
      break;
    case 1:
      slide = <PointSlide {...props} scene={{ translation: true, t: 1 }} />;
      break;
    case 2:
      slide = (
        <PointSlide
          {...props}
          scene={{ local: true, arc: true, angles: [0, 0, 45] }}
        />
      );
      break;
    case 3:
      slide = (
        <PointSlide
          {...props}
          scene={{
            local: true,
            arc: true,
            angles: [0, 0, 45],
            origin: [3, 1, 0],
          }}
        />
      );
      break;
    case 4:
    case 5:
      slide = (
        <PointSlide
          {...props}
          scene={{
            dimension: 3,
            local: true,
            arc: true,
            origin: [3, 1, 0],
            panel: index === 4 ? "basis" : "matrix",
            angles: [30, 0, 0],
            point: [2, 1, 1],
            cameraPosition: [8, 6, 11],
            cameraTarget: [1, 1, 0],
          }}
        />
      );
      break;
    case 6:
      slide = (
        <PointSlide
          {...props}
          scene={{
            dimension: 3,
            local: true,
            arc: true,
            panel: "compute",
            origin: [3, 1, 0],
            angles: [0, 0, 90],
            point: [2, 1, 0],
            cameraPosition: [8, 6, 11],
            cameraTarget: [1, 1, 0],
          }}
        />
      );
      break;
    case 7:
      slide = (
        <PointSlide
          {...props}
          scene={{
            dimension: 3,
            local: true,
            arc: true,
            zero: true,
            origin: [3, 1, 0],
            angles: [45, 0, 0],
            cameraPosition: [8, 6, 11],
            cameraTarget: [1, 1, 0],
          }}
        />
      );
      break;
    case 8:
      slide = (
        <PointSlide
          {...props}
          scene={{
            dimension: 3,
            local: true,
            arc: true,
            panel: "basis",
            origin: [3, 1, 0],
            angles: [40, 0, 0],
            point: [2, 1, 1],
            cameraPosition: [8, 6, 11],
            cameraTarget: [1, 1, 0],
          }}
        />
      );
      break;
    case 9:
      slide = <ModelSlide {...props} scene={{ mode: "cube" }} />;
      break;
    case 10:
      slide = <ModelSlide {...props} />;
      break;
    case 11:
      slide = <ModelSlide {...props} scene={{ panel: "conditions" }} />;
      break;
    case 12:
      slide = (
        <ModelSlide {...props} scene={{ panel: "axis", angles: [35, 0, 0] }} />
      );
      break;
    case 13:
      slide = (
        <ModelSlide
          {...props}
          scene={{ panel: "euler", angles: [30, 40, 25] }}
        />
      );
      break;
    case 14:
      slide = (
        <ModelSlide
          {...props}
          scene={{
            panel: "order",
            angles: [30, 40, 25],
            cameraPosition: [4, 3, 13],
          }}
        />
      );
      break;
    case 15:
      slide = <GimbalSlide {...props} />;
      break;
    case 16:
    case 19:
      slide = <InterpolationSlide {...props} />;
      break;
    case 17:
    case 18:
      slide = <QuaternionSlide {...props} matrix={index === 18} />;
      break;
    case 20:
    case 21:
      slide = <ObjectSlide {...props} summary={index === 21} />;
      break;
  }

  return (
    <main className="presentation" data-slide={index + 1}>
      <header className="player-header">
        <Link href="/" className="back-link">
          ← <span>{ru ? "Все презентации" : "All presentations"}</span>
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
        titles={lessons[language].map((lesson) => lesson.title)}
        language={language}
      />
    </main>
  );
}
