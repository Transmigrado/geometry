import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { perfil } from "./perfil";
import { raiz } from "./sagas";

/**
 * Uno por cliente, no uno global: en el servidor el módulo se comparte
 * entre peticiones, y un store de módulo mezclaría el perfil de un usuario
 * con el de otro.
 */
export function crearStore() {
  const saga = createSagaMiddleware();

  const store = configureStore({
    reducer: { perfil: perfil.reducer },
    middleware: (porDefecto) =>
      porDefecto({
        // el aviso de «ya guardé» es una función, y va a propósito en meta
        serializableCheck: { ignoredActionPaths: ["meta.avisar"] },
      }).concat(saga),
  });

  saga.run(raiz);

  return store;
}

export type Store = ReturnType<typeof crearStore>;
export type Estado = ReturnType<Store["getState"]>;
export type Despacho = Store["dispatch"];
