"use client";

import { useState } from "react";
import { Provider } from "react-redux";
import { crearStore } from "./store";

/** El store se crea una sola vez por cliente, no en cada render. */
export function ProveedorEstado({ children }: { children: React.ReactNode }) {
  const [store] = useState(crearStore);

  return <Provider store={store}>{children}</Provider>;
}
