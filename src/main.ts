// @ts-nocheck
import Phaser from "phaser";
import "./styles.css";

const ROAD_HORIZON_ARC = 0.35;
const ROAD_HORIZON_ROUGHNESS = 0.28;

const app = document.querySelector("#app");

if (!app) {
  throw new Error("App root not found");
}

app.innerHTML = `
  <main class="app-shell">
    <section class="stage" aria-label="Área de visualização da distorção">
      <div id="phaser-root" class="phaser-runtime" aria-hidden="true"></div>
      <canvas id="warpCanvas"></canvas>
      <canvas id="guideCanvas" aria-hidden="true"></canvas>
      <div class="stage-hud">
        <span id="phaseLabel">Quadro 1</span>
        <span id="modeLabel">Estrada</span>
      </div>
    </section>

    <aside class="controls" aria-label="Controles do protótipo">
      <div class="brand-row">
        <div>
          <h1>Distorção 2D</h1>
          <p>Malha deformável para testar o caminho passando por uma curva.</p>
        </div>
      </div>

      <div class="debug-tabs" role="tablist" aria-label="Configurações de depuração">
        <button id="basicTab" class="active" type="button" data-debug-panel="basic">Básico</button>
        <button id="advancedTab" type="button" data-debug-panel="advanced">Avançado</button>
      </div>

      <div id="basicPanel" class="debug-panel active" data-panel="basic">
        <div class="control-stack">
          <label>
            <span>Quadro / progresso</span>
            <input id="phase" type="range" min="0" max="1" value="0.48" step="0.001" />
          </label>

          <label>
            <span>Altura da curva</span>
            <input id="bend" type="range" min="0" max="1" value="0.62" step="0.001" />
          </label>

          <label>
            <span>Compressão</span>
            <input id="compress" type="range" min="0" max="1" value="0.42" step="0.001" />
          </label>

          <label>
            <span>Largura da área</span>
            <input id="spread" type="range" min="0.18" max="1" value="0.56" step="0.001" />
          </label>
        </div>

        <div class="toggles">
          <label><input id="animate" type="checkbox" /> Animar</label>
          <label><input id="showGuides" type="checkbox" checked /> Guia</label>
        </div>
      </div>

      <div id="advancedPanel" class="debug-panel" data-panel="advanced"></div>
    </aside>
  </main>
`;

const desktopDebugQuery = window.matchMedia("(min-width: 900px) and (pointer: fine)");

function syncDebugVisibility() {
  const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const showDebug = isLocal && desktopDebugQuery.matches;
  document.body.classList.toggle("debug-enabled", showDebug);
  document.querySelector(".controls")?.setAttribute("aria-hidden", String(!showDebug));
  resize();
  requestRender();
}

desktopDebugQuery.addEventListener("change", syncDebugVisibility);

function required(selector) {
  const element = document.querySelector(selector);

  if (!element) {
    throw new Error(`Missing required element: ${selector}`);
  }

  return element;
}

const canvas = required("#warpCanvas");
const guideCanvas = required("#guideCanvas");
const guide = guideCanvas.getContext("2d");
const gl = canvas.getContext("webgl", { alpha: true, antialias: true });

const ui = {
  stage: required(".stage"),
  phase: required("#phase"),
  bend: required("#bend"),
  compress: required("#compress"),
  spread: required("#spread"),
  animate: required("#animate"),
  showGuides: required("#showGuides"),
  phaseLabel: required("#phaseLabel"),
  modeLabel: required("#modeLabel"),
  debugTabs: [...document.querySelectorAll("[data-debug-panel]")],
  debugPanels: [...document.querySelectorAll("[data-panel]")],
};

const state = {
  mode: "road",
  modeIndex: 3,
  rect: [1, 1],
  imageAspect: 1,
  source: null,
  textureOffset: [0, 0],
  drag: {
    active: false,
    pointerId: null,
    lastX: 0,
    lastY: 0,
  },
  needsRender: true,
  started: false,
};

