/**
 * world.js - Construcción del mundo abierto voxel
 * ===============================================
 * Crea la escena de Three.js: iluminación, terreno, agua, edificios,
 * árboles y marcadores interactivos (misiones y notas de audio).
 * También expone utilidades para consultar la altura del suelo y
 * la lista de interactuables para detección de proximidad.
 */

import * as THREE from 'three';
import { WORLD_SIZE, COLORS, VOXEL_SIZE } from './constants.js';
import { BOX_GEOMETRY, voxelMaterial, terrainHeight, groundColor, createTree, createBuilding } from './voxels.js';

/**
 * Crea y configura la escena principal.
 * @returns {THREE.Scene}
 */
export function createScene() {
  const scene = new THREE.Scene();
  // Color de fondo y niebla: dan profundidad y ocultan el borde del mapa.
  scene.background = new THREE.Color(0x87ceeb);
  scene.fog = new THREE.Fog(0x87ceeb, 35, 95);
  return scene;
}

/**
 * Crea la cámara en perspectiva.
 * @returns {THREE.PerspectiveCamera}
 */
export function createCamera() {
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 8, 12); // Posición inicial detrás del jugador
  return camera;
}

/**
 * Crea el renderer WebGL y lo agrega al contenedor del DOM.
 * @param {HTMLElement} container - Elemento donde se inserta el canvas.
 * @returns {THREE.WebGLRenderer}
 */
export function createRenderer(container) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  // Limitamos pixel ratio para evitar coste excesivo en pantallas HiDPI.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true; // Sombras suaves para dar profundidad
  container.appendChild(renderer.domElement);
  return renderer;
}

/**
 * Agrega luces a la escena.
 * Usamos una luz hemisférica (cielo/suelo) + direccional (sol).
 * @param {THREE.Scene} scene
 */
export function addLights(scene) {
  // Hemisférica: ilumina suavemente todo, simula luz ambiente del cielo.
  const hemi = new THREE.HemisphereLight(0xbfdfff, 0x445533, 0.9);
  scene.add(hemi);

  // Direccional: simula el sol y proyecta sombras.
  const sun = new THREE.DirectionalLight(0xfff2cc, 1.15);
  sun.position.set(30, 50, 20);
  sun.castShadow = true;
  // Ajustamos el área de sombras para cubrir el mundo visible.
  sun.shadow.camera.left = -50;
  sun.shadow.camera.right = 50;
  sun.shadow.camera.top = 50;
  sun.shadow.camera.bottom = -50;
  sun.shadow.mapSize.set(1024, 1024);
  scene.add(sun);
}

/**
 * Construye el terreno voxel con InstancedMesh.
 * InstancedMesh dibuja muchos cubos iguales en una sola llamada de render,
 * lo que es mucho más eficiente que miles de Mesh individuales.
 * @param {THREE.Scene} scene
 * @returns {{ groundHeights: Map<string, number> }} Mapa de alturas para colisiones.
 */
export function buildTerrain(scene) {
  const half = WORLD_SIZE / 2;
  const total = WORLD_SIZE * WORLD_SIZE;
  const groundMat = voxelMaterial(COLORS.grass);
  const ground = new THREE.InstancedMesh(BOX_GEOMETRY, groundMat, total);
  ground.receiveShadow = true;
  ground.castShadow = false;

  // Dummy Object3D: lo usamos para calcular matrices de cada instancia.
  const dummy = new THREE.Object3D();
  // Color por instancia: permite variar pasto/camino/arena en un solo InstancedMesh.
  const color = new THREE.Color();
  const groundHeights = new Map(); // clave "x,z" -> altura y

  let i = 0;
  for (let x = -half; x < half; x++) {
    for (let z = -half; z < half; z++) {
      const y = terrainHeight(x, z);
      dummy.position.set(x * VOXEL_SIZE, y * VOXEL_SIZE, z * VOXEL_SIZE);
      dummy.updateMatrix();
      ground.setMatrixAt(i, dummy.matrix);

      // Asignamos color según tipo de terreno.
      color.setHex(groundColor(x, z, y));
      ground.setColorAt(i, color);

      // Guardamos altura para que el jugador pueda "pisar" el terreno.
      groundHeights.set(`${x},${z}`, y);
      i++;
    }
  }

  // Informamos a Three.js que las matrices y colores fueron actualizados.
  ground.instanceMatrix.needsUpdate = true;
  if (ground.instanceColor) ground.instanceColor.needsUpdate = true;
  scene.add(ground);

  // Agua: un plano semitransparente en la esquina sureste.
  const water = new THREE.Mesh(
    new THREE.PlaneGeometry(18, 18),
    new THREE.MeshStandardMaterial({ color: COLORS.water, transparent: true, opacity: 0.72, roughness: 0.2 })
  );
  water.rotation.x = -Math.PI / 2; // Rotamos para que quede horizontal
  water.position.set(39, 0.8, 39);
  scene.add(water);

  return { groundHeights };
}

