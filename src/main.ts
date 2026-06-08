// @ts-nocheck
import Phaser from "phaser";
import enemyBattleConfig from "./data/enemies.json";
import "./styles.css";

const ROAD_HORIZON_ARC = 0.35;
const ROAD_HORIZON_ROUGHNESS = 0.28;
const ROAD_TEXTURE_SCROLL_SCALE = 2.25;
const ENCOUNTER_VISIBLE_RANGE = 0.16;
const ENCOUNTER_BATTLE_DEPTH = 0.86;
const ENCOUNTER_START_DEPTH = 0.045;
const ENCOUNTER_GROUND_TRAVEL_RANGE = (ENCOUNTER_BATTLE_DEPTH - ENCOUNTER_START_DEPTH) / ROAD_TEXTURE_SCROLL_SCALE;
const ENCOUNTER_RESPAWN_BUFFER = 0.018;
const KEYBOARD_ADVANCE_SPEED = 0.00022;
const MOUSE_WHEEL_ADVANCE = 0.00034;
const MOUSE_WHEEL_SMOOTH_SPEED = 0.000085;
const TOUCH_DRAG_ADVANCE = 0.00034;
const ENCOUNTERS_PER_COMMON_STAGE = 6;
const BACKDROP_PARALLAX_END = 0.92;
const MOUNTAIN_BOTTOM_START = -18;
const MOUNTAIN_BOTTOM_END = 31;
const HILL_BOTTOM_START = -118;
const HILL_BOTTOM_END = 43;
const PINE_TREE_SPRITE = new URL("./assets/scenery/pine_tree.webp", import.meta.url).href;
const BACKPACK_ICON = new URL("./assets/ui/backpack_icon.webp", import.meta.url).href;
const PROGRESS_SWORD_ICON = new URL("./assets/ui/progress_sword.webp", import.meta.url).href;
const PROGRESS_SKULL_ICON = new URL("./assets/ui/progress_skull.webp", import.meta.url).href;
const ATTACK_SWORD_ICON = new URL("./assets/ui/attack_sword.webp", import.meta.url).href;
const PINE_TREE_SIZE_MULTIPLIER = 3;
const STAGE_PROGRESS_DOT_COUNT = 10;
const PLAYER_CONFIG = {
  level: 1,
  maxHp: 80,
  attackCooldownMs: 650,
  attackDamage: 1,
};
const BACKGROUND_SCENE = {
  movingClouds: new URL("./assets/scenery/moving_clouds.webp", import.meta.url).href,
  mountains: new URL("./assets/scenery/distant_mountains.webp", import.meta.url).href,
  castleHill: new URL("./assets/scenery/castle_hill.webp", import.meta.url).href,
};

const ENEMY_SPRITES = {
  slime_verde: {
    idle: new URL("./assets/enemies/slime_verde_idle.webp", import.meta.url).href,
  },
  rato_gigante: {
    idle: new URL("./assets/enemies/rato_gigante_idle.webp", import.meta.url).href,
  },
  goblin_fraco: {
    idle: new URL("./assets/enemies/goblin_fraco_idle.webp", import.meta.url).href,
  },
  morcego_sombrio: {
    idle: new URL("./assets/enemies/morcego_sombrio_idle.webp", import.meta.url).href,
  },
  aranha_floresta: {
    idle: new URL("./assets/enemies/aranha_floresta_idle.webp", import.meta.url).href,
  },
  goblin_arqueiro: {
    idle: new URL("./assets/enemies/goblin_arqueiro_idle.webp", import.meta.url).href,
  },
  lobo_selvagem: {
    idle: new URL("./assets/enemies/lobo_selvagem_idle.webp", import.meta.url).href,
  },
  xama_goblin: {
    idle: new URL("./assets/enemies/xama_goblin_idle.webp", import.meta.url).href,
  },
  guardiao_raizes: {
    idle: new URL("./assets/enemies/guardiao_raizes_idle.webp", import.meta.url).href,
  },
  rei_goblin_floresta: {
    idle: new URL("./assets/enemies/rei_goblin_floresta_idle.webp", import.meta.url).href,
  },
};

const ACT1_ENEMIES = {
  slime_verde: { name: "Slime Verde", size: 0.86, sprites: ENEMY_SPRITES.slime_verde, battle: enemyBattleConfig.slime_verde },
  rato_gigante: { name: "Rato Gigante", size: 0.92, sprites: ENEMY_SPRITES.rato_gigante, battle: enemyBattleConfig.rato_gigante },
  goblin_fraco: { name: "Goblin Fraco", size: 0.9, sprites: ENEMY_SPRITES.goblin_fraco, battle: enemyBattleConfig.goblin_fraco },
  morcego_sombrio: {
    name: "Morcego Sombrio",
    size: 0.82,
    hover: true,
    sprites: ENEMY_SPRITES.morcego_sombrio,
    battle: enemyBattleConfig.morcego_sombrio,
  },
  aranha_floresta: {
    name: "Aranha da Floresta",
    size: 0.88,
    sprites: ENEMY_SPRITES.aranha_floresta,
    battle: enemyBattleConfig.aranha_floresta,
  },
  goblin_arqueiro: {
    name: "Goblin Arqueiro",
    size: 0.92,
    sprites: ENEMY_SPRITES.goblin_arqueiro,
    battle: enemyBattleConfig.goblin_arqueiro,
  },
  lobo_selvagem: { name: "Lobo Selvagem", size: 0.95, sprites: ENEMY_SPRITES.lobo_selvagem, battle: enemyBattleConfig.lobo_selvagem },
  xama_goblin: { name: "Xama Goblin", size: 0.96, sprites: ENEMY_SPRITES.xama_goblin, battle: enemyBattleConfig.xama_goblin },
  guardiao_raizes: {
    name: "Guardiao de Raizes",
    size: 1.1,
    sprites: ENEMY_SPRITES.guardiao_raizes,
    battle: enemyBattleConfig.guardiao_raizes,
  },
  rei_goblin_floresta: {
    name: "Rei Goblin da Floresta",
    size: 1.38,
    boss: true,
    sprites: ENEMY_SPRITES.rei_goblin_floresta,
    battle: enemyBattleConfig.rei_goblin_floresta,
  },
};

