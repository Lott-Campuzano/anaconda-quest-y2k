/**
 * main.js - Punto de entrada del juego
 * ====================================
 * Este módulo orquesta todos los sistemas:
 * - Crea escena, cámara, renderer y mundo voxel (Three.js).
 * - Crea el jugador y sus controles.
 * - Carga misiones y notas de audio como marcadores interactivos.
 * - Ejecuta el bucle de animación (game loop) con requestAnimationFrame.
 * - Detecta proximidad a interactuables y abre la UI correspondiente.
 *
 * Flujo general:
 *   init() -> crea todo -> animate() se llama cada frame -> actualiza y renderiza.
 */

import * as THREE from 'three';
import { INTERACT_DISTANCE } from './constants.js';
import { createScene, createCamera, createRenderer, addLights, buildTerrain, addDecorations, createInteractableMarker } from './world.js';
import { createPlayer, createInputState, attachInput, updatePlayer } from './player.js';
import { MISSIONS, createMissionState } from './missions.js';
import { AUDIO_LOGS } from './audioLogs.js';
import { createUIState, initUI, updateHUD, setNearbyText, showMission, showLog, closeModal, renderJournal, toggleJournal } from './ui.js';

// --- Referencias globales del juego (módulo) ---
// Las mantenemos a nivel de módulo para que el loop y handlers las usen.
let scene, camera, renderer, player, input, uiState;
let groundHeights;            // Mapa "x,z" -> altura del terreno
let missionState;             // Map de estado de misiones
let collectedLogs;            // Set de IDs de notas recolectadas
let interactables = [];       // Marcadores 3D de misiones y logs
let nearbyInteractable = null; // El interactuable más cercano dentro del rango
let clock;                    // Reloj de Three.js para delta time

/**
 * Inicializa el juego: crea mundo, jugador, UI y eventos.
 */
function init() {
  // 1) Escena y renderizador WebGL
  scene = createScene();
  camera = createCamera();
  const container = document.getElementById('game-root');
  renderer = createRenderer(container);
  clock = new THREE.Clock();

  // 2) Iluminación y terreno
  addLights(scene);
  const terrain = buildTerrain(scene);
  groundHeights = terrain.groundHeights;
  addDecorations(scene, groundHeights);

  // 3) Jugador y entrada
  player = createPlayer();
  scene.add(player);
  input = createInputState();

  // 4) Estado de juego
  missionState = createMissionState();
  collectedLogs = new Set();
  uiState = createUIState();
  uiState.collectedLogs = collectedLogs; // compartimos referencia con UI

  // 5) Crear marcadores interactivos para misiones y logs
  for (const mission of MISSIONS) {
    const marker = createInteractableMarker({
      id: mission.id,
      type: 'mission',
      title: mission.title,
      position: mission.position,
    }, groundHeights);
    scene.add(marker);
    interactables.push(marker);
  }
  for (const log of AUDIO_LOGS) {
    const marker = createInteractableMarker({
      id: log.id,
      type: 'log',
      title: log.title,
      position: log.position,
    }, groundHeights);
    scene.add(marker);
    interactables.push(marker);
  }

  // 6) UI: inicializar y mostrar estado inicial
  initUI(uiState);
  updateHUD(missionState, collectedLogs);
  renderJournal(uiState);

  // 7) Entrada: teclado/mouse. Callbacks conectan input con lógica de juego.
  attachInput(renderer.domElement, input, handleInteract, () => toggleJournal(uiState));

  // 8) Ajustar cámara/renderer si cambia el tamaño de ventana.
  window.addEventListener('resize', onResize);

  // 9) Iniciar bucle de animación.
  animate();
}

/**
 * Maneja el redimensionamiento de la ventana.
 * Actualiza aspecto de cámara y tamaño del renderer.
 */
function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix(); // Obligatorio tras cambiar aspect
  renderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * Busca el interactuable más cercano al jugador dentro del rango.
 * @returns {THREE.Group|null}
 */