const mesh = createMesh(96, 64);

if (!guide || !gl) {
  document.body.innerHTML = "<p style='padding:24px'>WebGL nao esta disponivel neste navegador.</p>";
  throw new Error("WebGL unavailable");
}

let program;
let locations;
let uvBuffer;
let indexBuffer;
let texture;

class DistortionScene extends Phaser.Scene {
  constructor() {
    super("distortion");
  }

  create() {
    startApp();
  }

  update(_time, delta) {
    tick(delta);
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  parent: "phaser-root",
  width: 1,
  height: 1,
  backgroundColor: "rgba(0,0,0,0)",
  transparent: true,
  scene: [DistortionScene],
  banner: false,
  audio: {
    noAudio: true,
  },
});

function startApp() {
  if (state.started) return;
  state.started = true;

  program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
  locations = {
    uv: gl.getAttribLocation(program, "a_uv"),
    phase: gl.getUniformLocation(program, "u_phase"),
    bend: gl.getUniformLocation(program, "u_bend"),
    compress: gl.getUniformLocation(program, "u_compress"),
    spread: gl.getUniformLocation(program, "u_spread"),
    horizonArc: gl.getUniformLocation(program, "u_horizonArc"),
    horizonRoughness: gl.getUniformLocation(program, "u_horizonRoughness"),
    mode: gl.getUniformLocation(program, "u_mode"),
    rect: gl.getUniformLocation(program, "u_rect"),
    textureOffset: gl.getUniformLocation(program, "u_textureOffset"),
    texture: gl.getUniformLocation(program, "u_texture"),
  };

  uvBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, mesh.uvs, gl.STATIC_DRAW);

  indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW);

  texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  wireUi();
  setTextureSource(createRoadSource());
  syncDebugVisibility();
}

function wireUi() {
  window.addEventListener("resize", () => {
    resize();
    requestRender();
  });

  [ui.phase, ui.bend, ui.compress, ui.spread, ui.showGuides].forEach((control) => {
    control.addEventListener("input", requestRender);
  });

  ui.animate.addEventListener("change", () => {
    requestRender();
  });

  canvas.addEventListener("pointerdown", (event) => {
    state.drag.active = true;
    state.drag.pointerId = event.pointerId;
    state.drag.lastX = event.clientX;
    state.drag.lastY = event.clientY;
    canvas.setPointerCapture(event.pointerId);
    ui.stage.classList.add("dragging");
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!state.drag.active || state.drag.pointerId !== event.pointerId) return;

    const dy = event.clientY - state.drag.lastY;
    const planeHeight = Math.max(1, canvas.clientHeight * state.rect[1] * 0.5);

    if (state.mode !== "road") {
      const dx = event.clientX - state.drag.lastX;
      const planeWidth = Math.max(1, canvas.clientWidth * state.rect[0] * 0.5);
      state.textureOffset[0] = wrapUnit(state.textureOffset[0] + dx / planeWidth);
    }

    state.textureOffset[1] = wrapUnit(state.textureOffset[1] + dy / planeHeight);
    state.drag.lastX = event.clientX;
    state.drag.lastY = event.clientY;
    requestRender();
  });

  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);

  ui.debugTabs.forEach((button) => {
    button.addEventListener("click", () => {
      setDebugPanel(button.dataset.debugPanel);
      requestRender();
    });
  });
}

function tick(delta) {
  if (ui.animate.checked) {
    const next = (Number(ui.phase.value) + Math.min(40, delta || 16) * 0.00024) % 1;
    ui.phase.value = next.toFixed(3);
    state.needsRender = true;
  }

  if (state.needsRender) {
    render();
    drawGuide();
    updateLabels();
    state.needsRender = false;
  }
}

function requestRender() {
  state.needsRender = true;
}

function updateLabels() {
  const phase = Number(ui.phase.value);
  const frame = phase < 0.18 ? "Quadro 1" : phase < 0.64 ? "Quadro 2" : "Quadro 3";

  ui.phaseLabel.textContent = frame;
  ui.modeLabel.textContent = "Estrada";
}

