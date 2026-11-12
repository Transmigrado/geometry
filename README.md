# Materama

App web para que niños vean las matemáticas del colegio, en vez de solo
calcularlas. Tiene dos módulos:

- **Geometría**: armar y visualizar problemas de superficie y volumen.
- **Ecuaciones**: descubrir cuánto pesa cada fruta mirando una pesa, que es
  una ecuación de primer grado contada con dibujos.

Cada usuario tiene además su **avatar en 3D**, que se arma en el navegador
con Three.js: ver [AVATAR.md](AVATAR.md).

La primera vez se pasa por un **onboarding** de tres preguntas —el nombre y
el apellido, la fecha de nacimiento y el avatar— y hasta terminarlo no se ve
el resto de la app.

Quién lo ve lo decide `Protegido`, que envuelve las tres páginas: sin sesión
va al login, con el perfil sin terminar va al onboarding, y recién después se
juega. El paso que falta sale de mirar qué campos del perfil están vacíos, no
de un contador aparte; así cada respuesta se guarda apenas se contesta y
cerrar la pestaña a mitad de camino no pierde nada.

El perfil queda marcado como presentado (`onboarded`) en cuanto no queda
nada que preguntar, sea en el último paso o en uno anterior —que es lo que
pasa cuando a un perfil de antes sólo le falta un campo recién agregado—. Y
**eso manda sobre los campos**: quien ya se presentó no vuelve a pasar por
aquí aunque después borre un dato, o aunque mañana el onboarding pregunte
algo más.

Después, esos datos se ven en **`/perfil`**, junto al avatar y al botón para
cambiarlo. Ahí vive también el botón de cerrar sesión: en la cabecera se
tropezaba con él sin querer, y cerrar la sesión a medio problema no se lo
deseamos a nadie. La cabecera sólo lleva al perfil.

En Firestore los campos van en inglés, por convención: `name`, `lastName`,
`birthdate`, `avatar`, `thumbnail`, `onboarded` y `updatedAt`. Dentro de la
app el perfil habla español como todo lo demás, y la traducción vive sólo en
`src/lib/perfil.ts`.

## Geometría

Dado un **cuerpo A** y un **cuerpo B**, ¿cuánta superficie o cuánto volumen
de B se necesita para cubrir o llenar A?

El wizard pregunta, en orden:

1. Tipo de problema: cubrir la **superficie**, llenar el **volumen** o
   **medir el volumen** de un cuerpo.
2. Cuerpo A (el que se cubre, se llena o se mide) y sus medidas.
3. Cuerpo B (con el que se cubre o se llena) y sus medidas. Medir el volumen
   usa un solo cuerpo, así que se salta este paso.

Al medir el volumen se elige si las medidas están en centímetros o en metros,
y el resultado se muestra junto al mismo volumen armado con cubitos de 1 de
lado: «80 cm³, es decir, 80 cubos de 1 cm de lado». Debajo, ese volumen
aparece en litros dibujado como botellas, con el recordatorio de que un litro
es un cubo de 10 cm de lado, o sea 1000 cm³.

Cuerpos disponibles: cubo, paralelepípedo, esfera y cilindro.

En el resultado se ven ambos cuerpos en 3D, se pueden **desarmar** (la caja se
abre en forma de T, el cilindro en dos círculos y la pared enrollada, la esfera
en los 4 círculos equivalentes a su superficie), y se muestra la cuenta paso a
paso hasta la división final.

Cuando B es un cubo aparecen además los dos conteos concretos: los cuadrados de
cada cara de A y el llenado capa por capa con cubitos.

## Ecuaciones

Modo práctica: la pesa marca un número y encima hay varias frutas iguales,
así que `cantidad × fruta = total`. El niño elige entre cuatro opciones
cuánto pesa cada una.

A veces aparece además una pesa de metal de peso conocido, y entonces la
ecuación lleva término independiente: `4 × 🍊 + 15 = 59`. Se resuelve en dos
pasos, sacar la pesa y después repartir, y así se dice al acertar.

Al equivocarse la pesa muestra lo que marcaría con esa respuesta (si cada
manzana pesara 9, marcaría 45 y no 40), que es la forma de ver el error sin
que se lo expliquen. Al acertar aparece la división que lo resuelve.

Las opciones equivocadas son los errores que de verdad se cometen: restar en
vez de dividir, contar las frutas, o —cuando hay pesa— olvidar restarla
antes de repartir y olvidar repartir después de restarla.

## Stack

- Next.js 16 (App Router, Turbopack)
- React 19 + TypeScript
- Tailwind CSS 4

## Desarrollo

```bash
npm install
cp .env.local.example .env.local   # y pega los datos de Firebase
npm run dev     # http://localhost:3000
npm run build   # build de producción
npm run lint
```

## Cuentas

Para entrar hay que iniciar sesión. La sesión la maneja Firebase
Authentication y la configuración se lee de `.env.local`, que no se versiona.
Sin esas variables la app no se cae: el login avisa que falta conectarlo.

En la consola de Firebase, en **Authentication › Sign-in method**, hay que
habilitar los modos que se ofrecen en pantalla:

- **Correo y contraseña**: funciona apenas se habilita.
- **Google**: funciona apenas se habilita.
- **Apple**: además necesita una cuenta de Apple Developer de pago; mientras
  no esté habilitado, el botón avisa que ese modo no está disponible.

Los dominios desde donde se entra se autorizan en **Authentication ›
Settings › Authorized domains**. `localhost` ya viene autorizado.

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
    MedidaDeVolumen.tsx             # el volumen de un cuerpo, en cubitos
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