function findNearbyInteractable() {
  let nearest = null;
  let nearestDist = Infinity;

  for (const obj of interactables) {
    // Si la misión ya fue completada, seguimos mostrándola (para repasar),
    // pero las notas recolectadas también se pueden volver a abrir.
    const dx = obj.position.x - player.position.x;
    const dz = obj.position.z - player.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz); // Distancia en plano XZ
    if (dist < INTERACT_DISTANCE && dist < nearestDist) {
      nearest = obj;
      nearestDist = dist;
    }
  }
  return nearest;
}

/**
 * Abre la misión o nota cercana cuando el jugador presiona E.
 */
function handleInteract() {
  // Si ya hay modal abierto o no hay nada cerca, no hacemos nada.
  if (uiState.modalOpen || !nearbyInteractable) return;

  const data = nearbyInteractable.userData;
  if (data.type === 'mission') {
    const mission = MISSIONS.find((m) => m.id === data.id);
    if (mission) showMission(uiState, mission, missionState, onGameStateChanged);
  } else if (data.type === 'log') {
    const log = AUDIO_LOGS.find((l) => l.id === data.id);
    if (log) showLog(uiState, log, collectedLogs, onGameStateChanged);
  }
}

/**
 * Callback cuando cambia el estado (misión completada / log recogido).
 * Actualiza HUD y marcas visuales.
 */
function onGameStateChanged() {
  updateHUD(missionState, collectedLogs);
  renderJournal(uiState);
}

/**
 * Actualiza animaciones visuales de marcadores.
 * @param {number} time - Tiempo total en segundos.
 */
function animateMarkers(time) {
  for (const obj of interactables) {
    const gem = obj.getObjectByName('gem');
    if (gem) {
      // Rotación y flotación suave para que el marcador "respire".
      gem.rotation.y = time * 1.2;
      gem.position.y = 1.6 + Math.sin(time * 2 + obj.position.x) * 0.12;
    }

    // Atenuamos marcadores de misiones completadas para indicar progreso.
    const data = obj.userData;
    if (data.type === 'mission') {
      const done = missionState.get(data.id)?.completed;
      gem.material.emissiveIntensity = done ? 0.15 : 0.45;
      gem.material.opacity = done ? 0.55 : 1;
      gem.material.transparent = done;
    }
  }
}

/**
 * Bucle principal del juego.
 * requestAnimationFrame llama a esta función antes de cada repaint (~60fps).
 */
function animate() {
  requestAnimationFrame(animate);

  // Delta time: segundos desde el último frame. Hace el movimiento independiente del FPS.
  const dt = Math.min(clock.getDelta(), 0.05);
  const time = clock.elapsedTime;

  // Actualizar jugador solo si no hay modal abierto.
  const frozen = uiState.modalOpen || !elStartHidden();
  updatePlayer(player, camera, input, groundHeights, dt, frozen);

  // Detectar interactuable cercano y mostrar pista en HUD.
  nearbyInteractable = frozen ? null : findNearbyInteractable();
  if (nearbyInteractable) {
    const d = nearbyInteractable.userData;
    const prefix = d.type === 'mission' ? 'Misión' : 'Nota de audio';
    setNearbyText(`${prefix}: ${d.title} — Presiona [E] para interactuar`);
  } else {
    setNearbyText(input.pointerLocked ? 'Explora el campus de Viper Corp...' : 'Haz click en el juego para mirar alrededor.');
  }

  // Animar marcadores y renderizar la escena.
  animateMarkers(time);
  renderer.render(scene, camera);
}

/**
 * Comprueba si la pantalla de inicio ya fue cerrada.
 * Evita mover al jugador mientras lee la historia inicial.
 * @returns {boolean}
 */
function elStartHidden() {
  return document.getElementById('start-screen').classList.contains('hidden');
}

// Arrancamos el juego cuando el DOM está listo.
// Como usamos <script type="module">, ya se ejecuta diferido, pero esto es explícito.
init();
