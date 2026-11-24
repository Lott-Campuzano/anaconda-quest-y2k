# Anaconda Quest: Y2K

Videojuego educativo de **mundo abierto** en estilo **voxel art** para navegador, construido con **WebGL a través de Three.js** y **TailwindCSS**. Enseña fundamentos de **Python**, **Programación Orientada a Objetos (POO)** y **Anaconda** mediante misiones basadas en situaciones de la vida real, no escribiendo código.

## Historia

Cuando eras niño viste *"Anaconda"*, una película donde un desarrollador usaba **Python** para corregir la falla del **Y2K (año 2000)** y salvaba al mundo del colapso. Esa obsesión te llevó a convertirte en programador.

Años después trabajas en **Viper Corp**. Tu mejor amigo, **Rafa**, dejó **notas de audio y registros** por todo el campus para guiarte en tu entrenamiento: desde fundamentos de Python hasta POO y entornos con Anaconda.

## Objetivos de aprendizaje

| Área | Conceptos cubiertos | Dónde se aprende |
|---|---|---|
| Fundamentos Python | Variables, tipos de datos, `if/elif/else`, bucles `for/while`, funciones, listas y diccionarios | Misiones 1-5 y Logs 1-5 |
| POO | Clases, objetos, `__init__`, atributos, métodos, `self` | Misión 6 y Log 6 |
| Anaconda | Conda, entornos virtuales, instalación de paquetes, `environment.yml` | Misión 7 y Log 7 |

## Mecánica del juego

- **Mundo abierto voxel:** explora libremente el campus de Viper Corp.
- **Misiones de decisión:** cada misión plantea un problema real y debes elegir la lógica correcta. No se escribe código; se aplica el concepto.
- **Notas de audio/logs:** registros dejados por Rafa. Incluyen transcripción, concepto y ejemplo de código. Se pueden reproducir con Web Speech API del navegador.
- **Diario de aprendizaje:** guarda los conceptos que has aprendido durante la partida.
- **Progreso HUD:** muestra misiones completadas, logs recolectados y objetivo actual.

### Ejemplos de misiones

- **If/Else:** el sensor detecta un perro en las vías y un tren acercándose. Debes elegir la rama condicional correcta para activar la emergencia.
- **For loop:** debes rescatar a Rafa con una grúa recorriendo los niveles 1 al 4 en orden.
- **Anaconda:** dos proyectos necesitan versiones distintas de Python y paquetes; debes elegir el uso correcto de entornos conda.

## Controles

| Tecla / acción | Función |
|---|---|
| `W A S D` o flechas | Mover al personaje |
| Mouse | Rotar cámara (requiere click en el juego para pointer lock) |
| `Shift` | Correr |
| `E` | Interactuar con misión o nota de audio |
| `M` | Abrir/cerrar diario de aprendizaje |

## Tecnologías

- **Three.js (WebGL):** renderizado 3D, escena, cámara, iluminación, geometría voxel.
- **TailwindCSS (CDN):** estilos de interfaz/HUD/modal.
- **JavaScript ES Modules:** código modular sin bundler obligatorio.
- **Web Speech API:** reproducción de notas de audio (síntesis de voz) en navegadores compatibles.

## Estructura del proyecto

```text
anaconda-quest/
├── index.html              # Entrada HTML, UI, importmap y carga del módulo principal
├── vercel.json             # Configuración para despliegue en Vercel
├── README.md               # Documentación del proyecto
├── LICENSE                 # Licencia MIT
├── css/
│   └── styles.css          # Estilos personalizados (canvas, kbd, code blocks, modal)
├── js/
│   ├── main.js             # Orquestador: init, loop, interacción, estado
│   ├── constants.js        # Constantes globales y utilidades
│   ├── voxels.js           # Helpers voxel: materiales, terreno, árboles, edificios
│   ├── world.js            # Escena Three.js, terreno, luces, marcadores
│   ├── player.js           # Personaje, input, movimiento y cámara
│   ├── missions.js         # Datos y estado de misiones educativas
│   ├── audioLogs.js        # Notas de audio/documentación narrativa
│   └── ui.js               # HUD, modal, diario, speech synthesis
├── docs/
│   └── DESIGN.md           # Notas de diseño y decisiones técnicas
└── assets/                 # Reservado para assets futuros
```

## Ejecución local