/**
 * Obtiene la altura del terreno en una coordenada del mundo.
 * Si está fuera del mapa, devuelve 0.
 * @param {Map<string, number>} groundHeights
 * @param {number} x
 * @param {number} z
 * @returns {number}
 */
export function getGroundHeight(groundHeights, x, z) {
  // Redondeamos a la celda voxel más cercana.
  const gx = Math.round(x);
  const gz = Math.round(z);
  return groundHeights.get(`${gx},${gz}`) ?? 0;
}

/**
 * Agrega decoraciones: árboles, edificios y puntos de referencia.
 * @param {THREE.Scene} scene
 * @param {Map<string, number>} groundHeights
 */
export function addDecorations(scene, groundHeights) {
  // Árboles colocados manualmente para crear un mundo legible.
  const treePositions = [
    [-12, 12], [-15, 6], [10, 15], [16, 10], [22, -12], [-28, -5],
    [-6, -20], [8, -16], [30, 8], [-34, 16], [18, 30], [-18, 28],
    [35, -10], [-10, -32], [0, 30], [32, 30]
  ];
  for (const [x, z] of treePositions) {
    const y = getGroundHeight(groundHeights, x, z);
    scene.add(createTree(x, y, z));
  }

  // Edificios de Viper Corp: sirven como landmarks del mundo abierto.
  scene.add(createBuilding(-14, getGroundHeight(groundHeights, -14, -14), -14, 7, 5, 4, 0x64748b)); // Laboratorio
  scene.add(createBuilding(24, getGroundHeight(groundHeights, 24, 20), 20, 6, 6, 3, 0x475569));   // Zona grúas
  scene.add(createBuilding(-28, getGroundHeight(groundHeights, -28, 22), 22, 7, 5, 4, 0x334155)); // Comando
  scene.add(createBuilding(32, getGroundHeight(groundHeights, 32, -24), -24, 8, 6, 4, 0x1e293b)); // Búnker
  scene.add(createBuilding(8, getGroundHeight(groundHeights, 8, -26), -26, 6, 5, 3, 0x475569));  // Hangar
}

/**
 * Crea un marcador interactivo flotante (gema/antena voxel).
 * @param {{id:string, type:'mission'|'log', title:string, position:{x:number,z:number}}} data
 * @param {Map<string, number>} groundHeights
 * @returns {THREE.Group}
 */
export function createInteractableMarker(data, groundHeights) {
  const group = new THREE.Group();
  const baseY = getGroundHeight(groundHeights, data.position.x, data.position.z);

  // Color según tipo: verde para misiones, ámbar para notas de audio.
  const color = data.type === 'mission' ? COLORS.accent : COLORS.npc;
  const mat = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.45,
    flatShading: true,
  });

  // Columna base.
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 0.8), voxelMaterial(COLORS.roof));
  base.position.set(0, 0.2, 0);
  group.add(base);

  // Gema flotante: rota en el loop para llamar la atención.
  const gem = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.7), mat);
  gem.position.set(0, 1.6, 0);
  gem.rotation.y = Math.PI / 4;
  gem.rotation.x = Math.PI / 4;
  gem.name = 'gem'; // Nombre para encontrarlo en la animación
  group.add(gem);

  // Luz puntual pequeña para hacer el marcador visible de lejos.
  const light = new THREE.PointLight(color, 1.2, 8);
  light.position.set(0, 1.8, 0);
  group.add(light);

  group.position.set(data.position.x, baseY, data.position.z);
  // Guardamos metadata en userData para identificarla al interactuar.
  group.userData = { ...data, baseY, marker: true };
  return group;
}
