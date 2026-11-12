import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { PERFIL_VACIO, type Perfil } from "@/lib/perfil";

export type EstadoPerfil = {
  perfil: Perfil;
  /** de quién es el perfil cargado, para no enseñar el del anterior */
  duenio: string | null;
  cargando: boolean;
  guardando: boolean;
  error: string | null;
};

const INICIAL: EstadoPerfil = {
  perfil: PERFIL_VACIO,
  duenio: null,
  cargando: false,
  guardando: false,
  error: null,
};

/** Lo que la saga llama al terminar de guardar, con la falla si la hubo. */
export type Aviso = (falla?: unknown) => void;

/**
 * El perfil del que entró. Las acciones terminadas en «Pedido» no las
 * resuelve el reducer: sólo dejan constancia de que algo está en marcha y
 * son el aviso para la saga, que es la que habla con Firestore.
 */
export const perfil = createSlice({
  name: "perfil",
  initialState: INICIAL,
  reducers: {
    leerPedido: {
      prepare: (uid: string) => ({ payload: uid }),
      reducer: (estado) => {
        estado.cargando = true;
        estado.error = null;
      },
    },

    leido: (
      estado,
      { payload }: PayloadAction<{ uid: string; perfil: Perfil }>,
    ) => {
      estado.perfil = payload.perfil;
      estado.duenio = payload.uid;
      estado.cargando = false;
    },

    guardarPedido: {
      /**
       * El aviso viaja en «meta» y no en el payload a propósito: es una
       * función, y el payload tiene que poder serializarse.
       */
      prepare: (uid: string, cambios: Partial<Perfil>, avisar?: Aviso) => ({
        payload: { uid, cambios },
        meta: { avisar },
      }),
      reducer: (estado) => {
        estado.guardando = true;
        estado.error = null;
      },
    },

    guardado: (estado, { payload }: PayloadAction<Partial<Perfil>>) => {
      estado.perfil = { ...estado.perfil, ...payload };
      estado.guardando = false;
    },

    fallo: (estado, { payload }: PayloadAction<string>) => {
      estado.error = payload;
      estado.cargando = false;
      estado.guardando = false;
    },

    /** al cerrar sesión no queda nada que enseñar */
    olvidado: () => INICIAL,
  },
});

export const { leerPedido, leido, guardarPedido, guardado, fallo, olvidado } =
  perfil.actions;
