import { formatear, type Medidas } from "./problema";

export type TipoProblema = "superficie" | "volumen";
export type TipoCuerpo = "cubo" | "paralelepipedo" | "esfera" | "cilindro";

export type Caja =
  | { tipo: "cubo"; lado: number }
  | { tipo: "paralelepipedo"; largo: number; ancho: number; alto: number };

export type Cuerpo =
  | Caja
  | { tipo: "esfera"; radio: number }
  | { tipo: "cilindro"; radio: number; altura: number };

export type ClaveMedida =
  | "lado"
  | "largo"
  | "ancho"
  | "alto"
  | "radio"
  | "altura";

export const CATALOGO: {
  tipo: TipoCuerpo;
  nombre: string;
  emoji: string;
  descripcion: string;
  inicial: Cuerpo;
}[] = [
  {
    tipo: "cubo",
    nombre: "Cubo",
    emoji: "🧊",
    descripcion: "Seis caras cuadradas iguales.",
    inicial: { tipo: "cubo", lado: 2 },
  },
  {
    tipo: "paralelepipedo",
    nombre: "Paralelepípedo",
    emoji: "📦",
    descripcion: "Una caja con largo, ancho y alto.",
    inicial: { tipo: "paralelepipedo", largo: 10, ancho: 4, alto: 2 },
  },
  {
    tipo: "esfera",
    nombre: "Esfera",
    emoji: "⚽",
    descripcion: "Una pelota: no tiene caras planas.",
    inicial: { tipo: "esfera", radio: 3 },
  },
  {
    tipo: "cilindro",
    nombre: "Cilindro",
    emoji: "🥫",
    descripcion: "Un tarro: dos círculos y una pared enrollada.",
    inicial: { tipo: "cilindro", radio: 2, altura: 5 },
  },
];

export function esCaja(cuerpo: Cuerpo): cuerpo is Caja {
  return cuerpo.tipo === "cubo" || cuerpo.tipo === "paralelepipedo";
}

export function medidasDeCaja(caja: Caja): Medidas {
  return caja.tipo === "cubo"
    ? { largo: caja.lado, ancho: caja.lado, alto: caja.lado }
    : { largo: caja.largo, ancho: caja.ancho, alto: caja.alto };
}

export function superficie(cuerpo: Cuerpo): number {
  switch (cuerpo.tipo) {
    case "cubo":
      return 6 * cuerpo.lado ** 2;
    case "paralelepipedo": {
      const { largo, ancho, alto } = cuerpo;
      return 2 * (largo * ancho + largo * alto + ancho * alto);
    }
    case "esfera":
      return 4 * Math.PI * cuerpo.radio ** 2;
    case "cilindro":
      return (
        2 * Math.PI * cuerpo.radio ** 2 +
        2 * Math.PI * cuerpo.radio * cuerpo.altura
      );
  }
}

export function volumen(cuerpo: Cuerpo): number {
  switch (cuerpo.tipo) {
    case "cubo":
      return cuerpo.lado ** 3;
    case "paralelepipedo":
      return cuerpo.largo * cuerpo.ancho * cuerpo.alto;
    case "esfera":
      return (4 / 3) * Math.PI * cuerpo.radio ** 3;
    case "cilindro":
      return Math.PI * cuerpo.radio ** 2 * cuerpo.altura;
  }
}

export function medir(cuerpo: Cuerpo, problema: TipoProblema) {
  return problema === "superficie" ? superficie(cuerpo) : volumen(cuerpo);
}

/** La cuenta escrita con los números del niño, para que vea de dónde sale. */
export function formula(cuerpo: Cuerpo, problema: TipoProblema): string {
  const resultado = formatear(medir(cuerpo, problema));

  if (problema === "superficie") {
    switch (cuerpo.tipo) {
      case "cubo":
        return `6 × ${cuerpo.lado} × ${cuerpo.lado} = ${resultado}`;
      case "paralelepipedo": {
        const { largo, ancho, alto } = cuerpo;
        return `2 × (${largo}×${ancho} + ${largo}×${alto} + ${ancho}×${alto}) = ${resultado}`;
      }
      case "esfera":
        return `4 × π × ${cuerpo.radio} × ${cuerpo.radio} = ${resultado}`;
      case "cilindro":
        return `2 × π × ${cuerpo.radio}² + 2 × π × ${cuerpo.radio} × ${cuerpo.altura} = ${resultado}`;
    }
  }

  switch (cuerpo.tipo) {
    case "cubo":
      return `${cuerpo.lado} × ${cuerpo.lado} × ${cuerpo.lado} = ${resultado}`;
    case "paralelepipedo":
      return `${cuerpo.largo} × ${cuerpo.ancho} × ${cuerpo.alto} = ${resultado}`;
    case "esfera":
      return `4/3 × π × ${cuerpo.radio}³ = ${resultado}`;
    case "cilindro":
      return `π × ${cuerpo.radio}² × ${cuerpo.altura} = ${resultado}`;
  }
}

