/**
 * voxels.js - Utilidades para crear geometría voxel
 * ==================================================
 * "Voxel art" significa construir el mundo con cubos (como Minecraft).
 * Este módulo crea materiales y mallas reutilizables para no repetir código.
 * Usamos InstancedMesh cuando hay muchos bloques iguales (suelo) porque
 * es mucho más eficiente que crear un mesh por bloque.
 */

import * as THREE from 'three';
import { COLORS, VOXEL_SIZE } from './constants.js';

/**
 * Crea un material estándar para voxels.
 * flatShading da el aspecto de caras planas típico del voxel art.
 * @param {number} color - Color hexadecimal (ej: 0x4f8a3d).
 * @returns {THREE.MeshStandardMaterial}
 */
export function voxelMaterial(color) {
  return new THREE.MeshStandardMaterial({
    color,
    flatShading: true, // Cada cara se ve plana: estética voxel
    roughness: 0.95,
  });
}

// Geometría de cubo compartida. Reutilizarla ahorra memoria.
export const BOX_GEOMETRY = new THREE.BoxGeometry(VOXEL_SIZE, VOXEL_SIZE, VOXEL_SIZE);

/**
 * Crea un mesh de un solo voxel.
 * @param {number} color - Color del voxel.
 * @param {number} x - Posición X.
 * @param {number} y - Posición Y (altura).
 * @param {number} z - Posición Z.
 * @returns {THREE.Mesh}
 */
export function createVoxel(color, x, y, z) {
  const mesh = new THREE.Mesh(BOX_GEOMETRY, voxelMaterial(color));
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/**
 * Genera una altura de terreno simple usando senos/cosenos.
 * No es ruido Perlin real, pero produce colinas suaves sin dependencias.
 * @param {number} x - Coordenada X en el mundo.
 * @param {number} z - Coordenada Z en el mundo.
 * @returns {number} Altura entera del terreno.
 */
export function terrainHeight(x, z) {
  // Combinamos varias ondas para que el terreno no sea plano ni repetitivo.
  const h = Math.sin(x * 0.08) * 1.8 + Math.cos(z * 0.07) * 1.6 + Math.sin((x + z) * 0.05) * 1.2;
  // Redondeamos a entero para mantener el look voxel por "escalones".
  return Math.max(0, Math.round(h));
}

/**
 * Determina el color del suelo según altura y ubicación.
 * Esto da variedad visual: pasto, arena cerca del "agua", piedra en zonas altas.
 * @param {number} x
 * @param {number} z
 * @param {number} y - Altura.
 * @returns {number} Color hexadecimal.
 */
export function groundColor(x, z, y) {
  // Camino central de piedra gris para guiar al jugador.
  if (Math.abs(x) < 2 || Math.abs(z) < 2) return COLORS.path;
  // Zona de agua/borde arenoso en una esquina del mapa.
  if (x > 30 && z > 30 && y <= 1) return COLORS.sand;
  // Cimas más altas se ven rocosas.
  if (y >= 3) return COLORS.stone;
  // Por defecto, pasto verde.
  return COLORS.grass;
}

/**
 * Crea un árbol voxel simple (tronco + copa).
 * @param {number} x - Posición X.
 * @param {number} y - Altura base del suelo.
 * @param {number} z - Posición Z.
 * @returns {THREE.Group} Grupo con los voxeles del árbol.
 */
export function createTree(x, y, z) {
  const tree = new THREE.Group();
  // Tronco: 3 bloques verticales.
  for (let i = 1; i <= 3; i++) {
    tree.add(createVoxel(COLORS.trunk, x, y + i, z));
  }
  // Copa: capa de hojas alrededor y arriba del tronco.
  const topY = y + 4;
  for (let dx = -1; dx <= 1; dx++) {
    for (let dz = -1; dz <= 1; dz++) {
      for (let dy = 0; dy <= 1; dy++) {
        // Recortamos las esquinas para que se vea más redondeado/voxel.
        if (Math.abs(dx) === 1 && Math.abs(dz) === 1 && dy === 1) continue;
        tree.add(createVoxel(COLORS.leaves, x + dx, topY + dy, z + dz));
      }
    }
  }
  return tree;
}

/**
 * Crea un edificio voxel pequeño (cuerpo + techo).
 * Sirve como punto de referencia en el mundo abierto.
 * @param {number} x - Centro X.
 * @param {number} baseY - Altura del suelo.
 * @param {number} z - Centro Z.
 * @param {number} w - Ancho.
 * @param {number} d - Profundidad.
 * @param {number} h - Altura de paredes.
 * @param {number} color - Color del edificio.
 * @returns {THREE.Group}
 */
export function createBuilding(x, baseY, z, w, d, h, color = COLORS.building) {
  const building = new THREE.Group();
  // Paredes: rellenamos el volumen, dejando el interior hueco visualmente simple.
  for (let dx = -Math.floor(w / 2); dx <= Math.floor(w / 2); dx++) {
    for (let dz = -Math.floor(d / 2); dz <= Math.floor(d / 2); dz++) {
      for (let dy = 1; dy <= h; dy++) {
        const isWall = dx === -Math.floor(w / 2) || dx === Math.floor(w / 2) || dz === -Math.floor(d / 2) || dz === Math.floor(d / 2);
        const isDoor = dy <= 2 && dx === 0 && dz === Math.floor(d / 2);
        // Solo dibujamos paredes y dejamos una puerta.
        if (isWall && !isDoor) {
          building.add(createVoxel(color, x + dx, baseY + dy, z + dz));
        }
      }
      // Techo plano encima del edificio.
      building.add(createVoxel(COLORS.roof, x + dx, baseY + h + 1, z + dz));
    }
  }
  return building;
}
