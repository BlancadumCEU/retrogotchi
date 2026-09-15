# Fase 1: Prototipo POO en 3 Capas (Backend PHP, Comunicación y Frontend LCD)

Esta documentación recoge el paso a paso detallado de la **Fase 1** del proyecto **Retrogotchi**, explicando la transición desde el prototipo original diseñado en un cuaderno de Gemini hasta una aplicación web modular en PHP orientada a objetos (POO).

---

## 📑 Índice
1. [Origen y Motivación del Proyecto](#1-origen-y-motivación-del-proyecto)
2. [Estructura de Carpetas de la Fase 1](#2-estructura-de-carpetas-de-la-fase-1)
3. [El Corazón de POO: La Clase Tamagotchi y el Constructor](#3-el-corazón-de-poo-la-clase-tamagotchi-y-el-constructor)
4. [La Capa de Comunicación: api.php y api.js](#4-la-capa-de-comunicación-apiphp-y-apijs)
5. [Frontend Retro: Carcasa LCD y Animación de Sprites](#5-frontend-retro-carcasa-lcd-y-animación-de-sprites)
6. [Recursos Visuales: Banco de Sprites LCD](#6-recursos-visuales-banco-de-sprites-lcd)
7. [Guía de Ejecución y Pruebas Locales](#7-guía-de-ejecución-y-pruebas-locales)
8. [Despliegue y Subida a Internet](#8-despliegue-y-subida-a-internet)
9. [Próximos Pasos (Hoja de Ruta)](#9-próximos-pasos-hoja-de-ruta)

---

## 1. Origen y Motivación del Proyecto

El proyecto nació a partir de una sesión de diseño y planificación en un cuaderno de Google Gemini, donde se planteó:
- Recrear la mascota virtual clásica de los años 90 (Tamagotchi P1/P2 de Bandai).
- Gestionar métricas vitales numéricas (hambre y felicidad del 0 al 100).
- Progresión por edad con 3 etapas: **Bebé (`baby`)**, **Adolescente (`teen`)** y **Adulto (`adult`)**.
- 3 estados de salud/ánimo: **Feliz (`happy`)**, **Indiferente (`meh`)** y **Enfermo (`sick`)**.
- Animación clásica de dos fotogramas (**a - b**) para dar sensación de vida con bajo coste de recursos.

En el prototipo inicial de Gemini, toda la lógica y la interfaz estaban mezcladas en un único archivo JavaScript ejecutado en el navegador (el estado se perdía al recargar la página y no existía separación de responsabilidades).

El objetivo de esta **Fase 1** ha sido estructurar el proyecto en **3 capas limpias (Backend POO, Comunicación y Frontend)** que sirvan como base pedagógica sólida para aprender Programación Orientada a Objetos en PHP, dejando todo preparado para escalar en el futuro a Arquitectura Hexagonal.

---

## 2. Estructura de Carpetas de la Fase 1

```
retrogotchi/
│
├── docs/                                 # DOCUMENTACIÓN DEL PROYECTO
│   └── fase-1/
│       └── README.md                     # Esta guía completa paso a paso
│
├── src/                                  # CAPA 1: BACKEND (PHP POO)
│   └── Tamagotchi.php                    # Entidad principal con lógica de negocio y constructor
│
├── public/                               # RAÍZ WEB PÚBLICA
│   ├── api.php                           # CAPA 2: COMUNICACIÓN (Endpoint HTTP / Sesiones)
│   ├── index.html                        # CAPA 3: FRONTEND (Estructura HTML con Tailwind CDN)
│   │
│   ├── css/
│   │   └── tamagotchi.css                # Estilos LCD (píxeles nítidos, scanlines, carcasa de huevo)
│   │
│   ├── js/
│   │   ├── api.js                        # Adaptador Fetch en JavaScript (cliente HTTP)
│   │   └── app.js                        # Controlador del DOM, bucle de animación a-b y temporizador
│   │
│   └── assets/
│       └── sprites/                      # RECURSOS GRÁFICOS (18 sprites LCD organizados)
│           ├── baby/   (happy_a, happy_b, meh_a, meh_b, sick_a, sick_b)
│           ├── teen/   (happy_a, happy_b, meh_a, meh_b, sick_a, sick_b)
│           └── adult/  (happy_a, happy_b, meh_a, meh_b, sick_a, sick_b)
```

---

## 3. El Corazón de POO: La Clase Tamagotchi y el Constructor

El archivo [`src/Tamagotchi.php`](../../src/Tamagotchi.php) encapsula todas las reglas de negocio del juego sin depender de HTML ni de peticiones HTTP.

### El Método Constructor (`__construct`)
El constructor es un método "mágico" en PHP que se ejecuta de forma inmediata y obligatoria cada vez que hacemos `new Tamagotchi()`.

```php
public function __construct(
    string $name = "Tama",
    int $age = 0,
    int $hunger = 80,
    int $happiness = 80
) {
    $this->name = $name;
    $this->age = max(0, $age);
    $this->hunger = $this->clamp($hunger, 0, 100);
    $this->happiness = $this->clamp($happiness, 0, 100);
    $this->isAlive = true;

    // Al nacer, evalúa automáticamente su etapa y ánimo inicial
    $this->actualizarEstado();
}
```

### Principios aplicados en el Constructor:
1. **Protección del estado inicial:** Asegura que una mascota nunca nazca con valores nulos, hambre superior a 100 o edad negativa (gracias al método auxiliar `clamp`).
2. **Parámetros con valores por defecto:** Permite crear una mascota estándar (`new Tamagotchi()`) o restaurar una existente pasando sus valores guardados.
3. **Cálculo de estado inicial:** Llama a `$this->actualizarEstado()` para garantizar que la mascota nace clasificada como `baby` y `happy`.

### Métodos de Comportamiento:
* **`feed(int $amount = 20)`:** Aumenta el nivel de hambre/saciedad hasta el límite de 100.
* **`play(int $amount = 20)`:** Aumenta la felicidad hasta el límite de 100.
* **`tick()`:** Simula el paso del tiempo. Incrementa la edad en 1 y descuenta energía (-2 hambre, -2 felicidad). Si ambas llegan a 0, la mascota fallece.
* **`calcularEtapa()`:**
  - `age < 30` &rarr; `baby` (Bebé)
  - `age < 70` &rarr; `teen` (Adolescente)
  - `age >= 70` &rarr; `adult` (Adulto)
* **`calcularMood()`:**
  - Si hambre o felicidad bajan de 30 &rarr; `sick` (Enfermo)
  - Si están entre 30 y 70 &rarr; `meh` (Indiferente / Desatendido)
  - Si ambas superan 70 &rarr; `happy` (Feliz)
* **`toArray()` y `fromArray()`:** Métodos para transformar el objeto a array y reconstruirlo, facilitando la comunicación JSON y la persistencia en sesión.

---

## 4. La Capa de Comunicación: api.php y api.js

Para conectar la interfaz web del navegador con la clase en PHP sin recargar la página, se implementó una arquitectura cliente-servidor mediante **Fetch API**:

```
[ Navegador (app.js) ] 
       │  (Petición asíncrona)
       ▼
[ api.js ] ───(Fetch HTTP JSON)───► [ api.php ] 
                                         │
                                         ▼
                              [ $_SESSION['tamagotchi'] ]
                                         │
                                         ▼
                              [ Clase Tamagotchi.php ]
```

### 1. El Endpoint del Servidor ([`public/api.php`](../../public/api.php))
- Inicia la sesión nativa de PHP con `session_start()`.
- Si la mascota no existe en `$_SESSION['tamagotchi']`, la crea con `new Tamagotchi()`.
- Si ya existe, la deserializa con `Tamagotchi::fromArray()`.
- Procesa acciones recibidas por GET o POST:
  - `status`: Devuelve las métricas actuales.
  - `feed`: Ejecuta `$tamagotchi->feed()`.
  - `play`: Ejecuta `$tamagotchi->play()`.
  - `tick`: Ejecuta `$tamagotchi->tick()`.
  - `reset`: Crea una nueva mascota con el constructor.
- Guarda el estado final en la sesión y emite la respuesta en JSON.

### 2. El Cliente del Navegador ([`public/js/api.js`](../../public/js/api.js))
- Expone el objeto global `TamagotchiApi` con métodos limpios basados en `async/await`:
  - `TamagotchiApi.getStatus()`
  - `TamagotchiApi.feed()`
  - `TamagotchiApi.play()`
  - `TamagotchiApi.tick()`
  - `TamagotchiApi.reset()`

---

## 5. Frontend Retro: Carcasa LCD y Animación de Sprites

### Diseño Visual ([`public/index.html`](../../public/index.html) y [`public/css/tamagotchi.css`](../../public/css/tamagotchi.css))
- **Tailwind CSS v4 CDN:** Proporciona un layout flexbox centrado, tipografía monoespaciada y paletas de color contemporáneas.
- **Carcasa física en forma de huevo:** Creada con CSS puro utilizando gradientes radiales, sombras profundas e incluye la anilla superior metálica del llavero.
- **Pantalla LCD Clásica:** Fondo verde oliva (`#9ead86`) con una rejilla de píxeles superpuesta (`::before`) y propiedad `image-rendering: pixelated;` para que los gráficos retro se muestren con bordes nítidos sin desenfoque.
- **Botones de goma con efecto táctil:** Los 3 botones clásicos (Comer, Jugar, Reset) tienen relieve 3D y se hunden al hacer clic (`active: translateY(4px)`).
- **Efectos de sonido retro:** Integración de la **Web Audio API** en [`public/js/app.js`](../../public/js/app.js) para reproducir un beeper clásico de 8 bits en cada pulsación.

### El Motor de Doble Temporizador en JavaScript ([`public/js/app.js`](../../public/js/app.js))
Para lograr una experiencia interactiva sin sobrecargar el servidor, se desacoplaron dos bucles independientes:

1. **Bucle de Animación Visual (Local en el cliente a 600ms):**
   Alterna localmente una variable `animationFrame` entre `0` (fotograma A) y `1` (fotograma B). Modifica la ruta de la imagen `<img id="pet-sprite">` añadiendo `_a.svg` o `_b.svg`. No realiza peticiones al servidor.
2. **Bucle de Juego (Sincronizado con PHP cada 3000ms):**
   Envía un `TamagotchiApi.tick()` al servidor, el cual actualiza el hambre, la felicidad y la edad, devolviendo las barras de porcentaje actualizadas.

---

## 6. Recursos Visuales: Banco de Sprites LCD

Siguiendo el banco de recursos canónico de [The Spriters Resource (Tamagotchi Original P1 / P2)](https://www.spriters-resource.com/lcd_handhelds/tamagotchioriginalp1p2/):

- **Bebé (`baby`):** Inspirado en **Babytchi** (Asset #144010).
- **Adolescente (`teen`):** Inspirado en **Tamatchi** (Asset #144014).
- **Adulto (`adult`):** Inspirado en **Mametchi** (Asset #144016).

Todos los sprites se generaron en formato **SVG vectorial con cuadrícula de píxeles nítida (`shape-rendering="crispEdges"`)**, alojados en `public/assets/sprites/`:

| Etapa | Estado | Fotograma A | Fotograma B |
| :--- | :--- | :--- | :--- |
| **baby** | happy | `baby/happy_a.svg` (base) | `baby/happy_b.svg` (salto alegre) |
| **baby** | meh | `baby/meh_a.svg` (mirada lateral) | `baby/meh_b.svg` (parpadeo) |
| **baby** | sick | `baby/sick_a.svg` (tumbado) | `baby/sick_b.svg` (con calavera) |
| **teen** | happy | `teen/happy_a.svg` (de pie) | `teen/happy_b.svg` (salto con patitas) |
| **teen** | meh | `teen/meh_a.svg` (brazos en jarras) | `teen/meh_b.svg` (ojos cerrados) |
| **teen** | sick | `teen/sick_a.svg` (triste/vendaje) | `teen/sick_b.svg` (con calavera) |
| **adult** | happy | `adult/happy_a.svg` (orejas en reposo) | `adult/happy_b.svg` (orejas alzadas) |
| **adult** | meh | `adult/meh_a.svg` (mirada neutral) | `adult/meh_b.svg` (parpadeo) |
| **adult** | sick | `adult/sick_a.svg` (orejas caídas) | `adult/sick_b.svg` (con calavera) |

---

## 7. Guía de Ejecución y Pruebas Locales

### Opción A: Mediante WampServer (Recomendada)
1. Asegúrate de que el servicio de **WampServer** esté iniciado (icono en verde en la bandeja del sistema).
2. Abre tu navegador y accede a:
   ```text
   http://localhost/php-projects/mi-poo/retrogotchi/public/
   ```
3. Verifica que:
   - Al pulsar **Comer 🍖**, el hambre sube un +20%.
   - Al pulsar **Jugar 🎮**, la felicidad sube un +20%.
   - Al llegar a los **30 ticks**, la mascota evoluciona a Adolescente (Tamatchi).
   - Al pulsar **F5** (refrescar página), la mascota mantiene su edad y estado intactos gracias a `$_SESSION`.

### Opción B: Mediante el Servidor Integrado de PHP
Si deseas probar el proyecto de forma independiente sin Wamp:
```bash
cd c:\wamp2\www\php-projects\mi-poo\retrogotchi
php -S localhost:8000 -t public
```
Abre `http://localhost:8000` en tu navegador.

---

## 8. Despliegue y Subida a Internet

### ¿Qué necesita el servidor para funcionar en la nube?
* Servidor web con **PHP 7.4 o superior** y soporte de sesiones habilitado (estándar en casi cualquier proveedor).
* No requiere base de datos en esta fase, ni configurar Node.js, ni compilar nada.

### ¿Dónde alojarlo gratis?
* **Hosting PHP Gratuito (ej. [InfinityFree](https://www.infinityfree.com/)):** Subir los archivos por FTP (FileZilla) a la carpeta `htdocs`.
* **Servidores Cloud (ej. [Render](https://render.com/) o Railway):** Subir el código a un repositorio de GitHub y conectarlo para despliegue continuo.

> [!WARNING]
> Recuerda que plataformas como **GitHub Pages, Netlify o Vercel** están diseñadas exclusivamente para contenido estático y **no pueden ejecutar PHP**, por lo que `api.php` fallaría si se aloja en ellas.

---

## 9. Próximos Pasos (Hoja de Ruta)

* **Fase 2:**
  - Migrar la persistencia de `$_SESSION` a un **archivo JSON local (`tamagotchi.json`)**, permitiendo que la mascota persista entre diferentes navegadores y cierres de sesión.
  - Implementar envejecimiento por **Timestamp real** (calculando los minutos transcurridos en el servidor desde la última visita).
* **Fase 3 (/goal - Arquitectura Hexagonal):**
  - Descomponer la clase monolítica en **Entidades y Value Objects** (`Hunger`, `Happiness`, `Age`).
  - Implementar la separación en capas **Domain**, **Application** (Casos de Uso) e **Infrastructure** (Repositorios PDO para Base de Datos MySQL/SQLite y Controladores).
