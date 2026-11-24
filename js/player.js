/**
 * player.js - Personaje del jugador y cámara en tercera persona
 * =============================================================
 * Define el avatar voxel del programador, el estado de entrada (teclado/mouse),
 * el movimiento relativo a la cámara y el seguimiento de cámara suave.
 * El objetivo es un control simple y comprensible, no un motor físico complejo.
 */

import * as THREE from 'three';
import { WALK_SPEED, RUN_MULTIPLIER, MOUSE_SENSITIVITY, WORLD_SIZE, clamp, lerp } from './constants.js';
import { createVoxel, voxelMaterial } from './voxels.js';
import { getGroundHeight } from './world.js';

/**
 * Crea el personaje voxel (un programador con "hoodie" verde).
 * @returns {THREE.Group}
 */
export function createPlayer() {
  const group = new THREE.Group();

  // Cuerpo: construimos con pequeños cubos para mantener el estilo voxel.
  const skin = 0xf1c27d;
  const hoodie = 0x1f2937;
  const pants = 0x374151;
  const accent = 0x7cff6b; // detalle verde estilo Python/terminal

  // Piernas
  group.add(createVoxel(pants, -0.2, 0.5, 0));
  group.add(createVoxel(pants, 0.2, 0.5, 0));
  // Torso
  group.add(createVoxel(hoodie, 0, 1.2, 0));
  group.add(createVoxel(hoodie, 0, 1.8, 0));
  group.add(createVoxel(accent, 0, 1.5, 0.51)); // logo verde en el pecho
  // Brazos
  group.add(createVoxel(hoodie, -0.65, 1.5, 0));
  group.add(createVoxel(hoodie, 0.65, 1.5, 0));
  // Cabeza
  group.add(createVoxel(skin, 0, 2.5, 0));
  group.add(createVoxel(0x111827, 0, 2.85, 0)); // cabello/gorro

  // Escalamos ligeramente para que se vea proporcionado.
  group.scale.setScalar(0.9);
  group.position.set(0, 1, 0);
  group.traverse((obj) => { obj.castShadow = true; });
  return group;
}

/**
 * Estado de entrada del usuario.
 * Se actualiza con eventos de teclado y mouse.
 */
export function createInputState() {
  return {
    keys: new Set(),      // Teclas actualmente presionadas
    yaw: 0,               // Rotación horizontal de cámara (radianes)
    pitch: 0.45,          // Rotación vertical de cámara (radianes)
    pointerLocked: false, // Si el mouse está capturado por el juego
  };
}

/**
 * Registra listeners de teclado y mouse.
 * @param {HTMLElement} canvas - Canvas donde se activa pointer lock.
 * @param {object} input - Estado creado por createInputState().
 * @param {Function} onInteract - Callback cuando se presiona E.
 * @param {Function} onToggleJournal - Callback cuando se presiona M.
 */
export function attachInput(canvas, input, onInteract, onToggleJournal) {
  // Teclado: guardamos teclas en un Set para soportar múltiples a la vez.
  window.addEventListener('keydown', (e) => {
    const key = e.key.toLower();
    input.keys.add(key);
    // Evitamos scroll con flechas/espacio durante el juego.
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) e.preventDefault();
    if (key === 'e') onInteract();
    if (key === 'm') onToggleJournal();
  });

  window.addEventListener('keyup', (e) => {
    input.keys.delete(e.key.toLowerCase());
  });

  // Pointer lock: al hacer click en el canvas, capturamos el mouse para mirar alrededor.
  canvas.addEventListener('click', () => {
    if (!input.pointerLocked) canvas.requestPointerLock();
  });

  document.addEventListener('pointerlockchange', () => {
    input.pointerLocked = document.pointerLockElement === canvas;
  });

  // Movimiento del mouse: solo rota la cámara cuando está en pointer lock.
  document.addEventListener('mousemove', (e) => {
    if (!input.pointerLocked) return;
    input.yaw -= e.movementX * MOUSE_SENSITIVITY;
    input.pitch -= e.movementY * MOUSE_SENSITIVITY;
    // Limitamos pitch para no voltear la cámara completamente.
    input.pitch = clamp(input.pitch, 0.15, 1.2);
  });
}