function setDebugPanel(panelName) {
  ui.debugTabs.forEach((button) => {
    button.classList.toggle("active", button.dataset.debugPanel === panelName);
  });
  ui.debugPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.panel === panelName);
  });
}

function endDrag(event) {
  if (!state.drag.active || state.drag.pointerId !== event.pointerId) return;

  state.drag.active = false;
  state.drag.pointerId = null;
  ui.stage.classList.remove("dragging");

  if (canvas.hasPointerCapture(event.pointerId)) {
    canvas.releasePointerCapture(event.pointerId);
  }
}

function setTextureSource(source) {
  state.source = source;
  state.imageAspect = source.width / source.height;
  state.textureOffset = [0, 0];

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);

  resize();
  requestRender();
}

function resize() {
  if (!gl || !guideCanvas || !canvas) return;

  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.floor(rect.width * dpr));
  const height = Math.max(1, Math.floor(rect.height * dpr));

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    guideCanvas.width = width;
    guideCanvas.height = height;
  }

  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;
  guideCanvas.style.width = `${rect.width}px`;
  guideCanvas.style.height = `${rect.height}px`;

  gl.viewport(0, 0, width, height);

  const canvasAspect = rect.width / Math.max(1, rect.height);
  let rectHeight = 1.56;
  let rectWidth = (rectHeight * state.imageAspect) / canvasAspect;

  if (rectWidth > 1.72) {
    rectWidth = 1.72;
    rectHeight = (rectWidth * canvasAspect) / state.imageAspect;
  }

  state.rect = [rectWidth, rectHeight];
}

