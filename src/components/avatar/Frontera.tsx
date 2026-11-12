"use client";

import { Component, type ReactNode } from "react";

/**
 * Donde se quedan los fallos del 3D. Si el modelo no carga —falta el
 * archivo, se cae la red, el GLB viene roto— sin esto el error sube hasta
 * arriba, React desmonta todo y el navegador acaba mostrando su propia
 * pantalla de «no se pudo cargar la página», que no dice nada a nadie.
 */
export class Frontera extends Component<
  { children: ReactNode; aviso: string },
  { roto: boolean }
> {
  state = { roto: false };

  static getDerivedStateFromError() {
    return { roto: true };
  }

  render() {
    if (!this.state.roto) return this.props.children;

    return (
      <p className="flex h-full items-center justify-center p-6 text-center font-bold text-slate-500">
        {this.props.aviso}
      </p>
    );
  }
}
