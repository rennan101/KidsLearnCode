// Hardware-Accelerated WebGL/GLSL Shader for Detective Fantasia & Zelda Wind Waker (3tKBDz)
// Compiles and executes real GPU shaders with procedural voronoi caustic mesh and wave apertures.

import { WATER_PALETTES } from './WaterWaveRenderer.js';

function hexToRgbVec(hex) {
  if (!hex) return [0.1, 0.5, 0.8];
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  const r = ((bigint >> 16) & 255) / 255.0;
  const g = ((bigint >> 8) & 255) / 255.0;
  const b = (bigint & 255) / 255.0;
  return [r, g, b];
}

const VERTEX_SHADER_SRC = `
  attribute vec2 a_position;
  varying vec2 v_uv;
  void main() {
    v_uv = (a_position + 1.0) * 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER_SRC = `
  precision mediump float;
  varying vec2 v_uv;

  uniform vec2 u_resolution;
  uniform vec2 u_camera;
  uniform float u_zoom;
  uniform float u_time;
  uniform int u_shaderMode; // 0 = Detective Fantasia, 1 = Zelda Wind Waker

  // Detective Fantasia Parameters
  uniform float u_aperture;     // Opening gap threshold (0.0 to 0.8)
  uniform float u_amplitude;    // Wave oscillation height (pixels)
  uniform float u_frequency;    // Spatial frequency along X
  uniform float u_speed;        // Movement speed
  uniform float u_spacing;      // Vertical distance between wave crest rows
  uniform float u_pixel_size;   // Retro pixel art resolution step (e.g. 2.0 or 3.0)

  // Zelda Wind Waker Parameters
  uniform float u_voronoiScale;    // Scale of the voronoi caustic cell network
  uniform float u_distortionSpeed; // Speed of dual-layer wave distortion

  // Biome Colors (Normalized RGB)
  uniform vec3 u_colorDeep;
  uniform vec3 u_colorBase;
  uniform vec3 u_colorShallow;
  uniform vec3 u_colorCrest;
  uniform vec3 u_colorFoam;
  uniform vec3 u_colorHighlight;

  const float TWOPI = 6.283185307;
  const float SIXPI = 18.84955592;

  // 3tKBDz Wind Waker Voronoi Circle Distance Function
  float circ(vec2 pos, vec2 c, float s) {
    c = abs(pos - c);
    c = min(c, 1.0 - c);
    return smoothstep(0.0, 0.002, sqrt(s) - sqrt(dot(c, c))) * -1.0;
  }

  // 3tKBDz Procedural Caustic Mesh Layer
  float waterlayer(vec2 uv) {
    uv = mod(uv, 1.0);
    float ret = 1.0;
    ret += circ(uv, vec2(0.37378, 0.277169), 0.0268181);
    ret += circ(uv, vec2(0.0317477, 0.540372), 0.0193742);
    ret += circ(uv, vec2(0.430044, 0.882218), 0.0232337);
    ret += circ(uv, vec2(0.641033, 0.695106), 0.0117864);
    ret += circ(uv, vec2(0.0146398, 0.0791346), 0.0299458);
    ret += circ(uv, vec2(0.43871, 0.394445), 0.0289087);
    ret += circ(uv, vec2(0.909446, 0.878141), 0.028466);
    ret += circ(uv, vec2(0.310149, 0.686637), 0.0128496);
    ret += circ(uv, vec2(0.928617, 0.195986), 0.0152041);
    ret += circ(uv, vec2(0.0438506, 0.868153), 0.0268601);
    ret += circ(uv, vec2(0.308619, 0.194937), 0.00806102);
    ret += circ(uv, vec2(0.349922, 0.449714), 0.00928667);
    ret += circ(uv, vec2(0.0449556, 0.953415), 0.023126);
    ret += circ(uv, vec2(0.117761, 0.503309), 0.0151272);
    ret += circ(uv, vec2(0.563517, 0.244991), 0.0292322);
    ret += circ(uv, vec2(0.566936, 0.954457), 0.00981141);
    ret += circ(uv, vec2(0.0489944, 0.200931), 0.0178746);
    ret += circ(uv, vec2(0.569297, 0.624893), 0.0132408);
    ret += circ(uv, vec2(0.298347, 0.710972), 0.0114426);
    ret += circ(uv, vec2(0.878141, 0.771279), 0.00322719);
    ret += circ(uv, vec2(0.150995, 0.376221), 0.00216157);
    ret += circ(uv, vec2(0.119673, 0.541984), 0.0124621);
    ret += circ(uv, vec2(0.629598, 0.295629), 0.0198736);
    ret += circ(uv, vec2(0.334357, 0.266278), 0.0187145);
    ret += circ(uv, vec2(0.918044, 0.968163), 0.0182928);
    ret += circ(uv, vec2(0.965445, 0.505026), 0.006348);
    ret += circ(uv, vec2(0.514847, 0.865444), 0.00623523);
    ret += circ(uv, vec2(0.710575, 0.0415131), 0.00322689);
    ret += circ(uv, vec2(0.71403, 0.576945), 0.0215641);
    ret += circ(uv, vec2(0.748873, 0.413325), 0.0110795);
    ret += circ(uv, vec2(0.0623365, 0.896713), 0.0236203);
    ret += circ(uv, vec2(0.980482, 0.473849), 0.00573439);
    ret += circ(uv, vec2(0.647463, 0.654349), 0.0188713);
    ret += circ(uv, vec2(0.651406, 0.981297), 0.00710875);
    ret += circ(uv, vec2(0.428928, 0.382426), 0.0298806);
    ret += circ(uv, vec2(0.811545, 0.62568), 0.00265539);
    ret += circ(uv, vec2(0.400787, 0.74162), 0.00486609);
    ret += circ(uv, vec2(0.331283, 0.418536), 0.00598028);
    ret += circ(uv, vec2(0.894762, 0.0657997), 0.00760375);
    ret += circ(uv, vec2(0.525104, 0.572233), 0.0141796);
    ret += circ(uv, vec2(0.431526, 0.911372), 0.0213234);
    ret += circ(uv, vec2(0.658212, 0.910553), 0.000741023);
    ret += circ(uv, vec2(0.514523, 0.243263), 0.0270685);
    ret += circ(uv, vec2(0.0249494, 0.252872), 0.00876653);
    ret += circ(uv, vec2(0.502214, 0.47269), 0.0234534);
    ret += circ(uv, vec2(0.693271, 0.431469), 0.0246533);
    ret += circ(uv, vec2(0.415, 0.884418), 0.0271696);
    ret += circ(uv, vec2(0.149073, 0.41204), 0.00497198);
    ret += circ(uv, vec2(0.533816, 0.897634), 0.00650833);
    ret += circ(uv, vec2(0.0409132, 0.83406), 0.0191398);
    ret += circ(uv, vec2(0.638585, 0.646019), 0.0206129);
    ret += circ(uv, vec2(0.660342, 0.966541), 0.0053511);
    ret += circ(uv, vec2(0.513783, 0.142233), 0.00471653);
    return max(ret, 0.0);
  }

  void main() {
    // 1. Pixelated Screen Space & World Space Projection
    vec2 screenCoord = v_uv * u_resolution;
    vec2 pixelatedScreen = floor(screenCoord / u_pixel_size) * u_pixel_size;
    vec2 worldPos = (pixelatedScreen / u_zoom) + u_camera;

    // --- MODE 1: ZELDA WIND WAKER (3tKBDz Cel-Shaded Voronoi Ocean) ---
    if (u_shaderMode == 1) {
      float iTime = u_time * u_distortionSpeed;
      vec2 wuv = worldPos * (0.0035 * u_voronoiScale);

      // Parallax Height Distortion
      float h1 = sin(wuv.x + iTime * 0.8);
      float h2 = sin(0.841471 * wuv.x - 0.540302 * wuv.y + iTime * 0.8);
      wuv += vec2(h1, h2) * 0.022;

      // Dual-Layer Harmonic Texture Distortion
      float d1 = mod(wuv.x + wuv.y, TWOPI) + iTime * 0.12;
      float d2 = mod((wuv.x + wuv.y + 0.25) * 1.3, SIXPI) + iTime * 0.55;
      vec2 dist = vec2(
        sin(d1) * 0.16 + sin(d2) * 0.05,
        cos(d1) * 0.16 + cos(d2) * 0.05
      );

      // Cel-Shaded Dual Water Layer Mix
      float layer1 = waterlayer(wuv + dist.xy);
      float layer2 = waterlayer(vec2(1.0) - wuv - dist.yx);

      vec3 col = mix(u_colorDeep, u_colorBase, layer1);
      col = mix(col, u_colorFoam, layer2 * 0.95);

      // Cel-Shaded Stepped Highlights
      if (layer2 > 0.65) {
        col = u_colorHighlight;
      }

      gl_FragColor = vec4(col, 1.0);
      return;
    }

    // --- MODE 0: DETECTIVE FANTASIA (Retro Wave Openings) ---
    float t = u_time * u_speed;
    float depthGrad = clamp(sin(worldPos.y * 0.02 + t * 0.6) * 0.5 + 0.5, 0.0, 1.0);
    vec3 color = mix(u_colorDeep, u_colorBase, depthGrad);

    float gridLine = mod(worldPos.y, 64.0);
    if (gridLine < 3.0) {
      color = mix(color, u_colorShallow, 0.4);
    }

    float waveRow = floor(worldPos.y / u_spacing);
    float rowBaseY = waveRow * u_spacing;
    float rowPhase = waveRow * 1.732;

    float sineVal = sin(worldPos.x * u_frequency + t * 2.4 + rowPhase);
    float waveCrestY = rowBaseY + sineVal * u_amplitude;
    float distToCrest = abs(worldPos.y - waveCrestY);

    float gapMask = cos(worldPos.x * (u_frequency * 0.58) - t * 1.45 + waveRow * 2.35);
    bool isClosed = gapMask >= (u_aperture * 1.6 - 0.3);

    if (isClosed) {
      if (worldPos.y > waveCrestY && distToCrest <= (u_amplitude * 0.65 + 3.0)) {
        color = mix(color, u_colorDeep, 0.75);
      }

      if (distToCrest <= 2.2) {
        color = u_colorCrest;

        if (worldPos.y <= waveCrestY || distToCrest <= 1.1) {
          color = u_colorFoam;
        }

        if (sineVal > 0.82 && mod(floor(worldPos.x / 6.0) + waveRow, 4.0) < 1.0) {
          color = u_colorHighlight;
        }
      }
    }

    gl_FragColor = vec4(color, 1.0);
  }