> **Importante:** el proyecto usa ES Modules (`import`/`export`), por lo que debe servirse desde un servidor HTTP local. Abrir `index.html` con `file://` puede bloquear módulos.

### Opción 1: Python (recomendada)

```bash
# Desde la carpeta del proyecto
python3 -m http.server 8080
```

Abre: [http://localhost:8080](http://localhost:8080)

### Opción 2: Node.js (npx serve)

```bash
npx serve .
```

### Opción 3: VS Code Live Server

Instala la extensión *Live Server* y haz click en **Go Live** sobre `index.html`.

## Despliegue

### Vercel (preparado)

El proyecto incluye `vercel.json` y es un sitio estático, así que Vercel lo sirve directamente.

#### Con Vercel CLI

```bash
npm i -g vercel
vercel login
vercel          # despliegue preview
vercel --prod   # despliegue a producción
```

#### Con GitHub + Vercel Dashboard

1. Sube el repositorio a GitHub.
2. En [vercel.com](https://vercel.com), crea un nuevo proyecto e importa el repo.
3. Framework Preset: **Other**.
4. Build Command: *(vacío)*.
5. Output Directory: *(vacío / raíz)*.
6. Deploy.

### Nginx

1. Copia los archivos del proyecto a una carpeta servida por Nginx, por ejemplo `/var/www/anaconda-quest`.
2. Crea un bloque de servidor:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    root /var/www/anaconda-quest;
    index index.html;

    # Sirve archivos estáticos y hace fallback a index.html si lo deseas
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Tipos MIME correctos para módulos JS
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
}
```

3. Valida y recarga:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Apache

1. Copia el proyecto al DocumentRoot, por ejemplo `/var/www/html/anaconda-quest`.
2. Asegúrate de que Apache sirva `.js` como JavaScript. En `.htaccess` o config:

```apache
Options -Indexes +FollowSymLinks
AddType application/javascript .js
AddType text/css .css

# Opcional: fallback SPA-like
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

3. Habilita módulos necesarios y reinicia:

```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

### XAMPP

1. Instala XAMPP y abre el panel de control.
2. Copia la carpeta `anaconda-quest` dentro de `htdocs`:
   - Windows: `C:\xampp\htdocs\anaconda-quest`
   - macOS: `/Applications/XAMPP/xamppfiles/htdocs/anaconda-quest`
3. Inicia **Apache** desde XAMPP.
4. Abre en el navegador: `http://localhost/anaconda-quest/`.

### ngrok (túnel rápido para demo)

ngrok expone un servidor local a Internet temporalmente. Ideal para mostrar el juego sin desplegarlo.

1. Levanta un servidor local (ej. puerto 8080):

```bash
python3 -m http.server 8080
```

2. En otra terminal, con ngrok instalado y autenticado:

```bash
ngrok http 8080
```

3. ngrok mostrará una URL pública `https://...ngrok...` que puedes compartir.

> Nota: la URL de ngrok cambia en el plan gratuito cada vez que reinicias el túnel.

## Documentación en el juego

La documentación pedagógica vive dentro del propio juego como **notas de audio/logs** dejadas por Rafa en el mapa. Cada log incluye:

- Contexto narrativo.
- Concepto técnico explicado.
- Ejemplo de código Python.
- Transcripción legible y reproducción por voz (Web Speech API).

Además, el código fuente incluye comentarios explicando qué hace cada fragmento importante.

## Extender el juego

- **Agregar una misión:** edita `js/missions.js` y añade un objeto al arreglo `MISSIONS`. El marcador aparece automáticamente.
- **Agregar un log:** edita `js/audioLogs.js` y añade un objeto a `AUDIO_LOGS`.
- **Cambiar el mundo:** modifica `js/world.js` y `js/voxels.js` para agregar edificios, biomas o decoraciones.
- **Ajustar dificultad/flujo:** modifica validaciones y feedback en `js/ui.js`.

## Notas técnicas

- El terreno se renderiza con `THREE.InstancedMesh` para rendimiento.
- La altura del terreno se calcula con una función trigonométrica simple (`terrainHeight`) para mantener el proyecto sin dependencias de ruido externas.
- El estado de misiones y logs se mantiene en memoria durante la sesión.
- La síntesis de voz depende del soporte del navegador (`speechSynthesis`).

## Licencia

MIT. Ver [LICENSE](./LICENSE).