export function nombreCuerpo(cuerpo: Cuerpo): string {
  switch (cuerpo.tipo) {
    case "cubo":
      return `un cubo de lado ${cuerpo.lado}`;
    case "paralelepipedo":
      return `una caja de largo ${cuerpo.largo}, ancho ${cuerpo.ancho} y alto ${cuerpo.alto}`;
    case "esfera":
      return `una esfera de radio ${cuerpo.radio}`;
    case "cilindro":
      return `un cilindro de radio ${cuerpo.radio} y altura ${cuerpo.altura}`;
  }
}

export function nombreCorto(cuerpo: Cuerpo): string {
  const nombres: Record<TipoCuerpo, string> = {
    cubo: "El cubo",
    paralelepipedo: "La caja",
    esfera: "La esfera",
    cilindro: "El cilindro",
  };
  return nombres[cuerpo.tipo];
}

export function nombrePlural(cuerpo: Cuerpo): string {
  const nombres: Record<TipoCuerpo, string> = {
    cubo: "cubos",
    paralelepipedo: "cajas",
    esfera: "esferas",
    cilindro: "cilindros",
  };
  return nombres[cuerpo.tipo];
}

export type Campo = {
  clave: ClaveMedida;
  etiqueta: string;
  valor: number;
};

export function campos(cuerpo: Cuerpo): Campo[] {
  switch (cuerpo.tipo) {
    case "cubo":
      return [{ clave: "lado", etiqueta: "Lado", valor: cuerpo.lado }];
    case "paralelepipedo":
      return [
        { clave: "largo", etiqueta: "Largo", valor: cuerpo.largo },
        { clave: "ancho", etiqueta: "Ancho", valor: cuerpo.ancho },
        { clave: "alto", etiqueta: "Alto", valor: cuerpo.alto },
      ];
    case "esfera":
      return [{ clave: "radio", etiqueta: "Radio", valor: cuerpo.radio }];
    case "cilindro":
      return [
        { clave: "radio", etiqueta: "Radio", valor: cuerpo.radio },
        { clave: "altura", etiqueta: "Altura", valor: cuerpo.altura },
      ];
  }
}

export function conMedida(
  cuerpo: Cuerpo,
  clave: ClaveMedida,
  valor: number,
): Cuerpo {
  return { ...cuerpo, [clave]: valor } as Cuerpo;
}

/** Cuánto espacio ocupa el dibujo, en unidades de medida. */
export function huella(cuerpo: Cuerpo, desarmado: boolean) {
  switch (cuerpo.tipo) {
    case "cubo":
    case "paralelepipedo": {
      const { largo, ancho, alto } = medidasDeCaja(cuerpo);
      return desarmado
        ? { ancho: largo + 2 * alto, alto: 2 * ancho + 2 * alto }
        : { ancho: largo + alto, alto: ancho + alto };
    }
    case "esfera":
      // los 4 círculos equivalentes, más sitio para la explicación
      return desarmado
        ? { ancho: 4 * cuerpo.radio, alto: 4 * cuerpo.radio + 3 }
        : { ancho: 2 * cuerpo.radio, alto: 2 * cuerpo.radio };
    case "cilindro":
      return desarmado
        ? {
            ancho: 2 * Math.PI * cuerpo.radio,
            alto: cuerpo.altura + 4 * cuerpo.radio,
          }
        : { ancho: 2 * cuerpo.radio, alto: cuerpo.altura + cuerpo.radio };
  }
}

/**
 * Avisos honestos: el problema del colegio divide las medidas, pero en la
 * vida real las pelotas dejan huecos y lo curvo no se cubre con cuadrados.
 */
export function advertencia(
  problema: TipoProblema,
  a: Cuerpo,
  b: Cuerpo,
): string | null {
  if (problema === "volumen" && !esCaja(b)) {
    return `Al apilar ${
      b.tipo === "esfera" ? "pelotas" : "cilindros"
    } quedan huecos entre ellos, así que en la vida real caben menos. Aquí comparamos los volúmenes.`;
  }

  // el cilindro sí se puede forrar enrollando, como la etiqueta de un tarro;
  // la esfera no: su superficie no se puede aplanar de ninguna manera
  if (problema === "superficie" && a.tipo === "esfera") {
    return "La esfera no se puede aplanar, así que no hay forma de cubrirla con trozos planos sin arrugarlos. Aquí comparamos cuánta superficie tiene cada una.";
  }

  return null;
}

export function enunciado(
  problema: TipoProblema,
  a: Cuerpo,
  b: Cuerpo,
): string {
  return problema === "superficie"
    ? `Tenemos ${nombreCuerpo(a)}. ¿Cuánta superficie de ${nombreCuerpo(
        b,
      )} necesitamos para cubrirla?`
    : `Tenemos ${nombreCuerpo(a)}. ¿Cuánto volumen de ${nombreCuerpo(
        b,
      )} necesitamos para llenarla?`;
}
