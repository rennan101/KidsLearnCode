// Hardware-Accelerated WebGL/GLSL Shader for Stylized Animated Magma (MinionsArt Shader Logic)
// Implements dual-noise domain warping, Voronoi basalt rock crusts, incandescent cracks, and heat emission.

function hexToRgbVec(hex) {
  if (!hex) return [0.9, 0.2, 0.05];
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  const r = ((bigint >> 16) & 255) / 255.0;
  const g = ((bigint >> 8) & 255) / 255.0;
  const b = (bigint & 255) / 255.0;
  return [r, g, b];
}

export const MAGMA_PALETTES = {
  'classic-magma': {
    id: 'classic-magma',
    name: 'Magma Primordial (MinionsArt)',
    crustDark: '#18181b',      // Deep basalt obsidian
    crustLight: '#292524',     // Volcanic rock surface
    coolingCrimson: '#991b1b', // Solidifying fracture rim
    lavaOrange: '#ea580c',     // Molten lava stream
    lavaGold: '#f59e0b',       // High temperature flow
    coreHot: '#fef08a',        // Incandescent yellow core
    highlight: '#ffffff'       // White-hot heat peaks
  },
  'infernal-blood': {
    id: 'infernal-blood',
    name: 'Inferno Carmesim',
    crustDark: '#0f0505',
    crustLight: '#1f0d0d',
    coolingCrimson: '#7f1d1d',
    lavaOrange: '#dc2626',
    lavaGold: '#f87171',
    coreHot: '#fee2e2',
    highlight: '#ffffff'
  },
  'toxic-acid': {
    id: 'toxic-acid',
    name: 'Magma Tóxico / Peste Verde',
    crustDark: '#051b0f',
    crustLight: '#0d2818',
    coolingCrimson: '#047857',
    lavaOrange: '#10b981',
    lavaGold: '#34d399',
    coreHot: '#a7f3d0',
    highlight: '#ffffff'
  },
  'astral-void': {
    id: 'astral-void',
    name: 'Plasma Astral / Chama Cósmica',
    crustDark: '#0f0c1b',
    crustLight: '#1e1938',
    coolingCrimson: '#4338ca',
    lavaOrange: '#6366f1',
    lavaGold: '#a855f7',
    coreHot: '#e9d5ff',
    highlight: '#ffffff'
  }
};

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
  uniform vec2 u_viewportSize;
  uniform vec2 u_camera;
  uniform float u_zoom;
  uniform float u_time;

  // MinionsArt Magma Parameters
  uniform float u_flowSpeed;
  uniform float u_crustScale;
  uniform float u_warpStrength;
  uniform float u_heatIntensity;

  // Magma Thermal Colors
  uniform vec3 u_crustDark;
  uniform vec3 u_crustLight;
  uniform vec3 u_coolingCrimson;
  uniform vec3 u_lavaOrange;
  uniform vec3 u_lavaGold;
  uniform vec3 u_coreHot;
  uniform vec3 u_highlight;

  // 2D Simplex Noise for Domain Warping & Heat Currents
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // Fast Pseudo-Random Hash for Voronoi Seeds
  vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453);
  }

  // Voronoi Cellular Distance with Edge Separation for Basalt Crust Fractures
  vec3 voronoi(vec2 x) {
    vec2 n = floor(x);
    vec2 f = fract(x);
    vec2 mg, mr;
    float md = 8.0;

    for (int j = -1; j <= 1; j++) {
      for (int i = -1; i <= 1; i++) {
        vec2 g = vec2(float(i), float(j));
        vec2 o = hash2(n + g);
        // Subtle drift animation for crust plates
        o = 0.5 + 0.35 * sin(u_time * 0.4 + 6.2831 * o);
        vec2 r = g + o - f;
        float d = dot(r, r);
        if (d < md) {
          md = d;
          mr = r;
          mg = g;
        }
      }
    }

    // Border crack distance evaluation (F2 - F1 approximation)
    float md2 = 8.0;
    for (int j = -1; j <= 1; j++) {
      for (int i = -1; i <= 1; i++) {
        vec2 g = vec2(float(i), float(j));
        vec2 o = hash2(n + g);
        o = 0.5 + 0.35 * sin(u_time * 0.4 + 6.2831 * o);
        vec2 r = g + o - f;
        if (dot(mr - r, mr - r) > 0.00001) {
          md2 = min(md2, dot(0.5 * (mr + r), normalize(r - mr)));
        }
      }
    }
    return vec3(sqrt(md), md2, hash2(n + mg).x);
  }

  void main() {
    // 1. World Coordinate Mapping
    vec2 screenPixel = vec2(v_uv.x * u_viewportSize.x, (1.0 - v_uv.y) * u_viewportSize.y);
    vec2 worldPos = u_camera + (screenPixel / u_zoom);

    // 2. Dual-Noise Domain Warping (MinionsArt Flow Layer)
    float time = u_time * u_flowSpeed;
    vec2 baseUV = worldPos * 0.004;

    // Panning directions for flow
    vec2 flowDir1 = vec2(time * 0.025, time * 0.015);
    vec2 flowDir2 = vec2(-time * 0.018, time * 0.030);

    // Two perturbation layers for warping
    float noise1 = snoise(baseUV * 2.2 + flowDir1);
    float noise2 = snoise(baseUV * 3.4 + flowDir2);
    vec2 warp = vec2(noise1, noise2) * u_warpStrength;

    // Final Warped Coordinates for Crust & Crack Generation
    vec2 warpedUV = baseUV + warp;

    // 3. Voronoi Basalt Plate Calculation
    vec3 v = voronoi(warpedUV * u_crustScale);
    float cellDist = v.x;  // Distance to cell center
    float edgeDist = v.y;  // Distance to crack boundary
    float cellSeed = v.z;  // Unique cell random ID

    // 4. Macro Thermal Currents & Hotspots
    float macroHeat = (snoise(warpedUV * 0.9 + vec2(time * 0.02, time * 0.01)) + 1.0) * 0.5;
    float microPulse = sin(time * 2.5 + cellSeed * 6.28 + edgeDist * 12.0) * 0.18 + 0.82;

    // 5. Stylized Stepping & Thermal Color Gradient (MinionsArt Multi-Ramp)
    // Edge threshold determines how wide the incandescent cracks open
    float crackOpening = 0.12 + (macroHeat * 0.08);
    float crackIntensity = smoothstep(0.0, crackOpening, edgeDist);

    // Basalt Crust Texture variation
    float crustGrain = snoise(worldPos * 0.04) * 0.1;
    vec3 crustColor = mix(u_crustDark, u_crustLight, clamp(cellDist * 1.2 + crustGrain, 0.0, 1.0));

    // Active Magma Color in Cracks
    float heatValue = (1.0 - crackIntensity) * u_heatIntensity * microPulse;
    
    vec3 lavaColor;
    if (heatValue < 0.25) {
      // Solidifying cooling crimson edge
      float t = smoothstep(0.0, 0.25, heatValue);
      lavaColor = mix(u_coolingCrimson, u_lavaOrange, t);
    } else if (heatValue < 0.65) {
      // Flowing bright orange magma
      float t = smoothstep(0.25, 0.65, heatValue);
      lavaColor = mix(u_lavaOrange, u_lavaGold, t);
    } else if (heatValue < 0.90) {
      // High heat yellow core
      float t = smoothstep(0.65, 0.90, heatValue);
      lavaColor = mix(u_lavaGold, u_coreHot, t);
    } else {
      // Incandescent white-hot peak
      float t = smoothstep(0.90, 1.25, heatValue);
      lavaColor = mix(u_coreHot, u_highlight, t);
    }

    // Blend Basalt Plates with Incandescent Magma Fractures
    vec3 finalColor;
    if (crackIntensity > 0.92) {
      finalColor = crustColor;
    } else if (crackIntensity > 0.70) {
      float t = smoothstep(0.70, 0.92, crackIntensity);
      finalColor = mix(u_coolingCrimson, crustColor, t);
    } else {
      finalColor = lavaColor;
    }

    // Hot bubbling spots in high thermal regions
    if (macroHeat > 0.72 && edgeDist < 0.15) {
      float bubblePulse = sin(time * 4.5 + cellSeed * 20.0);
      if (bubblePulse > 0.6) {
        float bubbleIntensity = smoothstep(0.6, 1.0, bubblePulse);
        finalColor = mix(finalColor, u_coreHot, bubbleIntensity * 0.75);
      }
    }

    // Emissive Bloom / Warmth Ambient Boost
    vec3 emissiveGlow = u_lavaOrange * (1.0 - crackIntensity) * 0.22 * microPulse;
    finalColor += emissiveGlow;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export class WebGLMagmaShader {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.gl = this.canvas.getContext('webgl', {
      alpha: true,
      depth: false,
      stencil: false,
      antialias: false,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance'
    });

    this.isSupported = !!this.gl;
    this.program = null;
    this.locations = {};

    if (this.isSupported) {
      this.initShader();
    }
  }

  initShader() {
    const gl = this.gl;
    const vShader = this.compileShader(gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
    const fShader = this.compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);

    if (!vShader || !fShader) {
      this.isSupported = false;
      return;
    }

    const prog = gl.createProgram();
    gl.attachShader(prog, vShader);
    gl.attachShader(prog, fShader);
    gl.linkProgram(prog);

    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn('WebGLMagmaShader Link failed:', gl.getProgramInfoLog(prog));
      this.isSupported = false;
      return;
    }

    this.program = prog;
    gl.useProgram(prog);

    // Quad geometry covering viewport
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1
    ]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations cache
    this.locations = {
      resolution: gl.getUniformLocation(prog, 'u_resolution'),
      viewportSize: gl.getUniformLocation(prog, 'u_viewportSize'),
      camera: gl.getUniformLocation(prog, 'u_camera'),
      zoom: gl.getUniformLocation(prog, 'u_zoom'),
      time: gl.getUniformLocation(prog, 'u_time'),
      flowSpeed: gl.getUniformLocation(prog, 'u_flowSpeed'),
      crustScale: gl.getUniformLocation(prog, 'u_crustScale'),
      warpStrength: gl.getUniformLocation(prog, 'u_warpStrength'),
      heatIntensity: gl.getUniformLocation(prog, 'u_heatIntensity'),
      crustDark: gl.getUniformLocation(prog, 'u_crustDark'),
      crustLight: gl.getUniformLocation(prog, 'u_crustLight'),
      coolingCrimson: gl.getUniformLocation(prog, 'u_coolingCrimson'),
      lavaOrange: gl.getUniformLocation(prog, 'u_lavaOrange'),
      lavaGold: gl.getUniformLocation(prog, 'u_lavaGold'),
      coreHot: gl.getUniformLocation(prog, 'u_coreHot'),
      highlight: gl.getUniformLocation(prog, 'u_highlight')
    };
  }

  compileShader(type, src) {
    const gl = this.gl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn('WebGLMagmaShader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  render(width, height, camX, camY, zoom, timeSec, config = {}) {
    if (!this.isSupported || !this.gl || !this.program) return null;
    const gl = this.gl;

    const maxDim = 2048;
    const w = Math.min(width, maxDim);
    const h = Math.min(height, maxDim);

    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
      gl.viewport(0, 0, w, h);
    }

    gl.useProgram(this.program);

    const pal = MAGMA_PALETTES[config.paletteId] || MAGMA_PALETTES['classic-magma'];

    gl.uniform2f(this.locations.resolution, w, h);
    gl.uniform2f(this.locations.viewportSize, width, height);
    gl.uniform2f(this.locations.camera, camX, camY);
    gl.uniform1f(this.locations.zoom, zoom || 1.0);
    gl.uniform1f(this.locations.time, timeSec || 0.0);

    // MinionsArt Flow Parameters
    gl.uniform1f(this.locations.flowSpeed, config.flowSpeed !== undefined ? config.flowSpeed : 1.2);
    gl.uniform1f(this.locations.crustScale, config.crustScale !== undefined ? config.crustScale : 3.8);
    gl.uniform1f(this.locations.warpStrength, config.warpStrength !== undefined ? config.warpStrength : 0.35);
    gl.uniform1f(this.locations.heatIntensity, config.heatIntensity !== undefined ? config.heatIntensity : 1.15);

    // Thermal Color Ramp Uniforms
    gl.uniform3fv(this.locations.crustDark, hexToRgbVec(pal.crustDark));
    gl.uniform3fv(this.locations.crustLight, hexToRgbVec(pal.crustLight));
    gl.uniform3fv(this.locations.coolingCrimson, hexToRgbVec(pal.coolingCrimson));
    gl.uniform3fv(this.locations.lavaOrange, hexToRgbVec(pal.lavaOrange));
    gl.uniform3fv(this.locations.lavaGold, hexToRgbVec(pal.lavaGold));
    gl.uniform3fv(this.locations.coreHot, hexToRgbVec(pal.coreHot));
    gl.uniform3fv(this.locations.highlight, hexToRgbVec(pal.highlight));

    gl.drawArrays(gl.TRIANGLES, 0, 6);
    return this.canvas;
  }
}
