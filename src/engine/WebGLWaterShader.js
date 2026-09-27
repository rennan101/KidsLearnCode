// Hardware-Accelerated WebGL/GLSL Shader for Detective Fantasia styled water & wave openings
// Compiles and runs a custom GLSL fragment shader simulating pixel-art waves with configurable aperture gaps and biomes.

import { WATER_PALETTES } from './WaterWaveRenderer.js';

function hexToRgbVec(hex) {
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

  // Wave & Opening Parameters
  uniform float u_aperture;     // Opening gap threshold (0.0 to 0.8)
  uniform float u_amplitude;    // Wave oscillation height (pixels)
  uniform float u_frequency;    // Spatial frequency along X
  uniform float u_speed;        // Movement speed
  uniform float u_spacing;      // Vertical distance between wave crest rows
  uniform float u_pixel_size;   // Retro pixel art resolution step (e.g. 2.0 or 3.0)

  // Biome Colors (Normalized RGB)
  uniform vec3 u_colorDeep;
  uniform vec3 u_colorBase;
  uniform vec3 u_colorShallow;
  uniform vec3 u_colorCrest;
  uniform vec3 u_colorFoam;
  uniform vec3 u_colorHighlight;

  void main() {
    // 1. Pixelated Screen Space & World Space Projection
    vec2 screenCoord = v_uv * u_resolution;
    vec2 pixelatedScreen = floor(screenCoord / u_pixel_size) * u_pixel_size;
    vec2 worldPos = (pixelatedScreen / u_zoom) + u_camera;

    float t = u_time * u_speed;

    // 2. Base Water Gradient & Shallow Highlights
    float depthGrad = clamp(sin(worldPos.y * 0.02 + t * 0.6) * 0.5 + 0.5, 0.0, 1.0);
    vec3 color = mix(u_colorDeep, u_colorBase, depthGrad);

    // Subtle grid/shallow water line texture
    float gridLine = mod(worldPos.y, 64.0);
    if (gridLine < 3.0) {
      color = mix(color, u_colorShallow, 0.4);
    }

    // 3. Multi-Row Wave Crest Calculations
    float waveRow = floor(worldPos.y / u_spacing);
    float rowBaseY = waveRow * u_spacing;
    float rowPhase = waveRow * 1.732;

    // Primary wave vertical offset (Sine wave)
    float sineVal = sin(worldPos.x * u_frequency + t * 2.4 + rowPhase);
    float waveCrestY = rowBaseY + sineVal * u_amplitude;
    float distToCrest = abs(worldPos.y - waveCrestY);

    // 4. Wave Aperture / Gap Mask (Cosine Modulation)
    // Controls where the wave crest is open (interrupted) or solid
    float gapMask = cos(worldPos.x * (u_frequency * 0.58) - t * 1.45 + waveRow * 2.35);
    bool isClosed = gapMask >= (u_aperture * 1.6 - 0.3);

    // 5. Foam Crest & Caustic Shadow Drawing
    if (isClosed) {
      // Underneath Caustic Shadow
      if (worldPos.y > waveCrestY && distToCrest <= (u_amplitude * 0.65 + 3.0)) {
        color = mix(color, u_colorDeep, 0.75);
      }

      // Main Crest Body
      if (distToCrest <= 2.2) {
        color = u_colorCrest;

        // Top Foam Highlight
        if (worldPos.y <= waveCrestY || distToCrest <= 1.1) {
          color = u_colorFoam;
        }

        // Peak Sparkle Diamond (Detective Fantasia sparkle effect)
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

    // 1. Compile Shaders
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

    // 2. Link Program
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

    // 3. Quad Buffer (Fullscreen 2 Triangles)
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

    // 4. Uniform Locations Cache
    this.locations = {
      resolution: gl.getUniformLocation(program, 'u_resolution'),
      camera: gl.getUniformLocation(program, 'u_camera'),
      zoom: gl.getUniformLocation(program, 'u_zoom'),
      time: gl.getUniformLocation(program, 'u_time'),
      aperture: gl.getUniformLocation(program, 'u_aperture'),
      amplitude: gl.getUniformLocation(program, 'u_amplitude'),
      frequency: gl.getUniformLocation(program, 'u_frequency'),
      speed: gl.getUniformLocation(program, 'u_speed'),
      spacing: gl.getUniformLocation(program, 'u_spacing'),
      pixelSize: gl.getUniformLocation(program, 'u_pixel_size'),
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

    const pal = WATER_PALETTES[config.paletteId] || WATER_PALETTES['detective-fantasia'];

    gl.uniform2f(this.locations.resolution, w, h);
    gl.uniform2f(this.locations.camera, camX, camY);
    gl.uniform1f(this.locations.zoom, zoom || 1.0);
    gl.uniform1f(this.locations.time, timeSec || 0.0);

    gl.uniform1f(this.locations.aperture, config.aperture !== undefined ? config.aperture : 0.35);
    gl.uniform1f(this.locations.amplitude, config.amplitude !== undefined ? config.amplitude : 3.5);
    gl.uniform1f(this.locations.frequency, config.frequency !== undefined ? config.frequency : 0.045);
    gl.uniform1f(this.locations.speed, config.speed !== undefined ? config.speed : 1.0);
    gl.uniform1f(this.locations.spacing, config.waveSpacing !== undefined ? config.waveSpacing : 18.0);
    gl.uniform1f(this.locations.pixelSize, config.pixelStep !== undefined ? config.pixelStep : 2.0);

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
