/**
 * ui.js - Interfaz de usuario del juego
 * =====================================
 * Maneja el HUD, el modal de misiones/notas, el diario de aprendizaje
 * y la reproducción de notas de audio mediante Web Speech API.
 *
 * La UI está separada de la lógica 3D para que el código sea más fácil
 * de entender: Three.js dibuja el mundo; este módulo dibuja la información.
 */

import { MISSIONS } from './missions.js';
import { AUDIO_LOGS } from './audioLogs.js';

/**
 * Crea el estado de la UI.
 * @returns {object}
 */
export function createUIState() {
  return {
    modalOpen: false,       // Si hay un modal abierto, congelamos movimiento
    current: null,          // Interactable actual mostrado en modal
    journalOpen: false,     // Visibilidad del diario lateral
    learned: [],            // Conceptos aprendidos (para el diario)
  };
}

/**
 * Referencias a elementos del DOM. Se consultan una vez para eficiencia.
 */
const el = {
  objective: document.getElementById('hud-objective'),
  progressText: document.getElementById('hud-progress-text'),
  progressBar: document.getElementById('hud-progress-bar'),
  missions: document.getElementById('hud-missions'),
  logs: document.getElementById('hud-logs'),
  nearby: document.getElementById('hud-nearby'),
  modal: document.getElementById('modal'),
  modalTag: document.getElementById('modal-tag'),
  modalTitle: document.getElementById('modal-title'),
  modalBody: document.getElementById('modal-body'),
  modalActions: document.getElementById('modal-actions'),
  modalClose: document.getElementById('modal-close'),
  journal: document.getElementById('journal'),
  journalContent: document.getElementById('journal-content'),
  journalClose: document.getElementById('journal-close'),
  startScreen: document.getElementById('start-screen'),
  startBtn: document.getElementById('start-btn'),
};

/**
 * Inicializa eventos estáticos de la UI.
 * @param {object} uiState
 * @param {Function} onClose - Callback opcional al cerrar modal.
 */
export function initUI(uiState, onClose) {
  el.modalClose.addEventListener('click', () => closeModal(uiState, onClose));
  el.journalClose.addEventListener('click', () => toggleJournal(uiState));
  // El botón de inicio oculta la pantalla de historia.
  el.startBtn.addEventListener('click', () => {
    el.startScreen.classList.add('hidden');
  });
}

/**
 * Muestra u oculta el diario de aprendizaje.
 * @param {object} uiState
 */
export function toggleJournal(uiState) {
  uiState.journalOpen = !uiState.journalOpen;
  el.journal.classList.toggle('hidden', !uiState.journalOpen);
}

/**
 * Actualiza el HUD con progreso actual.
 * @param {Map} missionState
 * @param {Set} collectedLogs
 */
export function updateHUD(missionState, collectedLogs) {
  const doneMissions = [...missionState.values()].filter((m) => m.completed).length;
  const totalMissions = MISSIONS.length;
  const doneLogs = collectedLogs.size;
  const totalLogs = AUDIO_LOGS.length;

  // Progreso combinado: misiones pesan más que logs.
  const total = totalMissions + totalLogs;
  const done = doneMissions + doneLogs;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  el.progressText.textContent = `${pct}%`;
  el.progressBar.style.width = `${pct}%`;
  el.missions.textContent = `${doneMissions}/${totalMissions}`;
  el.logs.textContent = `${doneLogs}/${totalLogs}`;

  // Objetivo actual: siguiente misión no completada.
  const next = MISSIONS.find((m) => !missionState.get(m.id).completed);
  el.objective.textContent = next
    ? `Siguiente misión: ${next.title} (${next.area})`
    : '¡Completaste todas las misiones! Explora y revisa tu diario.';
}

/**
 * Muestra texto de interacción cercana.
 * @param {string|null} text
 */
export function setNearbyText(text) {
  el.nearby.textContent = text || 'Nada interactivo cerca.';
}

/**
 * Abre el modal con contenido HTML controlado.
 * @param {object} uiState
 * @param {string} tag
 * @param {string} title
 * @param {string} bodyHTML
 * @param {HTMLElement[]} actions
 */
