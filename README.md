# Figurama

App web para que niños armen y visualicen los problemas de geometría del
colegio: dado un **cuerpo A** y un **cuerpo B**, ¿cuánta superficie o cuánto
volumen de B se necesita para cubrir o llenar A?

El wizard pregunta, en orden:

1. Tipo de problema: cubrir la **superficie** o llenar el **volumen**.
2. Cuerpo A (el que se cubre o se llena) y sus medidas.
3. Cuerpo B (con el que se cubre o se llena) y sus medidas.

Cuerpos disponibles: cubo, paralelepípedo, esfera y cilindro.

En el resultado se ven ambos cuerpos en 3D, se pueden **desarmar** (la caja se
abre en forma de T, el cilindro en dos círculos y la pared enrollada, la esfera
en los 4 círculos equivalentes a su superficie), y se muestra la cuenta paso a
paso hasta la división final.

Cuando B es un cubo aparecen además los dos conteos concretos: los cuadrados de
cada cara de A y el llenado capa por capa con cubitos.

## Stack

- Next.js 16 (App Router, Turbopack)
- React 19 + TypeScript
- Tailwind CSS 4

## Desarrollo

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # build de producción
npm run lint
```

## Estructura

```
src/
  app/
    layout.tsx                      # layout global
    page.tsx                        # el wizard
  components/problema/
    ProblemaWizard.tsx              # los 5 pasos y su estado
    Contador.tsx                    # selector de números con botones grandes
    IconoProblema.tsx               # cáscara contra relleno, en bucle
    Resultado.tsx                   # explicación paso a paso y respuesta
    Forrado.tsx                     # la animación de cubrir o llenar
    VistaCuerpo.tsx                 # dibuja cualquier cuerpo, armado o abierto
    CajaPlegable.tsx                # caja en 3D que se abre en forma de T
    CilindroPlegable.tsx            # cilindro que se desenrolla
    CubosApilados.tsx               # cubitos dentro de la caja, en isométrico
    MiniCuerpo.tsx                  # el cuerpo como ficha pequeña
    BarraComparacion.tsx            # cuántas veces cabe B en A
    animacion.ts                    # avance 0→1, en bucle o una sola vez
    iso.tsx                         # dibujo isométrico de cubitos
  lib/
    cuerpos.ts                      # catálogo, fórmulas y enunciados
    problema.ts                     # conteo de cuadrados y cubitos
    red.ts                          # la T en coordenadas planas
    color.ts                        # tonos claros y oscuros
```

## Ayudas visuales

El resultado arranca con **los cálculos ocultos**: primero el niño resuelve
mirando los dibujos y después comprueba. Lo que siempre se ve:

- los dos cuerpos, que se pueden desarmar con un deslizador
- cada cara dividida en cuadrados numerados
- la animación de forrado o llenado: las piezas salen de una fuente, el cubo
  se abre en sus 6 cuadrados al llegar, y las usadas se van juntando en una
  bandeja que se puede contar
- en los cuerpos curvos, el nivel que sube al verter cada pieza

Para agregar un cuerpo nuevo: su entrada en `CATALOGO` y sus casos en
`superficie`, `volumen`, `formula`, `campos` y `huella` (`src/lib/cuerpos.ts`),
más su dibujo en `VistaCuerpo.tsx`.

## Siguientes pasos

- Conos y pirámides
- Guardar los problemas resueltos
- Modo "adivina el resultado" antes de mostrar la respuesta