function render() {
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
  gl.enableVertexAttribArray(locations.uv);
  gl.vertexAttribPointer(locations.uv, 2, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.uniform1i(locations.texture, 0);

  gl.uniform1f(locations.phase, Number(ui.phase.value));
  gl.uniform1f(locations.bend, Number(ui.bend.value));
  gl.uniform1f(locations.compress, Number(ui.compress.value));
  gl.uniform1f(locations.spread, Number(ui.spread.value));
  gl.uniform1f(locations.horizonArc, ROAD_HORIZON_ARC);
  gl.uniform1f(locations.horizonRoughness, ROAD_HORIZON_ROUGHNESS);
  gl.uniform1f(locations.mode, state.modeIndex);
  gl.uniform2f(locations.rect, state.rect[0], state.rect[1]);
  gl.uniform2f(locations.textureOffset, state.textureOffset[0], state.textureOffset[1]);

  gl.drawElements(gl.TRIANGLES, mesh.indices.length, gl.UNSIGNED_SHORT, 0);
}

function drawGuide() {
  const w = guideCanvas.width;
  const h = guideCanvas.height;
  guide.clearRect(0, 0, w, h);

  if (!ui.showGuides.checked) return;

  const phase = Number(ui.phase.value);
  const bend = Number(ui.bend.value);
  const compress = Number(ui.compress.value);
  const spread = Number(ui.spread.value);

  guide.save();
  guide.lineWidth = Math.max(2, w * 0.002);
  guide.strokeStyle = "rgba(244,177,61,0.82)";
  guide.setLineDash([10, 8]);
  guide.beginPath();

  for (let i = 0; i <= 96; i += 1) {
    const uv = [i / 96, 0];
    const point = warpPoint(uv, phase, bend, compress, spread, state.modeIndex, state.rect);
    const screen = toScreen(point, w, h);
    if (i === 0) guide.moveTo(screen[0], screen[1]);
    else guide.lineTo(screen[0], screen[1]);
  }

  guide.stroke();
  guide.setLineDash([]);

  guide.strokeStyle = "rgba(255,255,255,0.24)";
  guide.lineWidth = 1;
  guide.beginPath();
  const corners = [
    toScreen(warpPoint([0, 0], phase, bend, compress, spread, state.modeIndex, state.rect), w, h),
    toScreen(warpPoint([1, 0], phase, bend, compress, spread, state.modeIndex, state.rect), w, h),
    toScreen(warpPoint([1, 1], phase, bend, compress, spread, state.modeIndex, state.rect), w, h),
    toScreen(warpPoint([0, 1], phase, bend, compress, spread, state.modeIndex, state.rect), w, h),
  ];
  corners.forEach((point, index) => {
    if (index === 0) guide.moveTo(point[0], point[1]);
    else guide.lineTo(point[0], point[1]);
  });
  guide.closePath();
  guide.stroke();
  guide.restore();
}

function createMesh(cols, rows) {
  const uvs = [];
  const indices = [];

  for (let y = 0; y <= rows; y += 1) {
    for (let x = 0; x <= cols; x += 1) {
      uvs.push(x / cols, y / rows);
    }
  }

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const a = y * (cols + 1) + x;
      const b = a + 1;
      const c = a + cols + 1;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  return {
    cols,
    rows,
    uvs: new Float32Array(uvs),
    indices: new Uint16Array(indices),
  };
}

function createRoadSource() {
  const source = document.createElement("canvas");
  source.width = 720;
  source.height = 1024;
  const ctx = source.getContext("2d");
  const roadLeft = source.width * 0.2;
  const roadRight = source.width * 0.8;
  const roadWidth = roadRight - roadLeft;

  ctx.fillStyle = "#d36b26";
  ctx.fillRect(0, 0, source.width, source.height);

  ctx.fillStyle = "rgba(232, 128, 48, 0.2)";
  for (let y = 0; y < source.height; y += 32) {
    ctx.fillRect(roadLeft + roadWidth * 0.22, y + 10, roadWidth * 0.56, 6);
  }

  ctx.fillStyle = "rgba(92, 42, 18, 0.34)";
  for (let y = 0; y < source.height; y += 64) {
    const row = y / 64;
    const rowOffset = row % 2 === 0 ? 0 : 54;

    for (let x = roadLeft + 12 - rowOffset; x < roadRight + 80; x += 132) {
      const wobble = Math.sin((x + y) * 0.035) * 10;
      ctx.fillRect(x + wobble, y + 14, 76 + Math.sin(y * 0.08) * 10, 22);
    }

    ctx.fillRect(roadLeft - 16 + Math.sin(y * 0.08) * 10, y + 42, 66, 20);
    ctx.fillRect(roadRight - 50 + Math.cos(y * 0.08) * 10, y + 6, 68, 20);
  }

  ctx.fillStyle = "rgba(103, 43, 16, 0.18)";
  ctx.fillRect(roadLeft - 3, 0, 8, source.height);
  ctx.fillRect(roadRight - 5, 0, 8, source.height);

  return source;
}

function createProgram(context, vertexSource, fragmentSource) {
  const vertex = compileShader(context, context.VERTEX_SHADER, vertexSource);
  const fragment = compileShader(context, context.FRAGMENT_SHADER, fragmentSource);
  const linkedProgram = context.createProgram();

  context.attachShader(linkedProgram, vertex);
  context.attachShader(linkedProgram, fragment);
  context.linkProgram(linkedProgram);

  if (!context.getProgramParameter(linkedProgram, context.LINK_STATUS)) {
    throw new Error(context.getProgramInfoLog(linkedProgram));
  }

  return linkedProgram;
}

function compileShader(context, type, source) {
  const shader = context.createShader(type);
  context.shaderSource(shader, source);
  context.compileShader(shader);

  if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
    throw new Error(context.getShaderInfoLog(shader));
  }

  return shader;
}

