/**
 * GLSL for the moon hero. Written for THREE.ShaderMaterial (three injects the
 * matrices and attributes). Textures are sampled raw and written straight out,
 * with no color-space conversion, to match the approved reference.
 */

export const moonVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vT;
  varying vec3 vB;
  varying vec3 vView;

  void main() {
    vUv = uv;
    // Tangent along +u (longitude) for three's SphereGeometry; bitangent along +v (latitude)
    vec3 t = normalize(vec3(position.z, 0.0, -position.x) + 1e-5);
    vN = normalize(normalMatrix * normal);
    vT = normalize(normalMatrix * t);
    vB = normalize(cross(vN, vT));
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = -mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;

export const moonFragment = /* glsl */ `
  uniform sampler2D tAlbedo;
  uniform sampler2D tHeight;
  uniform vec2 uTexel;
  uniform float uBump;
  uniform float uReveal;
  uniform float uAlpha;

  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vT;
  varying vec3 vB;
  varying vec3 vView;

  void main() {
    vec3 albedo = texture2D(tAlbedo, vUv).rgb;

    // Height map -> perturbed normal (finite differences)
    float hl = texture2D(tHeight, vUv - vec2(uTexel.x, 0.0)).r;
    float hr = texture2D(tHeight, vUv + vec2(uTexel.x, 0.0)).r;
    float hd = texture2D(tHeight, vUv - vec2(0.0, uTexel.y)).r;
    float hu = texture2D(tHeight, vUv + vec2(0.0, uTexel.y)).r;
    vec3 N = normalize(vN);
    vec3 Nb = normalize(N - uBump * ((hr - hl) * normalize(vT) + (hu - hd) * normalize(vB)));
    vec3 V = normalize(vView);

    // Dim front fill shows crater relief; strong limb glow from the backlight
    float fill = 0.13 + 0.30 * max(dot(Nb, normalize(vec3(-0.35, 0.3, 0.55))), 0.0);
    float ndv = max(dot(N, V), 0.0);
    float limb = pow(1.0 - ndv, 2.8) * 1.4;
    vec3 col = albedo * fill + albedo * limb * vec3(0.95, 0.92, 0.85);

    // Diagonal reveal in view space: top-right lit first, shadow clears toward bottom-left
    float s = (N.x + N.y) * 0.25 + 0.5;
    float edge = uReveal * 1.4 - 0.2;
    col *= smoothstep(edge - 0.25, edge + 0.25, s);

    gl_FragColor = vec4(col * uAlpha, uAlpha);
  }
`;

export const haloVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const haloFragment = /* glsl */ `
  uniform float uStrength;
  uniform float uSize;
  varying vec2 vUv;

  void main() {
    float r = length(vUv - 0.5) * uSize; // distance in moon radii
    float ring = exp(-pow((r - 1.0) / 0.06, 2.0)) * 0.5;
    float haze = exp(-pow(max(r - 0.96, 0.0) * 1.5, 2.0)) * 0.2;
    float a = (ring + haze) * (1.0 - smoothstep(uSize * 0.36, uSize * 0.5, r)) * uStrength;
    gl_FragColor = vec4(vec3(0.95, 0.92, 0.85) * a, a);
  }
`;

export const starVertex = /* glsl */ `
  attribute float aSeed;
  attribute float aSize;
  uniform float uTime;
  uniform float uDpr;
  varying float vLight;

  void main() {
    vLight = 0.35 + 0.65 * (0.5 + 0.5 * sin(uTime * (0.5 + fract(aSeed) * 1.5) + aSeed));
    gl_PointSize = aSize * uDpr;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const starFragment = /* glsl */ `
  uniform float uFade;
  varying float vLight;

  void main() {
    float a = smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5)) * vLight * uFade * 0.85;
    gl_FragColor = vec4(vec3(0.93, 0.94, 1.0) * a, a);
  }
`;
