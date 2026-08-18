import {
  BackSide,
  Mesh,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
} from "three";

export interface Sky {
  mesh: Mesh<SphereGeometry, ShaderMaterial>;
  follow(position: Vector3): void;
  dispose(): void;
}

export function createSky(): Sky {
  const geometry = new SphereGeometry(100, 64, 32);
  const material = new ShaderMaterial({
    side: BackSide,
    depthWrite: false,
    uniforms: {
      topColor: { value: new Vector3(0.28, 0.55, 0.9) },
      horizonColor: { value: new Vector3(0.12, 0.2, 0.34) },
      bottomColor: { value: new Vector3(0.025, 0.04, 0.075) },
    },
    vertexShader: `
      varying vec3 skyDirection;

      void main() {
        skyDirection = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 horizonColor;
      uniform vec3 bottomColor;
      varying vec3 skyDirection;

      void main() {
        float height = normalize(skyDirection).y;
        vec3 lowerGradient = mix(bottomColor, horizonColor, smoothstep(-0.75, 0.05, height));
        vec3 color = mix(lowerGradient, topColor, smoothstep(0.0, 0.85, height));
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });

  const mesh = new Mesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.renderOrder = -1;

  return {
    mesh,
    follow(position: Vector3): void {
      mesh.position.copy(position);
    },
    dispose(): void {
      geometry.dispose();
      material.dispose();
    },
  };
}