const ACT1_PHASES = [
  { id: "1-1", enemies: ["slime_verde", "rato_gigante"] },
  { id: "1-2", enemies: ["slime_verde", "rato_gigante", "goblin_fraco"] },
  { id: "1-3", enemies: ["slime_verde", "rato_gigante", "goblin_fraco"] },
  { id: "1-4", enemies: ["rato_gigante", "goblin_fraco", "morcego_sombrio"] },
  { id: "1-5", enemies: ["goblin_fraco", "morcego_sombrio", "aranha_floresta"] },
  { id: "1-6", enemies: ["morcego_sombrio", "aranha_floresta", "goblin_arqueiro"] },
  { id: "1-7", enemies: ["aranha_floresta", "goblin_arqueiro", "lobo_selvagem"] },
  { id: "1-8", enemies: ["goblin_arqueiro", "lobo_selvagem", "xama_goblin"] },
  { id: "1-9", enemies: ["lobo_selvagem", "xama_goblin", "guardiao_raizes"] },
  { id: "1-10", boss: "rei_goblin_floresta" },
];
const ROADSIDE_TREES = [
  { depth: 0.07, side: -1, offset: 0.004, size: 0.88 },
  { depth: 0.1, side: 1, offset: 0.008, size: 0.86 },
  { depth: 0.2, side: -1, offset: 0.012, size: 0.95 },
  { depth: 0.25, side: 1, offset: 0.002, size: 0.98 },
  { depth: 0.36, side: -1, offset: 0.008, size: 1.04 },
  { depth: 0.43, side: 1, offset: 0.014, size: 1.07 },
  { depth: 0.56, side: -1, offset: 0.018, size: 1.15 },
  { depth: 0.62, side: 1, offset: 0.006, size: 1.12 },
  { depth: 0.75, side: -1, offset: 0.022, size: 1.24 },
  { depth: 0.81, side: 1, offset: 0.012, size: 1.2 },
  { depth: 0.9, side: -1, offset: 0.026, size: 1.34 },
  { depth: 0.94, side: 1, offset: 0.016, size: 1.28 },
];

const app = document.querySelector("#app");

if (!app) {
  throw new Error("App root not found");
}

