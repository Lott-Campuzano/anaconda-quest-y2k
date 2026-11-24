/**
 * audioLogs.js - Notas de audio/documentación dejadas por el mejor amigo
 * ======================================================================
 * Cada log representa una nota que el mejor amigo del protagonista dejó en
 * Viper Corp. Cumplen dos funciones:
 * 1) Narrativa: cuentan la historia de la obsesión por "Anaconda" y el Y2K.
 * 2) Documentación: explican conceptos de Python, POO y Anaconda.
 *
 * El jugador los encuentra explorando el mundo abierto. Al interactuar,
 * la UI muestra el texto y puede reproducirlo como audio con Web Speech API.
 */

export const AUDIO_LOGS = [
  {
    id: 'log-1',
    title: 'Log 01 - La película que lo cambió todo',
    friend: 'Rafa (tu mejor amigo)',
    // Posición en el mundo 3D donde aparece el log.
    position: { x: -8, z: 8 },
    area: 'Plaza de Viper Corp',
    transcript: `Hola, soy Rafa. Si estás escuchando esto, es porque por fin entraste al simulador. 
¿Te acuerdas cuando éramos niños y vimos "Anaconda"? No la de la serpiente gigante... la otra. 
La película donde un desarrollador encontró un bug de fechas, usó Python para corregir la falla del Y2K y evitó el colapso mundial. 
Desde esa noche no dejaste de hablar de código. Yo pensé que era una fase, pero mírate: ahora estás en Viper Corp. 
Este mapa tiene notas que dejé para ti. Cada una explica lo que aprendimos en el camino.`,
    concept: 'Historia y motivación',
    codeExample: `# Python se volvió famoso por ser claro y legible.
# La película ficticia "Anaconda" nos inspiró a usarlo
# para resolver problemas reales, como el Y2K.

mision = "Salvar el mundo con código"
anio = 1999
print(mision, "antes del", anio + 1)`,
  },
  {
    id: 'log-2',
    title: 'Log 02 - Variables: cajas con nombre',
    friend: 'Rafa',
    position: { x: 18, z: -6 },
    area: 'Laboratorio de pruebas',
    transcript: `Primer consejo de programador: una variable es como una caja con etiqueta. 
Le pones nombre, guardas algo dentro y luego lo usas. En Python no tienes que declarar el tipo como en otros lenguajes; 
Python lo entiende por el valor. Pero eso no significa que no importe: texto, números, booleanos... cada uno sirve para algo distinto.`,
    concept: 'Variables y tipos de datos',
    codeExample: `# Variables: nombres que guardan valores
nombre = "Alex"          # str (texto)
edad = 12                # int (entero)
altura = 1.52            # float (decimal)
sabe_python = True       # bool (verdadero/falso)

# Python permite ver el tipo con type()
print(type(nombre))      # <class 'str'>`,
  },
  {
    id: 'log-3',
    title: 'Log 03 - Condiciones: decidir bajo presión',
    friend: 'Rafa',
    position: { x: -24, z: -18 },
    area: 'Cruce ferroviario',
    transcript: `El Y2K se resolvió tomando decisiones correctas en el momento correcto. 
En programación, eso lo hacemos con if, elif y else. Si pasa esto, haz aquello; si no, haz otra cosa. 
Suena simple, pero una condición mal escrita puede ser la diferencia entre salvar a un perro en las vías... o no llegar a tiempo.`,
    concept: 'Condicionales if/elif/else',
    codeExample: `tren_viene = True
perro_en_vias = True

if tren_viene and perro_en_vias:
    accion = "Activar barrera y llamar al perro"
elif perro_en_vias:
    accion = "Guiar al perro con calma"
else:
    accion = "Seguir monitoreando"

print(accion)`,
  },
  {
    id: 'log-4',
    title: 'Log 04 - Bucles: repetir sin volverte loco',
    friend: 'Rafa',
    position: { x: 28, z: 22 },
    area: 'Zona de grúas',
    transcript: `Cuando el héroe de Anaconda revisó miles de registros de fechas, no lo hizo uno por uno a mano. 
Usó bucles. Un bucle for repite una acción sobre una secuencia; un while repite mientras una condición sea verdadera. 
La clave es saber cuándo parar, o terminarás en un bucle infinito.`,
    concept: 'Bucles for y while',
    codeExample: `# for: recorre una secuencia conocida
for nivel in range(1, 4):
    print("Subiendo grúa al nivel", nivel)

# while: repite mientras la condición sea True
distancia = 3
while distancia > 0:
    print("Acercando gancho...")
    distancia -= 1`,
  },
  {
    id: 'log-5',
    title: 'Log 05 - Funciones: recetas reutilizables',
    friend: 'Rafa',
    position: { x: -30, z: 24 },
    area: 'Centro de comandos',
    transcript: `Una función es una receta: le das ingredientes, hace pasos y te devuelve un resultado. 
En Viper Corp no copiamos y pegamos el mismo código diez veces; escribimos una función y la llamamos. 
Eso hace el código más limpio, más fácil de probar y menos propenso a bugs.`,
    concept: 'Funciones',
    codeExample: `def calcular_riesgo_y2k(anio):
    """Devuelve True si el año tiene riesgo Y2K."""
    return anio < 2000

# Llamamos la función con distintos valores
print(calcular_riesgo_y2k(1999))  # True
print(calcular_riesgo_y2k(2001))  # False`,
  },
  {
    id: 'log-6',
    title: 'Log 06 - POO: modelar el mundo',
    friend: 'Rafa',
    position: { x: 6, z: -28 },
    area: 'Hangar de drones',
    transcript: `La Programación Orientada a Objetos te deja modelar cosas del mundo real como objetos. 
Una clase es el plano; un objeto es la instancia. En Viper Corp tenemos drones, sensores, alarmas... 
cada uno con atributos y métodos. Si entiendes clases, puedes construir sistemas grandes sin perder el control.`,
    concept: 'Programación Orientada a Objetos',
    codeExample: `class Drone:
    def __init__(self, nombre, bateria):
        self.nombre = nombre      # atributo
        self.bateria = bateria    # atributo

    def reportar(self):           # método
        return f"{self.nombre}: {self.bateria}%"

drone = Drone("Viper-1", 87)
print(drone.reportar())`,
  },
  {
    id: 'log-7',
    title: 'Log 07 - Anaconda: el kit de supervivencia',
    friend: 'Rafa',
    position: { x: 34, z: -24 },
    area: 'Búnker de datos',
    transcript: `Python es el lenguaje, pero Anaconda es el ecosistema que te facilita la vida. 
Trae conda para manejar entornos y paquetes, y viene con herramientas para ciencia de datos. 
Un entorno es como una burbuja: puedes tener versiones distintas de paquetes sin romper otros proyectos. 
Si el Y2K nos enseñó algo, es que controlar versiones y dependencias importa.`,
    concept: 'Anaconda, conda y entornos',
    codeExample: `# Comandos comunes de Anaconda/conda (terminal)
conda create -n viper python=3.11
conda activate viper
conda install numpy pandas
conda env list
conda deactivate`,
  },
];