function warpPoint(
  uv,
  phase,
  bend,
  compress,
  spread,
  mode,
  rect,
  horizonArc = ROAD_HORIZON_ARC,
  horizonRoughness = ROAD_HORIZON_ROUGHNESS,
) {
  const u = uv[0];
  const v = uv[1];
  let zone;

  if (mode > 2.5) {
    const perspective = 1.18 + compress * 2.2;
    const depth = Math.pow(v, perspective);
    const horizon = 0.34 + (bend - 0.5) * 0.22;
    const bottom = -1.18;
    const centered = u - 0.5;
    const arc = (0.25 - centered * centered) * horizonArc * 0.72;
    const rough =
      (Math.sin(u * Math.PI * 2.2 + phase * 0.55) * 0.035 + Math.sin(u * Math.PI * 4.4) * 0.016) *
      horizonRoughness;
    const hill = (arc + rough) * (1 - depth);
    const topWidth = 1.24 + spread * 0.42;
    const bottomWidth = 2.1 + spread * 0.7;
    const width = topWidth + (bottomWidth - topWidth) * Math.pow(depth, 0.86);
    const centerSway = Math.sin(depth * Math.PI) * (phase - 0.5) * 0.08;

    return [(u - 0.5) * width * 2 + centerSway, horizon + hill + (bottom - horizon) * depth];
  }

  if (mode < 0.5) {
    const center = -0.22 + 1.44 * phase;
    const x = (u - center) / Math.max(0.001, spread);
    zone = Math.exp(-x * x * 2.3);
  } else if (mode < 1.5) {
    zone = Math.sin(u * Math.PI);
  } else {
    zone = 0.5 + 0.5 * Math.sin((u + phase * 0.9) * Math.PI * 2);
    zone = Math.pow(Math.max(0, zone), 1.2);
  }

  const phaseGate = mode < 0.5 ? smoothstep(0.02, 0.22, phase) : smoothstep(0, 0.35, phase);
  const top = Math.pow(1 - v, 1.45);
  const curve = zone * bend * phaseGate;
  const xFlat = (u - 0.5) * rect[0];
  const yFlat = (0.5 - v) * rect[1];
  const horizontalPush = mode < 1.5 ? (u - 0.5) * curve * top * 0.08 : (zone - 0.5) * bend * top * 0.08;
  const lifted = curve * top * 0.48;
  const crushed = zone * compress * phaseGate * top * 0.2;

  return [xFlat + horizontalPush, yFlat * (1 - crushed) + lifted];
}

function smoothstep(edge0, edge1, value) {
  const x = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return x * x * (3 - 2 * x);
}

function wrapUnit(value) {
  return ((value % 1) + 1) % 1;
}

function toScreen(point, width, height) {
  return [(point[0] * 0.5 + 0.5) * width, (-point[1] * 0.5 + 0.5) * height];
}