app.innerHTML = `
  <main class="app-shell">
    <section class="stage" aria-label="Área de visualização da distorção">
      <div id="phaser-root" class="phaser-runtime" aria-hidden="true"></div>
      <div class="background-scene" aria-hidden="true">
        <div class="background-sky"></div>
        <div class="background-moving-clouds" style="--clouds-image: url('${BACKGROUND_SCENE.movingClouds}')"></div>
        <img class="background-layer background-mountains" src="${BACKGROUND_SCENE.mountains}" alt="" draggable="false" />
        <img class="background-layer background-castle-hill" src="${BACKGROUND_SCENE.castleHill}" alt="" draggable="false" />
      </div>
      <canvas id="warpCanvas"></canvas>
      <canvas id="decorCanvas" aria-hidden="true"></canvas>
      <canvas id="guideCanvas" aria-hidden="true"></canvas>
      <div id="enemyLayer" class="enemy-layer" aria-hidden="true">
        <div id="enemySprite" class="enemy-sprite">
          <div class="enemy-combat-bars" aria-hidden="true">
            <span id="enemyName" class="enemy-name"></span>
            <div class="combat-bar enemy-cooldown-bar"><span id="enemyCooldownFill"></span></div>
            <div class="combat-bar enemy-health-bar">
              <span id="enemyHealthLag"></span>
              <span id="enemyHealthFill"></span>
            </div>
          </div>
          <div class="enemy-ground-shadow" aria-hidden="true"></div>
          <div class="boss-aura" aria-hidden="true"></div>
          <img id="enemyImage" alt="" draggable="false" />
        </div>
      </div>
      <img id="attackSword" class="attack-sword" src="${ATTACK_SWORD_ICON}" alt="" draggable="false" aria-hidden="true" />
      <div class="player-hud" aria-hidden="false">
        <div class="player-level">Lv. ${PLAYER_CONFIG.level}</div>
        <div class="player-bars">
          <div class="combat-bar player-cooldown-bar"><span id="playerCooldownFill"></span></div>
          <div class="combat-bar player-health-bar">
            <span id="playerHealthLag"></span>
            <span id="playerHealthFill"></span>
            <span id="playerHealthText">${PLAYER_CONFIG.maxHp}/${PLAYER_CONFIG.maxHp}</span>
          </div>
        </div>
        <button id="backpackButton" class="backpack-button" type="button" aria-label="Abrir mochila">
          <img src="${BACKPACK_ICON}" alt="" draggable="false" />
        </button>
      </div>
      <div id="backpackModal" class="backpack-modal" aria-hidden="true">
        <div class="backpack-panel" role="dialog" aria-modal="true" aria-label="Mochila">
          <button id="closeBackpack" class="backpack-close" type="button" aria-label="Fechar mochila">X</button>
        </div>
      </div>
      <div id="stageHud" class="stage-hud">1-1</div>
      <div id="stageProgress" class="stage-progress" aria-hidden="true">
        <img class="progress-boss-icon" src="${PROGRESS_SKULL_ICON}" alt="" draggable="false" />
        <div class="progress-track">
          ${Array.from({ length: STAGE_PROGRESS_DOT_COUNT }, (_, index) => {
            const bottom = (index / Math.max(1, STAGE_PROGRESS_DOT_COUNT - 1)) * 100;
            return `<span class="progress-dot" data-progress-dot="${index}" style="bottom:${bottom}%"></span>`;
          }).join("")}
          <img id="stageProgressMarker" class="progress-marker" src="${PROGRESS_SWORD_ICON}" alt="" draggable="false" />
        </div>
      </div>
      <div id="transitionOverlay" class="transition-overlay" aria-live="polite" aria-hidden="true">
        <div class="transition-copy">
          <span id="transitionFrom" class="transition-from">1-1</span>
          <span id="transitionTo" class="transition-to">1-2</span>
        </div>
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
const decorCanvas = required("#decorCanvas");
const guideCanvas = required("#guideCanvas");
const decor = decorCanvas.getContext("2d");
const guide = guideCanvas.getContext("2d");
const gl = canvas.getContext("webgl", { alpha: true, antialias: true });
const pineTreeImage = new Image();
pineTreeImage.src = PINE_TREE_SPRITE;
pineTreeImage.addEventListener("load", requestRender);

const ui = {
  stage: required(".stage"),
  phase: required("#phase"),
  bend: required("#bend"),
  compress: required("#compress"),
  spread: required("#spread"),
  animate: required("#animate"),
  showGuides: required("#showGuides"),
  enemyLayer: required("#enemyLayer"),
  enemySprite: required("#enemySprite"),
  enemyImage: required("#enemyImage"),
  enemyName: required("#enemyName"),
  enemyHealthFill: required("#enemyHealthFill"),
  enemyHealthLag: required("#enemyHealthLag"),
  enemyCooldownFill: required("#enemyCooldownFill"),
  attackSword: required("#attackSword"),
  playerHealthFill: required("#playerHealthFill"),
  playerHealthLag: required("#playerHealthLag"),
  playerHealthText: required("#playerHealthText"),
  playerCooldownFill: required("#playerCooldownFill"),
  backpackButton: required("#backpackButton"),
  backpackModal: required("#backpackModal"),
  closeBackpack: required("#closeBackpack"),
  stageHud: required("#stageHud"),
  stageProgressMarker: required("#stageProgressMarker"),
  stageProgressDots: [...document.querySelectorAll("[data-progress-dot]")],
  transitionOverlay: required("#transitionOverlay"),
  transitionFrom: required("#transitionFrom"),
  transitionTo: required("#transitionTo"),
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
    mode: null,
    pointerId: null,
    lastX: 0,
    lastY: 0,
  },
  needsRender: true,
  started: false,
};

const game = {
  phaseIndex: 0,
  phase: ACT1_PHASES[0],
  encounters: [],
  nextEncounterIndex: 0,
  travel: 0,
  wheelTargetTravel: 0,
  activeEncounter: null,
  battle: false,
  transitioning: false,
  completed: false,
  attackTimer: 0,
  hitTimer: 0,
  enemyAttackElapsed: 0,
  enemyDelayedHp: 0,
  playerHp: PLAYER_CONFIG.maxHp,
  playerDelayedHp: PLAYER_CONFIG.maxHp,
  playerAttackElapsed: PLAYER_CONFIG.attackCooldownMs,
  forwardHeld: false,
  forwardUntil: 0,
};

const mesh = createMesh(96, 64);

if (!decor || !guide || !gl) {
  document.body.innerHTML = "<p style='padding:24px'>WebGL nao esta disponivel neste navegador.</p>";
  throw new Error("WebGL unavailable");
}

let program;
let locations;
let uvBuffer;
let indexBuffer;
let texture;
let enemyHealthLagTimeout = null;
let playerHealthLagTimeout = null;
let attackAnimationToken = 0;

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
  preloadEnemySprites();
  resetPhase(0);
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

  ui.enemySprite.addEventListener("pointerdown", attackCurrentEnemy);
  ui.backpackButton.addEventListener("click", openBackpack);
  ui.closeBackpack.addEventListener("click", closeBackpack);
  ui.backpackModal.addEventListener("click", (event) => {
    if (event.target === ui.backpackModal) {
      closeBackpack();
    }
  });
  ui.stage.addEventListener("wheel", handleStageWheel, { passive: false });
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  window.addEventListener("blur", () => {
    game.forwardHeld = false;
    game.forwardUntil = 0;
  });

  canvas.addEventListener("pointerdown", (event) => {
    const debugDragEnabled = document.body.classList.contains("debug-enabled");
    const gameDragEnabled = event.pointerType === "touch" || window.matchMedia("(max-width: 899px), (pointer: coarse)").matches;

    if (!debugDragEnabled && !gameDragEnabled) return;

    state.drag.active = true;
    state.drag.mode = debugDragEnabled ? "debug" : "game";
    state.drag.pointerId = event.pointerId;
    state.drag.lastX = event.clientX;
    state.drag.lastY = event.clientY;
    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    ui.stage.classList.add("dragging");
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!state.drag.active || state.drag.pointerId !== event.pointerId) return;

    const dy = event.clientY - state.drag.lastY;
    event.preventDefault();

    if (state.drag.mode === "game") {
      advanceFromDrag(dy);
    } else {
      const planeHeight = Math.max(1, canvas.clientHeight * state.rect[1] * 0.5);

      if (state.mode !== "road") {
        const dx = event.clientX - state.drag.lastX;
        const planeWidth = Math.max(1, canvas.clientWidth * state.rect[0] * 0.5);
        state.textureOffset[0] = wrapUnit(state.textureOffset[0] + dx / planeWidth);
      }

      state.textureOffset[1] = wrapUnit(state.textureOffset[1] + dy / planeHeight);
      requestRender();
    }

    state.drag.lastX = event.clientX;
    state.drag.lastY = event.clientY;
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

function advanceFromDrag(dy) {
  if (dy <= 0 || game.battle || game.transitioning || game.completed) return;

  const dragDistance = clamp(dy, 0, 220);
  game.wheelTargetTravel = Math.min(
    getTravelLimit(),
    Math.max(game.wheelTargetTravel, game.travel) + dragDistance * TOUCH_DRAG_ADVANCE,
  );
}

function handleStageWheel(event) {
  event.preventDefault();

  if (event.deltaY >= 0) return;
  if (game.battle || game.transitioning || game.completed) return;

  const wheelDistance = clamp(-event.deltaY, 0, 220);
  game.wheelTargetTravel = Math.min(
    getTravelLimit(),
    Math.max(game.wheelTargetTravel, game.travel) + wheelDistance * MOUSE_WHEEL_ADVANCE,
  );
}

function handleKeyDown(event) {
  if (event.code !== "KeyW") return;

  event.preventDefault();
  game.forwardHeld = true;
  game.forwardUntil = performance.now() + 560;
}

function handleKeyUp(event) {
  if (event.code !== "KeyW") return;

  event.preventDefault();
  game.forwardHeld = false;
  game.forwardUntil = 0;
}

function openBackpack() {
  ui.backpackButton.classList.add("pressed");
  window.setTimeout(() => {
    ui.backpackButton.classList.remove("pressed");
    ui.backpackModal.classList.add("open");
    ui.backpackModal.setAttribute("aria-hidden", "false");
  }, 120);
}

function closeBackpack() {
  ui.backpackModal.classList.remove("open");
  ui.backpackModal.setAttribute("aria-hidden", "true");
}

function tick(delta) {
  const frameDelta = Math.min(40, delta || 16);

  updateGame(frameDelta);

  if (ui.animate.checked && document.body.classList.contains("debug-enabled")) {
    const next = (Number(ui.phase.value) + frameDelta * 0.00024) % 1;
    ui.phase.value = next.toFixed(3);
    state.needsRender = true;
  }

  if (state.needsRender) {
    render();
    drawDecor();
    drawGuide();
    state.needsRender = false;
  }

  updateEnemyLayer();
}

function requestRender() {
  state.needsRender = true;
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
  state.drag.mode = null;
  state.drag.pointerId = null;
  ui.stage.classList.remove("dragging");

  if (canvas.hasPointerCapture(event.pointerId)) {
    canvas.releasePointerCapture(event.pointerId);
  }
}

function preloadEnemySprites() {
  Object.values(ACT1_ENEMIES).forEach((enemy) => {
    const image = new Image();
    image.src = enemy.sprites.idle;
  });
}

function resetPhase(phaseIndex) {
  attackAnimationToken += 1;
  game.phaseIndex = phaseIndex;
  game.phase = ACT1_PHASES[phaseIndex];
  game.encounters = createPhaseEncounters(game.phase);
  game.nextEncounterIndex = 0;
  game.travel = 0;
  game.wheelTargetTravel = 0;
  game.activeEncounter = null;
  game.battle = false;
  game.completed = false;
  game.attackTimer = 0;
  game.hitTimer = 0;
  game.forwardHeld = false;
  game.forwardUntil = 0;
  state.textureOffset[1] = 0;
  ui.stageHud.textContent = game.phase.id;
  ui.stage.classList.remove("in-battle");
  updateStageProgress();
  updatePlayerHud();
  hideAttackSword();
  hideEnemy();
  requestRender();
}

function createPhaseEncounters(phase) {
  if (phase.boss) {
    return [
      {
        key: phase.boss,
        at: 0.72,
        lane: 0,
        boss: true,
        defeated: false,
      },
    ];
  }

  return Array.from({ length: ENCOUNTERS_PER_COMMON_STAGE }, (_, index) => {
    const key = phase.enemies[index % phase.enemies.length];
    const firstEncounterAt = ENCOUNTER_GROUND_TRAVEL_RANGE + 0.018;
    const lastEncounterAt = 0.94;
    const spacing = (lastEncounterAt - firstEncounterAt) / Math.max(1, ENCOUNTERS_PER_COMMON_STAGE - 1);
    const at = firstEncounterAt + spacing * index;

    return {
      key,
      at,
      lane: [-0.035, 0.028, 0][index % 3],
      boss: false,
      defeated: false,
    };
  });
}

function updateGame(delta) {
  game.attackTimer = Math.max(0, game.attackTimer - delta);
  game.hitTimer = Math.max(0, game.hitTimer - delta);
  game.playerAttackElapsed = Math.min(PLAYER_CONFIG.attackCooldownMs, game.playerAttackElapsed + delta);

  if (game.battle) {
    updateBattleTimers(delta);
  }

  if (game.transitioning || game.completed) {
    updateStageProgress();
    updatePlayerHud();
    return;
  }

  const forwardActive = game.forwardHeld && performance.now() <= game.forwardUntil;
  if (!forwardActive) {
    game.forwardHeld = false;
  }

  if (forwardActive) {
    advancePlayer(delta * KEYBOARD_ADVANCE_SPEED);
  }

  if (!game.battle && game.wheelTargetTravel > game.travel) {
    const remainingWheelTravel = game.wheelTargetTravel - game.travel;
    advancePlayer(Math.min(remainingWheelTravel, delta * MOUSE_WHEEL_SMOOTH_SPEED));
  }

  const visibleEncounter = getVisibleEncounter();

  if (!game.battle && visibleEncounter) {
    const approach = getEncounterApproach(visibleEncounter);
    if (approach >= 1) {
      startBattle(visibleEncounter);
    }
  }

  if (!game.battle && !visibleEncounter && game.travel >= 1) {
    startPhaseTransition();
  }

  updateStageProgress();
  updatePlayerHud();
}

function updateBattleTimers(delta) {
  if (!game.activeEncounter) return;

  const enemy = ACT1_ENEMIES[game.activeEncounter.key];
  const cooldown = enemy.battle.attackCooldownMs;
  game.enemyAttackElapsed += delta;

  if (game.enemyAttackElapsed >= cooldown) {
    game.enemyAttackElapsed = 0;
    damagePlayer(enemy.battle.attackDamage);
  }
}

function advancePlayer(amount) {
  if (amount <= 0 || game.battle || game.transitioning || game.completed) return;

  const nextTravel = Math.min(getTravelLimit(), game.travel + amount);
  if (nextTravel === game.travel) return;

  game.travel = nextTravel;
  state.textureOffset[1] = wrapUnit(game.travel * ROAD_TEXTURE_SCROLL_SCALE);
  state.needsRender = true;
  updateStageProgress();
}

function updateStageProgress() {
  const goal = getStageProgressGoal();
  const progress = clamp(game.travel / goal, 0, 1);
  const percent = `${progress * 100}%`;

  ui.stageProgressMarker.style.bottom = percent;
  ui.stageProgressDots.forEach((dot, index) => {
    const dotProgress = index / Math.max(1, ui.stageProgressDots.length - 1);
    dot.classList.toggle("active", dotProgress <= progress + 0.001);
  });
  updateBackdropParallax();
}

function updateBackdropParallax() {
  const progress = smoothstep(0, BACKDROP_PARALLAX_END, clamp(game.travel, 0, 1));
  ui.stage.style.setProperty("--mountain-bottom", `${lerp(MOUNTAIN_BOTTOM_START, MOUNTAIN_BOTTOM_END, progress)}%`);
  ui.stage.style.setProperty("--hill-bottom", `${lerp(HILL_BOTTOM_START, HILL_BOTTOM_END, progress)}%`);
}

function getStageProgressGoal() {
  if (game.phase?.boss) {
    const bossEncounter = game.encounters.find((encounter) => encounter.boss);
    return Math.max(0.1, bossEncounter?.at ?? 1);
  }

  return Math.max(1, getNextPendingEncounter()?.at ?? 1);
}

function getTravelLimit() {
  if (game.phase?.boss) return 1;

  return Math.max(1, getNextPendingEncounter()?.at ?? 1);
}

function getVisibleEncounter() {
  if (game.activeEncounter) return game.activeEncounter;

  const encounter = getNextPendingEncounter();
  if (!encounter) return null;

  const distance = getEncounterDistance(encounter);
  return distance <= ENCOUNTER_GROUND_TRAVEL_RANGE && distance >= -0.04 ? encounter : null;
}

function getNextPendingEncounter() {
  while (game.nextEncounterIndex < game.encounters.length && game.encounters[game.nextEncounterIndex].defeated) {
    game.nextEncounterIndex += 1;
  }

  return game.encounters[game.nextEncounterIndex] ?? null;
}

function scheduleNextEncounterFromHorizon() {
  const encounter = getNextPendingEncounter();
  if (!encounter || encounter.boss) return;

  const horizonAt = game.travel + ENCOUNTER_GROUND_TRAVEL_RANGE + ENCOUNTER_RESPAWN_BUFFER;
  encounter.at = Math.max(encounter.at, horizonAt);
  game.wheelTargetTravel = Math.min(game.wheelTargetTravel, Math.max(0, encounter.at - ENCOUNTER_GROUND_TRAVEL_RANGE));
}

function getEncounterDistance(encounter) {
  return encounter.at - game.travel;
}

function getEncounterApproach(encounter) {
  const distance = getEncounterDistance(encounter);
  return clamp(1 - distance / ENCOUNTER_GROUND_TRAVEL_RANGE, 0, 1);
}

function getEncounterGroundDepth(encounter) {
  if (game.battle) return ENCOUNTER_BATTLE_DEPTH;

  const distance = getEncounterDistance(encounter);
  return clamp(
    ENCOUNTER_START_DEPTH + (ENCOUNTER_GROUND_TRAVEL_RANGE - distance) * ROAD_TEXTURE_SCROLL_SCALE,
    ENCOUNTER_START_DEPTH,
    ENCOUNTER_BATTLE_DEPTH,
  );
}

function getRoadPerspectiveScale(depth) {
  return 0.24 + Math.pow(depth, 1.35) * 1.18;
}

function startBattle(encounter) {
  attackAnimationToken += 1;
  const enemy = ACT1_ENEMIES[encounter.key];
  game.activeEncounter = encounter;
  game.battle = true;
  game.wheelTargetTravel = game.travel;
  game.attackTimer = 0;
  game.hitTimer = 0;
  game.enemyAttackElapsed = 0;
  game.enemyDelayedHp = enemy.battle.hp;
  encounter.hp = enemy.battle.hp;
  encounter.maxHp = enemy.battle.hp;
  clearEnemyHealthLag();
  ui.stage.classList.add("in-battle");
  requestRender();
}

function attackCurrentEnemy(event) {
  if (!game.battle || !game.activeEncounter || game.transitioning) return;
  if (game.playerAttackElapsed < PLAYER_CONFIG.attackCooldownMs) return;

  event.preventDefault();
  event.stopPropagation();

  const token = ++attackAnimationToken;
  const encounter = game.activeEncounter;
  game.playerAttackElapsed = 0;
  animateAttackSword(event, token, encounter);
}

function applyPlayerAttackDamage(token, encounter) {
  if (token !== attackAnimationToken) return;
  if (!game.battle || game.transitioning || game.activeEncounter !== encounter) return;

  const previousHp = encounter.hp;
  encounter.hp = Math.max(0, encounter.hp - PLAYER_CONFIG.attackDamage);
  game.attackTimer = 170;
  game.hitTimer = 110;
  scheduleEnemyHealthLag(previousHp);

  if (encounter.hp <= 0) {
    defeatCurrentEnemy();
  }
}

function defeatCurrentEnemy() {
  const defeated = game.activeEncounter;
  if (!defeated) return;

  attackAnimationToken += 1;
  defeated.defeated = true;
  game.nextEncounterIndex = Math.max(game.nextEncounterIndex, game.encounters.indexOf(defeated) + 1);
  game.activeEncounter = null;
  game.battle = false;
  game.wheelTargetTravel = game.travel;
  game.attackTimer = 0;
  game.hitTimer = 0;
  game.enemyAttackElapsed = 0;
  clearEnemyHealthLag();
  hideAttackSword();
  ui.stage.classList.remove("in-battle");
  hideEnemy();

  if (defeated.boss) {
    startPhaseTransition();
  } else {
    scheduleNextEncounterFromHorizon();
  }
}

function animateAttackSword(event, token, encounter) {
  const stageRect = ui.stage.getBoundingClientRect();
  const enemyRect = ui.enemyImage.getBoundingClientRect();
  const center = {
    x: enemyRect.left + enemyRect.width * 0.5,
    y: enemyRect.top + enemyRect.height * 0.5,
  };
  const click = {
    x: event.clientX ?? center.x,
    y: event.clientY ?? center.y + 1,
  };
  let direction = {
    x: click.x - center.x,
    y: click.y - center.y,
  };
  const length = Math.hypot(direction.x, direction.y);
  if (length < 4) {
    direction = { x: 0, y: 1 };
  } else {
    direction = {
      x: direction.x / length,
      y: direction.y / length,
    };
  }

  const swordHeight = clamp(enemyRect.height * 1.06, 120, 240);
  const swordWidth = swordHeight * (112 / 320);
  const travel = Math.max(window.innerWidth, window.innerHeight) + swordHeight + 80;
  const start = {
    x: center.x + direction.x * travel,
    y: center.y + direction.y * travel,
  };
  const angle = Math.atan2(-direction.x, direction.y) * (180 / Math.PI);
  const toStagePoint = (point) => ({
    x: point.x - stageRect.left - swordWidth * 0.5,
    y: point.y - stageRect.top,
  });
  const from = toStagePoint(start);
  const to = toStagePoint(center);

  ui.attackSword.getAnimations().forEach((animation) => animation.cancel());
  ui.attackSword.style.width = `${swordWidth}px`;
  ui.attackSword.style.height = `${swordHeight}px`;
  ui.attackSword.style.left = `${from.x}px`;
  ui.attackSword.style.top = `${from.y}px`;
  ui.attackSword.classList.add("active");

  const impactDelay = 300;
  const animation = ui.attackSword.animate(
    [
      {
        left: `${from.x}px`,
        top: `${from.y}px`,
        opacity: 0,
        transform: `rotate(${angle}deg) scale(0.92)`,
      },
      {
        offset: 0.16,
        opacity: 1,
      },
      {
        offset: 0.72,
        left: `${to.x}px`,
        top: `${to.y}px`,
        opacity: 1,
        transform: `rotate(${angle}deg) scale(1)`,
      },
      {
        left: `${to.x}px`,
        top: `${to.y}px`,
        opacity: 0,
        transform: `rotate(${angle}deg) scale(0.96)`,
      },
    ],
    {
      duration: 430,
      easing: "cubic-bezier(0.2, 0.78, 0.22, 1)",
      fill: "both",
    },
  );

  window.setTimeout(() => applyPlayerAttackDamage(token, encounter), impactDelay);
  animation.onfinish = () => {
    if (token === attackAnimationToken) {
      hideAttackSword();
    }
  };
}

function hideAttackSword() {
  ui.attackSword.getAnimations().forEach((animation) => animation.cancel());
  ui.attackSword.classList.remove("active");
  ui.attackSword.style.opacity = "0";
}

function scheduleEnemyHealthLag(previousHp) {
  game.enemyDelayedHp = Math.max(game.enemyDelayedHp, previousHp);
  clearEnemyHealthLag();
  enemyHealthLagTimeout = window.setTimeout(() => {
    game.enemyDelayedHp = game.activeEncounter?.hp ?? 0;
    updateEnemyBars();
    enemyHealthLagTimeout = null;
  }, 800);
}

function clearEnemyHealthLag() {
  if (enemyHealthLagTimeout) {
    window.clearTimeout(enemyHealthLagTimeout);
    enemyHealthLagTimeout = null;
  }
}

function damagePlayer(amount) {
  const previousHp = game.playerHp;
  game.playerHp = Math.max(0, game.playerHp - amount);
  game.playerDelayedHp = Math.max(game.playerDelayedHp, previousHp);

  if (playerHealthLagTimeout) {
    window.clearTimeout(playerHealthLagTimeout);
  }

  playerHealthLagTimeout = window.setTimeout(() => {
    game.playerDelayedHp = game.playerHp;
    updatePlayerHud();
    playerHealthLagTimeout = null;
  }, 800);

  updatePlayerHud();
}

function updatePlayerHud() {
  const hpPercent = `${(game.playerHp / PLAYER_CONFIG.maxHp) * 100}%`;
  const lagPercent = `${(game.playerDelayedHp / PLAYER_CONFIG.maxHp) * 100}%`;
  const cooldownPercent = `${(game.playerAttackElapsed / PLAYER_CONFIG.attackCooldownMs) * 100}%`;

  ui.playerHealthFill.style.width = hpPercent;
  ui.playerHealthLag.style.width = lagPercent;
  ui.playerHealthText.textContent = `${game.playerHp}/${PLAYER_CONFIG.maxHp}`;
  ui.playerCooldownFill.style.width = cooldownPercent;
}

function updateEnemyBars() {
  if (!game.activeEncounter) {
    ui.enemyName.textContent = "";
    ui.enemyHealthFill.style.width = "100%";
    ui.enemyHealthLag.style.width = "100%";
    ui.enemyCooldownFill.style.width = "0%";
    return;
  }

  const enemy = ACT1_ENEMIES[game.activeEncounter.key];
  const hp = Math.max(0, game.activeEncounter.hp ?? enemy.battle.hp);
  const maxHp = Math.max(1, game.activeEncounter.maxHp ?? enemy.battle.hp);
  const delayedHp = Math.max(0, game.enemyDelayedHp || hp);
  const cooldown = enemy.battle.attackCooldownMs;

  ui.enemyName.textContent = enemy.name;
  ui.enemyHealthFill.style.width = `${(hp / maxHp) * 100}%`;
  ui.enemyHealthLag.style.width = `${(delayedHp / maxHp) * 100}%`;
  ui.enemyCooldownFill.style.width = `${Math.min(100, (game.enemyAttackElapsed / cooldown) * 100)}%`;
}

function updateEnemyLayer() {
  const encounter = getVisibleEncounter();

  if (!encounter || game.transitioning || game.completed) {
    hideEnemy();
    return;
  }

  const enemy = ACT1_ENEMIES[encounter.key];
  const rect = canvas.getBoundingClientRect();
  const dpr = canvas.width / Math.max(1, rect.width);
  const phase = Number(ui.phase.value);
  const bend = Number(ui.bend.value);
  const compress = Number(ui.compress.value);
  const spread = Number(ui.spread.value);
  const depth = getEncounterGroundDepth(encounter);
  const lane = game.battle ? 0 : encounter.lane;
  const anchor = warpPoint([0.5 + lane, depth], phase, bend, compress, spread, state.modeIndex, state.rect);
  const screen = toScreen(anchor, canvas.width, canvas.height);
  const cssX = screen[0] / dpr;
  const cssY = screen[1] / dpr;
  const perspectiveScale = getRoadPerspectiveScale(depth);
  const startScale = getRoadPerspectiveScale(ENCOUNTER_START_DEPTH);
  const battleScale = getRoadPerspectiveScale(ENCOUNTER_BATTLE_DEPTH);
  const scaleProgress = clamp((perspectiveScale - startScale) / (battleScale - startScale), 0, 1);
  const farHeightRatio = encounter.boss ? 0.052 : 0.026;
  const nearHeightRatio = encounter.boss ? 0.52 : 0.34;
  const heightRatio = farHeightRatio + Math.pow(scaleProgress, 1.12) * (nearHeightRatio - farHeightRatio);
  const hoverOffset = enemy.hover ? rect.height * (0.04 + depth * 0.05) : 0;
  const height = Math.min(
    rect.height * (encounter.boss ? 0.72 : 0.52),
    rect.height * heightRatio * enemy.size,
  );
  ui.enemyImage.src = enemy.sprites.idle;
  ui.enemySprite.style.left = `${cssX}px`;
  ui.enemySprite.style.top = `${cssY - hoverOffset}px`;
  ui.enemySprite.style.height = `${height}px`;
  ui.enemySprite.style.setProperty("--enemy-shadow-width", `${Math.max(28, height * 0.56)}px`);
  ui.enemySprite.style.setProperty("--enemy-shadow-height", `${Math.max(8, height * 0.12)}px`);
  ui.enemySprite.classList.toggle("visible", true);
  ui.enemySprite.classList.toggle("battle", game.battle);
  ui.enemySprite.classList.toggle("boss", Boolean(encounter.boss));
  ui.enemySprite.classList.toggle("grounded", !enemy.hover);
  ui.enemySprite.classList.toggle("hit", game.hitTimer > 0);
  ui.enemyLayer.setAttribute("aria-hidden", "false");
  updateEnemyBars();
}

function hideEnemy() {
  ui.enemySprite.classList.remove("visible", "battle", "boss", "grounded", "hit");
  ui.enemyLayer.setAttribute("aria-hidden", "true");
  updateEnemyBars();
}

function startPhaseTransition() {
  if (game.transitioning) return;

  const currentId = game.phase.id;
  const nextIndex = game.phaseIndex + 1;
  const nextPhase = ACT1_PHASES[nextIndex];

  game.transitioning = true;
  game.battle = false;
  game.activeEncounter = null;
  game.wheelTargetTravel = game.travel;
  game.forwardHeld = false;
  game.forwardUntil = 0;
  ui.stage.classList.remove("in-battle");
  updateStageProgress();
  hideEnemy();

  ui.transitionFrom.textContent = currentId;
  ui.transitionTo.textContent = nextPhase ? nextPhase.id : "Ato 1 completo";
  ui.transitionOverlay.classList.remove("show-next", "complete");
  ui.transitionOverlay.classList.add("active");
  ui.transitionOverlay.setAttribute("aria-hidden", "false");

  window.setTimeout(() => {
    ui.transitionOverlay.classList.add("show-next");
  }, 650);

  window.setTimeout(() => {
    if (nextPhase) {
      resetPhase(nextIndex);
    } else {
      game.completed = true;
      ui.transitionOverlay.classList.add("complete");
    }
  }, 1350);

  window.setTimeout(() => {
    if (!nextPhase) return;

    game.transitioning = false;
    ui.transitionOverlay.classList.remove("active", "show-next");
    ui.transitionOverlay.setAttribute("aria-hidden", "true");
    requestRender();
  }, 2150);
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
    decorCanvas.width = width;
    decorCanvas.height = height;
    guideCanvas.width = width;
    guideCanvas.height = height;
  }

  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;
  decorCanvas.style.width = `${rect.width}px`;
  decorCanvas.style.height = `${rect.height}px`;
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

function drawDecor() {
  const w = decorCanvas.width;
  const h = decorCanvas.height;
  decor.clearRect(0, 0, w, h);

  const phase = Number(ui.phase.value);
  const bend = Number(ui.bend.value);
  const compress = Number(ui.compress.value);
  const spread = Number(ui.spread.value);
  const scroll = state.textureOffset[1];

  ROADSIDE_TREES.map((tree, index) => {
    const depth = wrapUnit(tree.depth + scroll);
    const roadHalf = 0.055 + spread * 0.045 + (0.17 + spread * 0.12 - (0.055 + spread * 0.045)) * Math.pow(depth, 0.72);
    const roadsideOffset = 0.022 + Math.pow(depth, 1.28) * 0.055 + tree.offset;
    const pathDrift = Math.sin((depth + phase) * Math.PI * 0.72 + index * 0.35) * 0.008;
    const grassX = 0.5 + tree.side * (roadHalf + roadsideOffset) + pathDrift;
    const sway = Math.sin(index * 1.7 + phase * Math.PI * 2) * 0.004 * (0.5 + depth);
    const anchor = warpPoint(
      [grassX + sway, depth],
      phase,
      bend,
      compress,
      spread,
      state.modeIndex,
      state.rect,
    );
    const screen = toScreen(anchor, w, h);
    const perspectiveScale = getRoadPerspectiveScale(depth);

    return {
      depth,
      x: screen[0],
      y: screen[1],
      scale: perspectiveScale * tree.size,
      lean: tree.side * (0.18 + depth * 0.26),
    };
  })
    .sort((a, b) => a.depth - b.depth)
    .forEach((tree) => {
      if (tree.y < -h * 0.25 || tree.y > h * 1.18) return;
      drawPineTree(tree.x, tree.y, tree.scale, tree.lean);
    });
}

function drawPineTree(x, groundY, scale, lean) {
  const w = decorCanvas.width;
  const h = decorCanvas.height;
  const baseSize = Math.max(18, Math.min(w, h) * 0.16 * scale);

  decor.save();
  decor.imageSmoothingEnabled = false;

  const shadowWidth = baseSize * 0.52 * PINE_TREE_SIZE_MULTIPLIER;
  const shadowHeight = baseSize * 0.055 * PINE_TREE_SIZE_MULTIPLIER;
  const shadowGradient = decor.createRadialGradient(
    x,
    groundY + baseSize * 0.025,
    0,
    x,
    groundY + baseSize * 0.025,
    shadowWidth,
  );
  shadowGradient.addColorStop(0, "rgba(12, 18, 10, 0.18)");
  shadowGradient.addColorStop(0.58, "rgba(12, 18, 10, 0.09)");
  shadowGradient.addColorStop(1, "rgba(12, 18, 10, 0)");

  decor.fillStyle = shadowGradient;
  decor.beginPath();
  decor.ellipse(
    x,
    groundY + baseSize * 0.025,
    shadowWidth,
    shadowHeight,
    0,
    0,
    Math.PI * 2,
  );
  decor.fill();

  if (pineTreeImage.complete && pineTreeImage.naturalWidth > 0) {
    const treeHeight = baseSize * 1.35 * PINE_TREE_SIZE_MULTIPLIER;
    const treeWidth = treeHeight * (pineTreeImage.naturalWidth / pineTreeImage.naturalHeight);
    const leanOffset = lean * baseSize * 0.08;
    decor.drawImage(pineTreeImage, x - treeWidth / 2 + leanOffset, groundY - treeHeight, treeWidth, treeHeight);
  }

  decor.restore();
}

function drawGuide() {
  const w = guideCanvas.width;
  const h = guideCanvas.height;
  guide.clearRect(0, 0, w, h);

  if (!document.body.classList.contains("debug-enabled") || !ui.showGuides.checked) return;

  const phase = Number(ui.phase.value);
  const bend = Number(ui.bend.value);
  const compress = Number(ui.compress.value);
  const spread = Number(ui.spread.value);

  guide.save();
  guide.strokeStyle = "rgba(255,255,255,0.24)";
  guide.lineWidth = 1;
  guide.beginPath();
  const corners = [
    toScreen(warpPoint([1, 0], phase, bend, compress, spread, state.modeIndex, state.rect), w, h),
    toScreen(warpPoint([1, 1], phase, bend, compress, spread, state.modeIndex, state.rect), w, h),
    toScreen(warpPoint([0, 1], phase, bend, compress, spread, state.modeIndex, state.rect), w, h),
    toScreen(warpPoint([0, 0], phase, bend, compress, spread, state.modeIndex, state.rect), w, h),
  ];
  corners.forEach((point, index) => {
    if (index === 0) guide.moveTo(point[0], point[1]);
    else guide.lineTo(point[0], point[1]);
  });
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

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function lerp(start, end, progress) {
  return start + (end - start) * progress;
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