`;

export class WebGLWaterShader {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.gl = this.canvas.getContext('webgl', { alpha: false, depth: false, antialias: false, powerPreference: 'high-performance' }) ||
              this.canvas.getContext('experimental-webgl');
    
    this.isSupported = !!this.gl;
    this.program = null;
    this.locations = {};

    if (this.isSupported) {
      this.initShader();
    }
  }

  initShader() {
    const gl = this.gl;
    if (!gl) return;

    const createShader = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn('WebGL Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertShader = createShader(gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
    const fragShader = createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);

    if (!vertShader || !fragShader) {
      this.isSupported = false;
      return;
    }

    const program = gl.createProgram();
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn('WebGL Program link error:', gl.getProgramInfoLog(program));
      this.isSupported = false;
      return;
    }

    this.program = program;
    gl.useProgram(program);

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0
      ]),
      gl.STATIC_DRAW
    );

    const aPos = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    this.locations = {
      resolution: gl.getUniformLocation(program, 'u_resolution'),
      camera: gl.getUniformLocation(program, 'u_camera'),
      zoom: gl.getUniformLocation(program, 'u_zoom'),
      time: gl.getUniformLocation(program, 'u_time'),
      shaderMode: gl.getUniformLocation(program, 'u_shaderMode'),
      aperture: gl.getUniformLocation(program, 'u_aperture'),
      amplitude: gl.getUniformLocation(program, 'u_amplitude'),
      frequency: gl.getUniformLocation(program, 'u_frequency'),
      speed: gl.getUniformLocation(program, 'u_speed'),
      spacing: gl.getUniformLocation(program, 'u_spacing'),
      pixelSize: gl.getUniformLocation(program, 'u_pixel_size'),
      voronoiScale: gl.getUniformLocation(program, 'u_voronoiScale'),
      distortionSpeed: gl.getUniformLocation(program, 'u_distortionSpeed'),
      colorDeep: gl.getUniformLocation(program, 'u_colorDeep'),
      colorBase: gl.getUniformLocation(program, 'u_colorBase'),
      colorShallow: gl.getUniformLocation(program, 'u_colorShallow'),
      colorCrest: gl.getUniformLocation(program, 'u_colorCrest'),
      colorFoam: gl.getUniformLocation(program, 'u_colorFoam'),
      colorHighlight: gl.getUniformLocation(program, 'u_colorHighlight')
    };
  }

  /**
   * Render the WebGL water shader into the internal offscreen canvas
   */
  render(width, height, camX, camY, zoom = 1.0, timeSec = 0, config = {}) {
    if (!this.isSupported || !this.gl || !this.program) return null;
    const gl = this.gl;

    const w = Math.max(64, Math.floor(width));
    const h = Math.max(64, Math.floor(height));

    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
      gl.viewport(0, 0, w, h);
    }

    gl.useProgram(this.program);

    const isWindWaker = config.style === 'wind-waker';
    const pal = WATER_PALETTES[config.paletteId] || (isWindWaker ? {
      deep: '#0369a1',
      base: '#0284c7',
      shallow: '#38bdf8',
      crest: '#7dd3fc',
      foam: '#ffffff',
      highlight: '#ffffff'
    } : WATER_PALETTES['detective-fantasia']);

    gl.uniform2f(this.locations.resolution, w, h);
    gl.uniform2f(this.locations.camera, camX, camY);
    gl.uniform1f(this.locations.zoom, zoom || 1.0);
    gl.uniform1f(this.locations.time, timeSec || 0.0);
    gl.uniform1i(this.locations.shaderMode, isWindWaker ? 1 : 0);

    // Detective Fantasia Uniforms
    gl.uniform1f(this.locations.aperture, config.aperture !== undefined ? config.aperture : 0.35);
    gl.uniform1f(this.locations.amplitude, config.amplitude !== undefined ? config.amplitude : 3.5);
    gl.uniform1f(this.locations.frequency, config.frequency !== undefined ? config.frequency : 0.045);
    gl.uniform1f(this.locations.speed, config.speed !== undefined ? config.speed : 1.0);
    gl.uniform1f(this.locations.spacing, config.waveSpacing !== undefined ? config.waveSpacing : 18.0);
    gl.uniform1f(this.locations.pixelSize, config.pixelStep !== undefined ? config.pixelStep : 2.0);

    // Wind Waker Uniforms
    gl.uniform1f(this.locations.voronoiScale, config.voronoiScale !== undefined ? config.voronoiScale : 1.5);
    gl.uniform1f(this.locations.distortionSpeed, config.distortionSpeed !== undefined ? config.distortionSpeed : 1.6);

    gl.uniform3fv(this.locations.colorDeep, hexToRgbVec(pal.deep));
    gl.uniform3fv(this.locations.colorBase, hexToRgbVec(pal.base));
    gl.uniform3fv(this.locations.colorShallow, hexToRgbVec(pal.shallow || pal.base));
    gl.uniform3fv(this.locations.colorCrest, hexToRgbVec(pal.crest));
    gl.uniform3fv(this.locations.colorFoam, hexToRgbVec(pal.foam));
    gl.uniform3fv(this.locations.colorHighlight, hexToRgbVec(pal.highlight));

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    return this.canvas;
  }
}
