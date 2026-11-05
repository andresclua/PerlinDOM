# PerlinDOM: nueva web showcase y cambios de librería

## Intención

La web actual (`src/index.html`) son 11 ejemplos sueltos en cajas grises con Arial. Enseña la API pero no impresiona. El objetivo es una web que haga que quien la abra note enseguida que "el DOM respira de forma distinta" gracias a PerlinDOM, y que a la vez demuestre que la librería convive con GSAP + ScrollTrigger llevados al máximo. Referencias de calidad que el autor citó: livyapps.com (wow factor) y gsap.com (storytelling con scroll).

El autor teme resultados estéticamente flojos, así que la dirección visual está fijada (ver abajo) y hay que respetarla.

## Objetivos

- Una landing con storytelling de scroll, guion "Del caos a la forma" (fijado por el autor).
- Estética C, "degradado y etéreo" (fijada por el autor).
- Una o más páginas de documentación de la API y de ejemplos, dentro de la misma web.
- Cambios en la librería lo bastante grandes para que el guion sea posible y rinda bien con cientos de elementos.

## No objetivos y anti-objetivos

- No reescribir la librería desde cero ni romper la API actual de `new PerlinDOM({...})`. Todo lo nuevo es opcional.
- No añadir dependencias a la librería: sigue siendo cero dependencias. `gsap` solo es dependencia de la web.
- Fracaso aunque técnicamente funcione: una web con aspecto de plantilla genérica o de "demo de librería", o que vaya a tirones con cientos de elementos.

## Guion de la landing (decidido por el autor)

1. **Hero:** cientos de elementos flotando con ruido, sin orden.
2. **Scroll:** la amplitud baja y las piezas convergen y forman el título.
3. **Pin:** el título se rompe por letras y cada letra deriva con su propia semilla.
4. **API en vivo:** un capítulo por opción (`speed`, `seed`, rangos, `lerpSpeed`, pausa y play), con algo moviéndose que la explica.
5. **Final:** todo vuelve a flotar y aparece el `npm install`.

## Estética (decidida por el autor)

Degradado morado a azul de fondo, tipografía fina con mucho tracking, elementos translúcidos que derivan con el ruido. Los colores cambian entre capítulos con un `scrub` de GSAP. Referencia visual: el boceto "C" del hero, con título `PERLINDOM` en mayúsculas ligeras y círculos translúcidos. Tipografías concretas y paleta exacta quedan a criterio del builder, dentro de esa dirección.

## Estado actual del código

- `src/js/PerlinDom.js` (318 líneas): clase con ruido Perlin 1D y 2D, mueve solo `x`/`y` con `translate3d`, un `requestAnimationFrame` por instancia, lee `clientWidth/Height` del padre en cada frame si hay porcentajes, escribe `el.style.transform` completo en cada frame.
- `src/index.html` (819 líneas): demo actual con 11 ejemplos. `docs/examples.html` tiene una copia anterior.
- Vite 5 + SCSS. Sin tests. Sin dependencias en runtime.
- `package.json` apunta a `./dist/PerlinDOM.es.js`, pero `dist/` tiene `perlindom.es.js` en minúsculas (inconsistencia que hay que corregir al publicar).

## Cambios de librería (propuestos por Claude, no confirmados uno a uno por el autor)

Todos opcionales y retrocompatibles:

1. **Control externo de la amplitud:** una propiedad o método (por ejemplo `amplitude` de 0 a 1) que GSAP pueda animar con `scrub`, para pasar de caos a orden.
2. **Convivir con GSAP en el mismo elemento:** que PerlinDOM no pise el `transform` que GSAP escribe. Opciones a evaluar por el builder: exponer los valores (`lastX`, `lastY`) para que GSAP los componga, aplicar el movimiento por propiedades CSS individuales (`translate`) o por variables CSS. El builder elige la más simple que funcione.
3. **Un solo loop compartido** para todas las instancias, en vez de un `requestAnimationFrame` por instancia.
4. **Pausa automática fuera de pantalla** (IntersectionObserver).
5. **Rotación y escala opcionales** además de x/y, solo si el guion lo pide.
6. Corregir el nombre de archivos de `dist`/`package.json` y subir versión con entrada en `CHANGELOG.md`.

## Decisiones de cómo se construye (llamadas de Claude, el autor puede rechazarlas)

- Mantener Vite y SCSS, ya presentes.
- Añadir `gsap` con `ScrollTrigger` solo para la web.
- Los 11 ejemplos antiguos pasan a una página de ejemplos dentro de la web nueva; `docs/examples.html` se sustituye o se elimina.
- Páginas: landing (storytelling), documentación de la API y ejemplos. Sin framework JS.

## Restricciones

- Accesibilidad básica: respetar `prefers-reduced-motion` (animaciones de ruido y scroll reducidas o desactivadas).
- La web debe funcionar en móvil con menos elementos que en escritorio.
- Los textos de la web en inglés, como la librería y el README (llamada de Claude, rechazable).

## A criterio del builder

Estructura de archivos, nombres, paleta exacta y tipografías dentro de la dirección C, número de elementos del hero que el rendimiento soporte, cuántas páginas de docs, cómo se aplica el control de amplitud, y orden de implementación.

## Aclaraciones tras la revisión (llamadas de Claude, rechazables)

- **Boceto C:** existe en `.superpowers/brainstorm/65343-1793913339/content/style.html` (tarjeta C). Es la referencia visual del hero.
- **Elementos del hero:** círculos translúcidos (varios cientos en escritorio, bastantes menos en móvil). Para formar el título, cada elemento recibe un punto objetivo muestreado de los píxeles del texto renderizado. El título real es texto DOM (accesible y con SEO); los elementos lo dibujan visualmente encima.
- **Amplitud:** `amplitude` es por instancia, de 0 a 1, y GSAP la anima con `scrub`. Con 0 el elemento queda en su punto objetivo (opción `target` opcional); con 1 deriva libre. GSAP no escribe `transform` en los elementos del hero; solo anima `amplitude`, lo que evita el conflicto. La coexistencia en el mismo elemento se resuelve solo si hace falta en otros capítulos.
- **Alcance de librería:** el loop compartido, la pausa fuera de pantalla, `amplitude` y `target` son necesarios. Rotación y escala solo si un capítulo las pide. No se publica en npm ni se sube versión en este trabajo; solo se corrige el nombre de archivos de `dist`.
- **Rendimiento:** objetivo de 60 fps en un portátil de gama media con unos 300 elementos, y unos 60 en móvil. Se mantiene DOM, que es el punto de la librería.
- **Sitio:** build multipágina de Vite (landing, API, ejemplos) con `base` relativa. Los 11 ejemplos antiguos se rediseñan con la estética C. La página de API se escribe a partir del README.
- **Fuentes:** Google Fonts vale, como ya se usa hoy.