const vertexShaderSource = `
  precision mediump float;

  attribute vec2 a_uv;

  uniform float u_phase;
  uniform float u_bend;
  uniform float u_compress;
  uniform float u_spread;
  uniform float u_horizonArc;
  uniform float u_horizonRoughness;
  uniform float u_mode;
  uniform vec2 u_rect;

  varying vec2 v_uv;

  float smoothGate(float edge0, float edge1, float value) {
    float x = clamp((value - edge0) / (edge1 - edge0), 0.0, 1.0);
    return x * x * (3.0 - 2.0 * x);
  }

  void main() {
    vec2 uv = a_uv;
    float zone;

    if (u_mode > 2.5) {
      float perspective = 1.18 + u_compress * 2.2;
      float depth = pow(uv.y, perspective);
      float horizon = 0.34 + (u_bend - 0.5) * 0.22;
      float bottom = -1.18;
      float centered = uv.x - 0.5;
      float arc = (0.25 - centered * centered) * u_horizonArc * 0.72;
      float rough = (sin(uv.x * 6.9115 + u_phase * 0.55) * 0.035 + sin(uv.x * 13.823) * 0.016) * u_horizonRoughness;
      float hill = (arc + rough) * (1.0 - depth);
      float topWidth = 1.24 + u_spread * 0.42;
      float bottomWidth = 2.1 + u_spread * 0.7;
      float width = mix(topWidth, bottomWidth, pow(depth, 0.86));
      float centerSway = sin(depth * 3.14159265) * (u_phase - 0.5) * 0.08;
      vec2 roadPos = vec2((uv.x - 0.5) * width * 2.0 + centerSway, horizon + hill + (bottom - horizon) * depth);

      v_uv = uv;
      gl_Position = vec4(roadPos, 0.0, 1.0);
      return;
    }

    if (u_mode < 0.5) {
      float center = mix(-0.22, 1.22, u_phase);
      float x = (uv.x - center) / max(0.001, u_spread);
      zone = exp(-x * x * 2.3);
    } else if (u_mode < 1.5) {
      zone = sin(uv.x * 3.14159265);
    } else {
      zone = 0.5 + 0.5 * sin((uv.x + u_phase * 0.9) * 6.2831853);
      zone = pow(max(0.0, zone), 1.2);
    }

    float phaseGate = u_mode < 0.5
      ? smoothGate(0.02, 0.22, u_phase)
      : smoothGate(0.0, 0.35, u_phase);

    float top = pow(1.0 - uv.y, 1.45);
    float curve = zone * u_bend * phaseGate;
    vec2 pos = vec2((uv.x - 0.5) * u_rect.x, (0.5 - uv.y) * u_rect.y);

    float horizontalPush = u_mode < 1.5
      ? (uv.x - 0.5) * curve * top * 0.08
      : (zone - 0.5) * u_bend * top * 0.08;
    float lifted = curve * top * 0.48;
    float crushed = zone * u_compress * phaseGate * top * 0.2;

    pos.x += horizontalPush;
    pos.y = pos.y * (1.0 - crushed) + lifted;

    v_uv = uv;
    gl_Position = vec4(pos, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  precision mediump float;

  uniform sampler2D u_texture;
  uniform vec2 u_textureOffset;
  uniform float u_mode;
  uniform float u_compress;
  uniform float u_spread;

  varying vec2 v_uv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  vec3 grassColor(vec2 uv) {
    vec2 cell = floor(uv * vec2(14.0, 38.0));
    float n = hash(cell);
    float speck = step(0.965, n);
    float darkPatch = step(0.84, hash(cell * 0.37 + 8.0));
    vec3 base = mix(vec3(0.11, 0.31, 0.12), vec3(0.17, 0.39, 0.14), hash(cell + 3.0) * 0.32);
    base = mix(base, vec3(0.07, 0.22, 0.1), darkPatch * 0.18);
    base = mix(base, vec3(0.37, 0.63, 0.22), speck * 0.38);
    return base;
  }

  void main() {
    if (u_mode > 2.5) {
      float depth = pow(v_uv.y, 1.18 + u_compress * 2.2);
      float topRoadHalf = 0.055 + u_spread * 0.045;
      float bottomRoadHalf = 0.17 + u_spread * 0.12;
      float roadHalf = mix(topRoadHalf, bottomRoadHalf, pow(depth, 0.72));
      float edge = abs(v_uv.x - 0.5);
      float roadMask = 1.0 - smoothstep(roadHalf, roadHalf + 0.014, edge);
      vec2 verticalOffset = vec2(0.0, u_textureOffset.y);
      float roadX = (v_uv.x - (0.5 - roadHalf)) / (roadHalf * 2.0);
      vec2 roadUv = vec2(mix(0.21, 0.79, roadX), v_uv.y);
      vec3 road = texture2D(u_texture, fract(roadUv - verticalOffset)).rgb;
      vec3 grass = grassColor(fract(v_uv - verticalOffset));
      vec3 shoulder = vec3(0.12, 0.28, 0.1);
      float shoulderMask = 1.0 - smoothstep(roadHalf + 0.018, roadHalf + 0.045, edge);
      grass = mix(grass, shoulder, max(0.0, shoulderMask - roadMask) * 0.52);
      gl_FragColor = vec4(mix(grass, road, roadMask), 1.0);
      return;
    }

    vec2 tiledUv = fract(v_uv - u_textureOffset);
    vec4 color = texture2D(u_texture, tiledUv);
    gl_FragColor = color;
  }
`;
