// Hardware-Accelerated WebGL/GLSL Shader for MinionsArt Stylized Lava
// Uses dual-layer procedural Voronoi caustic lines with harmonic wave distortion,
// converted into incandescent glowing magma cracks on dark basalt rock crust.

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
    crustDark: '#121010',      // Deep basalt obsidian
    crustLight: '#262220',     // Volcanic rock surface
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
  uniform float u_heatIntensity;

  // Thermal Color Palette
  uniform vec3 u_crustDark;
  uniform vec3 u_crustLight;
  uniform vec3 u_coolingCrimson;
  uniform vec3 u_lavaOrange;
  uniform vec3 u_lavaGold;
  uniform vec3 u_coreHot;
  uniform vec3 u_highlight;

  const float TWOPI = 6.283185307;
  const float SIXPI = 18.84955592;

  // Optimized Voronoi Circle Distance Function
  float circ(vec2 pos, vec2 c, float s) {
    c = abs(pos - c);
    c = min(c, 1.0 - c);
    float d2 = dot(c, c);
    return (d2 < s) ? smoothstep(s, s * 0.94, d2) * -1.0 : 0.0;
  }

  // Procedural Caustic / Cellular Network Layer
  float lavalayer(vec2 uv) {
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
    // 1. World Coordinate Mapping
    vec2 worldOffset = vec2(v_uv.x * u_viewportSize.x, (1.0 - v_uv.y) * u_viewportSize.y) / u_zoom;
    vec2 worldPos = u_camera + worldOffset;

    // 2. Fluid Time & Scale Calculation (MinionsArt Dual Panning & Distortion)
    float iTime = u_time * u_flowSpeed;
    vec2 wuv = worldPos * (0.0035 * u_crustScale);

    // Parallax Height Distortion
    float h1 = sin(wuv.x + iTime * 0.7);
    float h2 = sin(0.841471 * wuv.x - 0.540302 * wuv.y + iTime * 0.7);
    wuv += vec2(h1, h2) * 0.022;

    // Dual-Layer Harmonic Texture Distortion
    float d1 = mod(wuv.x + wuv.y, TWOPI) + iTime * 0.12;
    float d2 = mod((wuv.x + wuv.y + 0.25) * 1.3, SIXPI) + iTime * 0.50;
    vec2 dist = vec2(
      sin(d1) * 0.16 + sin(d2) * 0.05,
      cos(d1) * 0.16 + cos(d2) * 0.05
    );

    // 3. Dual Cellular Voronoi Caustic Layers
    float layer1 = lavalayer(wuv + dist.xy);
    float layer2 = lavalayer(vec2(1.0) - wuv - dist.yx);

    // 4. Basalt Rock vs Molten Lava Veins Composition
    // layer1 forms the dark rock plates (when close to 0) and the primary magma network (when > 0)
    // layer2 acts as the intersecting fissure and high-heat core
    vec3 col = mix(u_crustDark, u_crustLight, layer1);

    // Incandescent Fracture Lines & Ramping
    float veinValue = max(layer1, layer2);
    float coreVein = layer1 * layer2;

    // Step 1: Cooling Crimson Rim around basalt plates
    if (veinValue > 0.05) {
      float t = smoothstep(0.05, 0.35, veinValue);
      col = mix(col, u_coolingCrimson, t);
    }

    // Step 2: Flowing Molten Orange Magma
    if (veinValue > 0.30) {
      float t = smoothstep(0.30, 0.70, veinValue);
      col = mix(col, u_lavaOrange, t);
    }

    // Step 3: Bright Golden Flow & Heat Intensity
    if (veinValue > 0.65) {
      float t = smoothstep(0.65, 0.95, veinValue);
      col = mix(col, u_lavaGold, t);
    }

    // Step 4: High-Temperature Core Line (from dual layer intersection)
    if (coreVein > 0.18 || layer2 > 0.82) {
      float t = smoothstep(0.18, 0.65, coreVein);
      col = mix(col, u_coreHot, t * u_heatIntensity);
    }

    // Step 5: White-Hot Glowing Peak Highlights with subtle thermal pulsation
    float pulse = sin(iTime * 3.5 + (wuv.x + wuv.y) * 4.0) * 0.12 + 0.88;
    if (coreVein > 0.55) {
      float t = smoothstep(0.55, 0.90, coreVein);
      col = mix(col, u_highlight, t * pulse);
    }

    // Stepped cel-shaded outline on the crack borders (MinionsArt signature look)
    if (veinValue > 0.88) {
      col = mix(col, u_coreHot, 0.4);
    }

    gl_FragColor = vec4(col, 1.0);
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
    gl.uniform1f(this.locations.flowSpeed, config.flowSpeed !== undefined ? config.flowSpeed : 1.0);
    gl.uniform1f(this.locations.crustScale, config.crustScale !== undefined ? config.crustScale : 1.0);
    gl.uniform1f(this.locations.heatIntensity, config.heatIntensity !== undefined ? config.heatIntensity : 1.2);

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