/**
 * Actualiza posición del jugador y cámara según entrada y delta time.
 * @param {THREE.Group} player - El personaje.
 * @param {THREE.PerspectiveCamera} camera - Cámara.
 * @param {object} input - Estado de entrada.
 * @param {Map<string,number>} groundHeights - Alturas del terreno.
 * @param {number} dt - Delta time en segundos.
 * @param {boolean} frozen - Si true, bloquea movimiento (modal abierto).
 */
export function updatePlayer(player, camera, input, groundHeights, dt, frozen) {
  // Dirección de movimiento basada en teclas WASD/flechas.
  let moveX = 0;
  let moveZ = 0;
  if (!frozen) {
    if (input.keys.has('w') || input.keys.has('arrowup')) moveZ += 1;
    if (input.keys.has('s') || input.keys.has('arrowdown')) moveZ -= 1;
    if (input.keys.has('a') || input.keys.has('arrowleft')) moveX -= 1;
    if (input.keys.has('d') || input.keys.has('arrowright')) moveX += 1;
  }

  // Convertimos la dirección local a dirección del mundo usando el yaw de cámara.
  const direction = new THREE.Vector3(moveX, 0, moveZ);
  if (direction.lengthSq() > 0) {
    direction.normalize();
    // Rotamos el vector por el ángulo yaw para que "adelante" sea donde mira la cámara.
    direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), input.yaw);

    const speed = WALK_SPEED * (input.keys.has('shift') ? RUN_MULTIPLIER : 1);
    player.position.x += direction.x * speed * dt;
    player.position.z += direction.z * speed * dt;

    // Hacemos que el personaje mire hacia la dirección de movimiento.
    const targetRotation = Math.atan2(direction.x, direction.z);
    // Interpolación angular simple para giro suave.
    player.rotation.y = lerpAngle(player.rotation.y, targetRotation, 0.15);
  }

  // Limitar al jugador dentro del mundo abierto.
  const bound = WORLD_SIZE / 2 - 2;
  player.position.x = clamp(player.position.x, -bound, bound);
  player.position.z = clamp(player.position.z, -bound, bound);

  // Ajustar altura al terreno: el jugador "pisa" el suelo.
  const groundY = getGroundHeight(groundHeights, player.position.x, player.position.z);
  const targetY = groundY + 0.5; // +0.5 para que la base del personaje quede sobre el voxel
  player.position.y = lerp(player.position.y, targetY, 0.2);

  // Cámara en tercera persona: orbita detrás del jugador según yaw/pitch.
  const camDistance = 9;
  const camHeight = 4 + input.pitch * 6;
  const camX = player.position.x - Math.sin(input.yaw) * camDistance;
  const camZ = player.position.z - Math.cos(input.yaw) * camDistance;
  const desired = new THREE.Vector3(camX, player.position.y + camHeight, camZ);
  camera.position.lerp(desired, 0.08); // Suavizado para evitar saltos bruscos

  // La cámara mira ligeramente arriba del personaje.
  const lookTarget = new THREE.Vector3(player.position.x, player.position.y + 2.2, player.position.z);
  camera.lookAt(lookTarget);
}

/**
 * Interpola ángulos manejando el salto entre -PI y PI.
 * @param {number} a - Ángulo actual.
 * @param {number} b - Ángulo objetivo.
 * @param {number} t - Factor de interpolación.
 * @returns {number}
 */
function lerpAngle(a, b, t) {
  // Normaliza la diferencia al rango [-PI, PI] para girar por el camino corto.
  let diff = b - a;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return a + diff * t;
}
