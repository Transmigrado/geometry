# Geometría Divertida

App web para que niños aprendan geometría básica: figuras, lados, esquinas y
ejemplos de la vida real.

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
    layout.tsx              # layout global (header, footer, fuente)
    page.tsx                # portada
    figuras/page.tsx        # listado de figuras
    figuras/[slug]/page.tsx # detalle de cada figura
  components/
    FiguraSvg.tsx           # dibuja cada figura en SVG
  lib/
    figuras.ts              # datos de las figuras (fuente única)
```

Para añadir una figura nueva basta con agregar su entrada en `src/lib/figuras.ts`
y, si es un polígono, sus puntos en `FiguraSvg.tsx`.

## Siguientes pasos

- Juegos interactivos (identificar figuras, contar lados)
- Sección de medidas: perímetro y área
- Cuerpos geométricos en 3D
- Progreso del niño y recompensas
