/**
 * constants.js - Configuración global del juego
 * =============================================
 * Centraliza valores que se usan en varios módulos: tamaño del mundo,
 * colores, velocidades y utilidades pequeñas. Tener constantes en un solo
 * lugar evita "números mágicos" dispersos por el código.
 */

// Tamaño del mundo en voxeles (el mapa es un cuadrado WORLD_SIZE x WORLD_SIZE).
export const WORLD_SIZE = 96;

// Tamaño de cada bloque/voxel en unidades de Three.js.
export const VOXEL_SIZE = 1;

// Velocidad base de caminata del jugador (unidades por segundo).
export const WALK_SPEED = 5;

// Multiplicador de velocidad cuando se mantiene Shift.
export const RUN_MULTIPLIER = 1.8;

// Velocidad de rotación de la cámara con el mouse (radianes por píxel).
export const MOUSE_SENSITIVITY = 0.0035;

// Distancia máxima para poder interactuar con una misión o nota.
export const INTERACT_DISTANCE = 3.2;

// Gravedad simple para mantener al jugador pegado al terreno.
export const GRAVITY = 18;

// Colores reutilizados en materiales voxel.
export const COLORS = {
  grass: 0x4f8a3d,
  dirt: 0x7a5230,
  stone: 0x808080,
  water: 0x2f6fb3,
  sand: 0xcdb373,
  path: 0x6b7280,
  trunk: 0x6b4f2a,
  leaves: 0x2f7d32,
  building: 0x94a3b8,
  roof: 0x334155,
  accent: 0x7cff6b,
  danger: 0xff6b6b,
  npc: 0xf59e0b,
};

/**
 * Limita un valor entre un mínimo y un máximo.
 * @param {number} value - Valor a limitar.
 * @param {number} min - Límite inferior.
 * @param {number} max - Límite superior.
 * @returns {number} Valor dentro del rango.
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Interpolación lineal: útil para suavizar movimiento/cámara.
 * @param {number} a - Valor inicial.
 * @param {number} b - Valor objetivo.
 * @param {number} t - Factor [0..1].
 * @returns {number} Valor interpolado.
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}
