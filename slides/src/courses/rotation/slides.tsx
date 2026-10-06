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

type ConfiguredStep = SlideProps & { scene?: Partial<RotationState> };
export function GimbalSlide({ scene, ...props }: ConfiguredStep) {
  return (
    <ModelSlide
      {...props}
      scene={{ panel: "gimbal", cameraPosition: [6, 4, 11], ...scene }}
    />
  );
}
export function InterpolationSlide({ scene, ...props }: ConfiguredStep) {
  return (
    <ModelSlide
      {...props}
      scene={{ panel: "interpolation", cameraPosition: [3, 2, 13], ...scene }}
    />
  );
}
export function QuaternionSlide({ scene, ...props }: ConfiguredStep) {
  return (
    <ModelSlide
      {...props}
      scene={{ panel: "quaternion", axis: [1, 1, 0], angle: 75, ...scene }}
    />
  );
}
export function ObjectSlide({ scene, ...props }: ConfiguredStep) {
  return (
    <ModelSlide
      {...props}
      scene={{ panel: "object", angles: [30, 40, 25], ...scene }}
    />
  );
}
