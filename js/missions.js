/**
 * missions.js - Definición y estado de las misiones educativas
 * ============================================================
 * Cada misión enseña un concepto de programación mediante una situación
 * de la vida real. El jugador no escribe código: toma decisiones que
 * representan la lógica del concepto. Después de elegir, se muestra
 * la explicación y el fragmento de Python relacionado.
 *
 * Estructura de una misión:
 * - id, title, area, position: identificación y ubicación en el mundo.
 * - story: contexto narrativo.
 * - concept: nombre del concepto enseñado.
 * - lesson: explicación breve.
 * - codeExample: código Python de ejemplo.
 * - prompt: pregunta/acción que debe resolver el jugador.
 * - choices: opciones; cada una tiene text, correct y feedback.
 */

export const MISSIONS = [
  {
    id: 'm1-variables',
    title: 'Misión 1: El panel del Y2K',
    area: 'Laboratorio de pruebas',
    position: { x: 14, z: -10 },
    character: 'Dra. Vega',
    story: `Entras al laboratorio de Viper Corp. La Dra. Vega señala un panel antiguo:
"Este sistema simula el reloj del año 2000. Antes de arreglar el bug, debemos representar
los datos correctamente. Si confundimos un texto con un número, el sistema colapsa."`,
    concept: 'Variables y tipos de datos',
    lesson: `En Python, una variable guarda un valor. Los tipos básicos más comunes son:
- <strong>str</strong>: texto, entre comillas. Ej: "1999"
- <strong>int</strong>: número entero. Ej: 1999
- <strong>float</strong>: decimal. Ej: 3.14
- <strong>bool</strong>: True o False.
Elegir el tipo correcto importa: no es lo mismo sumar 1 + 1 que concatenar "1" + "1".`,
    codeExample: `anio = 1999          # int: se puede sumar
siguiente = anio + 1  # 2000

anio_texto = "1999"         # str: es texto
mensaje = "Año: " + anio_texto

alerta_activa = True         # bool: condición lógica`,
    prompt: 'El reloj del sistema debe pasar de 1999 a 2000 sumando 1. ¿Cómo representas el año?',
    choices: [
      { text: 'anio = "1999"  (texto)', correct: false, feedback: 'No. "1999" es texto (str). Al sumar "1999" + 1 Python daría error, y "1999" + "1" daría "19991".' },
      { text: 'anio = 1999  (entero)', correct: true, feedback: 'Correcto. Como entero (int), Python puede calcular anio + 1 = 2000. El tipo de dato correcto evita bugs.' },
      { text: 'anio = True  (booleano)', correct: false, feedback: 'No. True es un booleano, sirve para condiciones lógicas, no para representar un año en cálculos.' },
    ],
  },
  {
    id: 'm2-if-else',
    title: 'Misión 2: El perro en las vías',
    area: 'Cruce ferroviario',
    position: { x: -20, z: -14 },
    character: 'Guardia de la vía',
    story: `Escuchas un ladrido. En el cruce ferroviario, un perro está en las vías y el sensor indica que
se acerca un tren. El guardia te grita: "¡Tenemos segundos! El sistema de emergencia necesita la
decisión correcta". Debes aplicar lógica condicional para actuar.`,
    concept: 'Condicionales if / elif / else',
    lesson: `Un condicional permite que el programa tome decisiones:
- <strong>if</strong>: ejecuta un bloque si la condición es verdadera.
- <strong>elif</strong>: prueba otra condición si la anterior falló.
- <strong>else</strong>: se ejecuta si ninguna condición se cumplió.
Las condiciones pueden combinarse con <strong>and</strong>, <strong>or</strong> y <strong>not</strong>.`,
    codeExample: `tren_viene = True
perro_en_vias = True

if tren_viene and perro_en_vias:
    # Ambas condiciones son verdaderas: emergencia máxima
    activar_barrera()
    emitir_alarma()
    llamar_rescate()
elif perro_en_vias:
    # Hay perro, pero no viene tren
    guiar_perro_a_zona_segura()
else:
    # No hay peligro inmediato
    monitorear_cruce()`,
    prompt: 'El sensor reporta: tren_viene = True y perro_en_vias = True. ¿Qué bloque debe ejecutarse?',
    choices: [
      { text: 'Ejecutar el else: solo monitorear el cruce.', correct: false, feedback: 'Peligroso. El else solo corre cuando ninguna condición anterior se cumple, pero aquí sí hay emergencia.' },
      { text: 'Ejecutar el if: activar barrera, emitir alarma y llamar rescate.', correct: true, feedback: '¡Correcto! La condición `tren_viene and perro_en_vias` es True, así que el bloque if maneja la emergencia y salva al perro.' },
      { text: 'Ejecutar el elif: guiar al perro con calma.', correct: false, feedback: 'No. El elif se evalúa solo si el if fue falso. Además, con un tren viniendo, "con calma" no es suficiente.' },
    ],
  },
  {
    id: 'm3-for-loop',
    title: 'Misión 3: Rescate con la grúa',
    area: 'Zona de grúas',
    position: { x: 24, z: 18 },
    character: 'Operador de grúa',
    story: `Tu amigo Rafa quedó atrapado en una plataforma elevada del almacén. La grúa puede bajarlo,
pero necesita moverse nivel por nivel. El operador te dice: "No podemos improvisar: el gancho
debe recorrer cada nivel en orden, desde el 1 hasta el 4".`,
    concept: 'Bucle for',
    lesson: `Un bucle <strong>for</strong> repite una acción para cada elemento de una secuencia.
<strong>range(1, 5)</strong> genera los números 1, 2, 3, 4 (el final no se incluye).
Es ideal cuando sabes cuántas repeticiones necesitas.`,
    codeExample: `# range(1, 5) produce: 1, 2, 3, 4
for nivel in range(1, 5):
    mover_grua(nivel)
    print("Grúa posicionada en nivel", nivel)

print("Gancho listo para rescatar a Rafa")`,
    prompt: 'La grúa debe pasar por los niveles 1, 2, 3 y 4 en orden. ¿Qué lógica usas?',
    choices: [
      { text: 'Escribir cuatro instrucciones separadas sin bucle.', correct: false, feedback: 'Funciona, pero no escala. Si fueran 100 niveles, sería imposible. Un for expresa la repetición claramente.' },
      { text: 'Usar for nivel in range(1, 5): mover la grúa en cada nivel.', correct: true, feedback: '¡Correcto! El bucle for recorre cada nivel en orden. Es claro, corto y evita repetir código.' },
      { text: 'Usar if nivel == 1: mover grúa, sin repetir para los demás.', correct: false, feedback: 'No. Un if solo comprueba una vez. Necesitas repetir la acción para cada nivel, y eso es trabajo de un bucle.' },
    ],
  },
  {
    id: 'm4-functions',
    title: 'Misión 4: El protocolo de emergencia',
    area: 'Centro de comandos',
    position: { x: -26, z: 20 },
    character: 'Jefe de seguridad',
    story: `En el centro de comandos suenan tres alarmas distintas. El jefe de seguridad dice:
"Tenemos el mismo protocolo para cada alarma: verificar, notificar y registrar. No voy a
escribir el mismo procedimiento tres veces; necesitamos una receta reutilizable".`,
    concept: 'Funciones',
    lesson: `Una <strong>función</strong> agrupa código reutilizable. Se define con <strong>def</strong>,
puede recibir <strong>parámetros</strong> y devolver un valor con <strong>return</strong>.
Ventajas: menos duplicación, más claridad y más fácil de probar.`,
    codeExample: `def atender_alarma(sector, nivel):
    """Atiende una alarma y devuelve un reporte."""
    mensaje = f"Verificando sector {sector}, nivel {nivel}"
    print(mensaje)
    print("Notificando equipo...")
    print("Registrando incidente...")
    return "Alarma atendida en " + sector

# Reutilizamos la misma función
atender_alarma("Laboratorio", "alto")
atender_alarma("Grúas", "medio")
atender_alarma("Búnker", "crítico")`,
    prompt: 'Hay 3 alarmas con el mismo procedimiento. ¿Cuál es la mejor solución?',
    choices: [
      { text: 'Copiar y pegar el mismo código 3 veces, cambiando el sector.', correct: false, feedback: 'Eso funciona hoy, pero duplica código. Si el protocolo cambia, tendrás que editarlo en 3 lugares y puedes introducir bugs.' },
      { text: 'Definir una función atender_alarma(sector, nivel) y llamarla 3 veces.', correct: true, feedback: '¡Correcto! La función encapsula el protocolo. Se reutiliza con distintos argumentos y cualquier cambio se hace en un solo lugar.' },
      { text: 'Ignorar dos alarmas para ahorrar código.', correct: false, feedback: 'Definitivamente no. Ahorrar líneas no vale más que la seguridad. La solución es abstraer, no omitir.' },
    ],
  },
  {
    id: 'm5-lists-dicts',
    title: 'Misión 5: Inventario del búnker',
    area: 'Búnker de datos',
    position: { x: 30, z: -20 },
    character: 'Rafa (mensaje grabado)',
    story: `Encuentras una terminal del búnker. Rafa dejó un mensaje: "Alex, el sistema Y2K tiene
muchos equipos. Necesitas una forma de guardar varios elementos juntos y también etiquetar
datos por nombre. No puedes crear una variable suelta por cada servidor".`,
    concept: 'Listas y diccionarios',
    lesson: `Python ofrece estructuras para organizar datos:
- <strong>Lista</strong>: colección ordenada. Ej: <code>servidores = ["A", "B", "C"]</code>.
- <strong>Diccionario</strong>: pares clave-valor. Ej: <code>equipo = {"nombre": "A", "estado": "ok"}</code>.
Las listas son ideales para secuencias; los diccionarios, para datos con etiquetas.`,
    codeExample: `# Lista: varios elementos en orden
servidores = ["core-1", "core-2", "core-3"]
for srv in servidores:
    print("Revisando", srv)

# Diccionario: datos etiquetados
servidor = {
    "nombre": "core-1",
    "anio_firmware": 1999,
    "parcheado": False
}
if not servidor["parcheado"]:
    print("Aplicar parche Y2K a", servidor["nombre"])`,
    prompt: 'Necesitas guardar 50 servidores y, para cada uno, su nombre, año y estado. ¿Qué estructura conviene?',
    choices: [
      { text: 'Crear 150 variables separadas como servidor1_nombre, servidor1_anio...', correct: false, feedback: 'Sería inmanejable. Las estructuras de datos existen precisamente para evitar esa explosión de variables.' },
      { text: 'Usar una lista de diccionarios: cada diccionario representa un servidor con sus campos.', correct: true, feedback: '¡Correcto! Una lista guarda todos los servidores y cada diccionario etiqueta sus datos. Es organizado y fácil de recorrer con un for.' },
      { text: 'Guardar todo en una sola cadena de texto larga.', correct: false, feedback: 'Podrías, pero sería difícil buscar, actualizar o procesar datos. Las listas y diccionarios son la herramienta adecuada.' },
    ],
  },
  {
    id: 'm6-oop',
    title: 'Misión 6: Drones de Viper Corp',
    area: 'Hangar de drones',
    position: { x: 10, z: -24 },
    character: 'Ingeniera de robótica',
    story: `En el hangar hay varios drones. La ingeniera explica: "Cada dron tiene nombre, batería y
misión, pero todos pueden reportar su estado y despegar. No quiero reescribir eso para cada dron.
Quiero un plano que defina cómo es un dron y crear muchos desde ahí".`,
    concept: 'Programación Orientada a Objetos (POO)',
    lesson: `La <strong>POO</strong> organiza el código alrededor de objetos.
- <strong>Clase</strong>: el plano/molde. Define atributos (datos) y métodos (acciones).
- <strong>Objeto</strong>: una instancia creada desde la clase.
- <strong>__init__</strong>: método constructor que inicializa el objeto.
- <strong>self</strong>: referencia al objeto actual.`,
    codeExample: `class Drone:
    def __init__(self, nombre, bateria):
        self.nombre = nombre
        self.bateria = bateria

    def puede_volar(self):
        return self.bateria > 20

    def reportar(self):
        estado = "listo" if self.puede_volar() else "batería baja"
        return f"{self.nombre}: {estado}"

# Creamos objetos (instancias) desde la clase
d1 = Drone("Viper-1", 87)
d2 = Drone("Viper-2", 15)
print(d1.reportar())  # Viper-1: listo
print(d2.reportar())  # Viper-2: batería baja`,
    prompt: 'Necesitas 10 drones con el mismo comportamiento pero distintos datos. ¿Qué enfoque POO usas?',
    choices: [
      { text: 'Crear una clase Drone y luego instanciar 10 objetos con distintos valores.', correct: true, feedback: '¡Correcto! La clase define el plano una vez; cada objeto tiene sus propios atributos. Eso es reutilización y modelado limpio.' },
      { text: 'Escribir funciones sueltas y variables globales para cada dron.', correct: false, feedback: 'Podría funcionar, pero el código quedaría disperso y difícil de mantener. La POO agrupa datos y comportamiento relacionados.' },
      { text: 'Usar un solo diccionario gigante para todos los drones sin estructura.', correct: false, feedback: 'Un diccionario puede guardar datos, pero una clase también define comportamiento (métodos) y hace el modelo más claro.' },
    ],
  },
  {
    id: 'm7-anaconda',
    title: 'Misión 7: El entorno de Anaconda',
    area: 'Búnker de datos',
    position: { x: 36, z: -28 },
    character: 'Sysadmin de Viper Corp',
    story: `El sysadmin está nervioso: "El proyecto Y2K usa Python 3.11 y pandas 2.0, pero el proyecto
de sensores usa Python 3.9 y otra versión de pandas. Si instalamos todo junto, vamos a romper
algo. Necesitamos aislamiento". Te entrega una terminal con Anaconda instalado.`,
    concept: 'Anaconda, conda y entornos virtuales',
    lesson: `<strong>Anaconda</strong> es una distribución de Python enfocada en ciencia de datos y desarrollo.
Incluye <strong>conda</strong>, un gestor de paquetes y entornos.
Un <strong>entorno virtual</strong> aísla dependencias por proyecto: cada uno puede tener su propia
versión de Python y librerías. Esto evita conflictos y hace el trabajo reproducible.`,
    codeExample: `# Crear un entorno aislado para el proyecto Y2K
conda create -n y2k python=3.11

# Activar el entorno
conda activate y2k

# Instalar paquetes dentro del entorno
conda install pandas numpy

# Ver entornos disponibles
conda env list

# Exportar entorno para compartirlo
conda env export > environment.yml

# Salir del entorno
conda deactivate`,
    prompt: 'Dos proyectos necesitan distintas versiones de Python y paquetes. ¿Qué haces?',
    choices: [
      { text: 'Instalar todo globalmente y esperar que no haya conflictos.', correct: false, feedback: 'Riesgoso. Las dependencias globales pueden chocar entre proyectos. Eso es justo lo que los entornos evitan.' },
      { text: 'Crear un entorno conda separado para cada proyecto y activarlo antes de trabajar.', correct: true, feedback: '¡Correcto! Cada entorno aísla sus paquetes y versión de Python. Es la práctica profesional para evitar conflictos de dependencias.' },
      { text: 'Usar solo un cuaderno de notas y no instalar nada.', correct: false, feedback: 'No resuelve el problema. Los proyectos reales necesitan dependencias instaladas; la clave es aislarlas correctamente.' },
    ],
  },
];

/**
 * Crea el estado inicial de misiones.
 * Usamos un Map para consultar rápido por id si una misión fue completada.
 * @returns {Map<string, {completed: boolean}>}
 */
export function createMissionState() {
  const state = new Map();
  for (const mission of MISSIONS) {
    state.set(mission.id, { completed: false });
  }
  return state;
}
