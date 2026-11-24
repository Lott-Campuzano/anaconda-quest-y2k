# Notas de diseño - Anaconda Quest: Y2K

## Visión

Juego educativo de mundo abierto en voxel art que enseña Python y Anaconda a través de narrativa y decisiones. El jugador aprende aplicando lógica en situaciones reales, no escribiendo código directamente.

## Pilares

1. **Narrativa significativa:** la obsesión infantil por la película "Anaconda" y el bug Y2K motiva el aprendizaje.
2. **Aprender haciendo:** misiones basadas en decisiones lógicas (if/else, for, funciones, etc.).
3. **Mundo explorable:** campus abierto de Viper Corp con landmarks y marcadores.
4. **Documentación integrada:** notas de audio de Rafa funcionan como documentación técnica y narrativa.

## Arquitectura

- `main.js`: orquestación y game loop.
- `world.js`/`voxels.js`: render y construcción del entorno 3D.
- `player.js`: control y cámara.
- `ui.js`: HUD, modal, diario, audio.
- `missions.js`/`audioLogs.js`: contenido educativo desacoplado de la lógica.

Esta separación permite agregar contenido sin tocar el motor del juego.

## Decisiones técnicas

- **Three.js por importmap:** evita build step y facilita lectura para desarrolladores.
- **Tailwind CDN:** prototipado rápido de UI.
- **InstancedMesh para terreno:** reduce draw calls en mapa 96x96.
- **Web Speech API:** notas de audio sin depender de archivos de audio externos.
- **Estado en memoria:** suficiente para una experiencia educativa; se puede extender a localStorage.

## Ruta de extensión

- Persistencia con `localStorage`.
- Más biomas y NPCs.
- Minimapa.
- Sistema de evaluación por puntaje.
- Soporte multiidioma.
- Assets de audio grabados reales.
