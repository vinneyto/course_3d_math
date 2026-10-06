import { RotationSlide, type SlideProps } from "./RotationSlide";
import type { RotationState } from "./state";

/** These components reuse the same R3F scene with ordinary declarative props. */
export function PointSlide({
  scene = {},
  ...props
}: SlideProps & { scene?: Partial<RotationState> }) {
  return <RotationSlide {...props} scene={{ ...scene, mode: "point" }} />;
}

export function ModelSlide({
  scene = {},
  ...props
}: SlideProps & { scene?: Partial<RotationState> }) {
  return (
    <RotationSlide
      {...props}
      scene={{
        dimension: 3,
        local: true,
        mode: "model",
        panel: "basis",
        point: [-1, -1, -1],
        angles: [20, 25, 15],
        cameraPosition: [6, 4, 8],
        cameraTarget: [0, 0, 0],
        ...scene,
      }}
    />
  );
}

export function GimbalSlide(props: SlideProps) {
  return (
    <ModelSlide
      {...props}
      scene={{ panel: "gimbal", cameraPosition: [6, 4, 11] }}
    />
  );
}

export function InterpolationSlide(props: SlideProps) {
  return (
    <ModelSlide
      {...props}
      scene={{ panel: "interpolation", cameraPosition: [3, 2, 13] }}
    />
  );
}

export function QuaternionSlide({
  matrix = false,
  ...props
}: SlideProps & { matrix?: boolean }) {
  return (
    <ModelSlide
      {...props}
      scene={{
        panel: matrix ? "q-matrix" : "quaternion",
        axis: [1, 1, 0],
        angle: 75,
      }}
    />
  );
}

export function ObjectSlide({
  summary = false,
  ...props
}: SlideProps & { summary?: boolean }) {
  return (
    <ModelSlide
      {...props}
      scene={{ panel: summary ? "summary" : "object", angles: [30, 40, 25] }}
    />
  );
}