function openModal(uiState, tag, title, bodyHTML, actions = []) {
  uiState.modalOpen = true;
  el.modalTag.textContent = tag;
  el.modalTitle.textContent = title;
  el.modalBody.innerHTML = bodyHTML;
  el.modalActions.innerHTML = '';
  for (const btn of actions) el.modalActions.appendChild(btn);
  el.modal.classList.remove('hidden');
  el.modal.classList.add('flex');
  // Al abrir modal salimos de pointer lock para poder usar botones.
  if (document.pointerLockElement) document.exitPointerLock();
}

/**
 * Cierra el modal.
 * @param {object} uiState
 * @param {Function} onClose
 */
export function closeModal(uiState, onClose) {
  uiState.modalOpen = false;
  uiState.current = null;
  el.modal.classList.add('hidden');
  el.modal.classList.remove('flex');
  // Detener cualquier nota de audio en reproducción.
  window.speechSynthesis?.cancel();
  if (onClose) onClose();
}

/**
 * Crea un botón estilizado para el pie del modal.
 * @param {string} label
 * @param {string} className
 * @param {Function} onClick
 * @returns {HTMLButtonElement}
 */
function actionButton(label, className, onClick) {
  const btn = document.createElement('button');
  btn.className = className;
  btn.textContent = label;
  btn.addEventListener('click', onClick);
  return btn;
}

/**
 * Renderiza una nota de audio en el modal.
 * @param {object} uiState
 * @param {object} log - Objeto de AUDIO_LOGS.
 * @param {Set} collectedLogs
 * @param {Function} onUpdate
 */
export function showLog(uiState, log, collectedLogs, onUpdate) {
  uiState.current = { type: 'log', id: log.id };
  collectedLogs.add(log.id); // Recoger el log al abrirlo

  const body = `
    <div class="space-y-4">
      <p class="text-slate-300"><strong class="text-amber">De:</strong> ${escapeHTML(log.friend)} &nbsp;|&nbsp; <strong class="text-amber">Área:</strong> ${escapeHTML(log.area)}</p>
      <div class="bg-slate-800/60 border border-slate-700 rounded-lg p-4">
        <p class="text-xs uppercase tracking-widest text-slate-400 mb-2">Transcripción de nota de audio</p>
        <p class="text-slate-200 whitespace-pre-line">${escapeHTML(log.transcript)}</p>
      </div>
      <div>
        <p class="text-xs uppercase tracking-widest text-venom mb-2">Concepto: ${escapeHTML(log.concept)}</p>
        <pre class="code-block">${escapeHTML(log.codeExample)}</pre>
      </div>
    </div>
  `;

  const playBtn = actionButton('▶ Reproducir nota de audio', 'px-4 py-2 rounded-lg bg-amber text-slate-950 font-semibold hover:bg-yellow-300', () => {
    speakText(log.transcript, log.friend);
  });
  const stopBtn = actionButton('■ Detener audio', 'px-4 py-2 rounded-lg border border-slate-600 text-slate-200 hover:bg-slate-800', () => {
    window.speechSynthesis?.cancel();
  });
  const closeBtn = actionButton('Cerrar', 'px-4 py-2 rounded-lg bg-venom text-slate-950 font-semibold hover:bg-lime-300', () => closeModal(uiState));

  openModal(uiState, 'NOTA DE AUDIO', log.title, body, [playBtn, stopBtn, closeBtn]);
  addLearnedConcept(uiState, log.concept, log.codeExample);
  onUpdate();
}

/**
 * Renderiza una misión en el modal con opciones interactivas.
 * @param {object} uiState
 * @param {object} mission
 * @param {Map} missionState
 * @param {Function} onUpdate
 */
export function showMission(uiState, mission, missionState, onUpdate) {
  uiState.current = { type: 'mission', id: mission.id };
  const completed = missionState.get(mission.id)?.completed;

  const body = `
    <div class="space-y-4">
      <p class="text-slate-300"><strong class="text-amber">Personaje:</strong> ${escapeHTML(mission.character)} &nbsp;|&nbsp; <strong class="text-amber">Área:</strong> ${escapeHTML(mission.area)}</p>
      <p class="text-slate-200">${escapeHTML(mission.story)}</p>
      <div class="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <p class="text-xs uppercase tracking-widest text-venom mb-2">Concepto: ${escapeHTML(mission.concept)}</p>
        <p class="text-slate-300">${mission.lesson}</p>
      </div>
      <div>
        <p class="text-xs uppercase tracking-widest text-slate-400 mb-2">Ejemplo en Python</p>
        <pre class="code-block">${escapeHTML(mission.codeExample)}</pre>
      </div>
      <div>
        <p class="font-semibold text-white mb-2">${escapeHTML(mission.prompt)}</p>
        <div id="choices" class="space-y-2"></div>
        <div id="feedback" class="mt-3 text-sm"></div>
      </div>
    </div>
  `;

  openModal(uiState, completed ? 'MISIÓN COMPLETADA' : 'MISIÓN', mission.title, body, [
    actionButton('Cerrar', 'px-4 py-2 rounded-lg border border-slate-600 text-slate-200 hover:bg-slate-800', () => closeModal(uiState))
  ]);

  // Creamos botones de opciones dinámicamente para manejar clicks.
  const choicesEl = document.getElementById('choices');
  const feedbackEl = document.getElementById('feedback');
  mission.choices.forEach((choice, idx) => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = choice.text;
    btn.disabled = completed; // Si ya se completó, solo mostramos la info.
    btn.addEventListener('click', () => {
      // Deshabilitamos todas las opciones tras responder.
      choicesEl.querySelectorAll('button').forEach((b) => (b.disabled = true));
      btn.classList.add(choice.correct ? 'correct' : 'wrong');
      feedbackEl.innerHTML = `<div class="p-3 rounded-lg ${choice.correct ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-200' : 'bg-rose-950/60 border border-rose-500/40 text-rose-200'}">${escapeHTML(choice.feedback)}</div>`;
      if (choice.correct) {
        missionState.set(mission.id, { completed: true });
        addLearnedConcept(uiState, mission.concept, mission.codeExample);
        updateHUD(missionState, uiState.collectedLogs);
        renderJournal(uiState);
        onUpdate();
      }
    });
    choicesEl.appendChild(btn);
  });

  if (completed) {
    feedbackEl.innerHTML = `<div class="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-200">Ya completaste esta misión. Puedes revisar el concepto cuando quieras.</div>`;
  }
}

/**
 * Agrega un concepto aprendido al diario si no existe.
 * @param {object} uiState
 * @param {string} concept
 * @param {string} code
 */
function addLearnedConcept(uiState, concept, code) {
  if (uiState.learned.some((l) => l.concept === concept)) return;
  uiState.learned.push({ concept, code });
  renderJournal(uiState);
}

/**
 * Renderiza el contenido del diario de aprendizaje.
 * @param {object} uiState
 */
export function renderJournal(uiState) {
  if (uiState.learned.length === 0) {
    el.journalContent.innerHTML = `<p class="text-slate-400 text-sm">Aún no has recolectado conceptos. Explora el mapa e interactúa con misiones o notas.</p>`;
    return;
  }
  el.journalContent.innerHTML = uiState.learned.map((item) => `
    <div class="border border-slate-700 rounded-lg p-3 bg-slate-800/40">
      <p class="text-venom font-semibold text-xs uppercase tracking-wider mb-1">${escapeHTML(item.concept)}</p>
      <pre class="code-block text-[0.7rem]">${escapeHTML(item.code)}</pre>
    </div>
  `).join('');
}

/**
 * Reproduce texto como "nota de audio" usando Web Speech API.
 * Si el navegador no soporta speechSynthesis, no rompe el juego.
 * @param {string} text
 * @param {string} speaker
 */
function speakText(text, speaker) {
  const synth = window.speechSynthesis;
  if (!synth) {
    alert('Tu navegador no soporta síntesis de voz. Puedes leer la transcripción en pantalla.');
    return;
  }
  synth.cancel(); // Detener audio anterior
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-ES'; // Español
  utterance.rate = 1;
  utterance.pitch = 1;
  // Intentamos seleccionar una voz en español si está disponible.
  const voices = synth.getVoices();
  const spanish = voices.find((v) => v.lang.startsWith('es'));
  if (spanish) utterance.voice = spanish;
  synth.speak(utterance);
}

/**
 * Escapa HTML para evitar inyección al renderizar contenido.
 * Aunque el contenido es propio, es buena práctica.
 * @param {string} str
 * @returns {string}
 */
function escapeHTML(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
