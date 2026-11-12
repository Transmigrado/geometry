import { all, call, put, takeEvery, takeLatest } from "redux-saga/effects";
import {
  fallo,
  guardado,
  guardarPedido,
  leerPedido,
  leido,
} from "./perfil";
import {
  guardarPerfil,
  leerPerfil,
  PERFIL_VACIO,
  type Perfil,
} from "@/lib/perfil";

/**
 * Leer el perfil. Va con takeLatest porque si llegan dos lecturas seguidas
 * —cambiar de cuenta, por ejemplo— la primera ya no interesa y su respuesta
 * tardía no debe pisar a la segunda.
 */
function* leer({ payload: uid }: ReturnType<typeof leerPedido>) {
  try {
    const suyo: Perfil = yield call(leerPerfil, uid);
    yield put(leido({ uid, perfil: suyo }));
  } catch {
    // quien no tiene perfil guardado arranca de cero, que para el caso es
    // lo mismo que tener uno vacío: lo manda al onboarding igual
    yield put(leido({ uid, perfil: PERFIL_VACIO }));
  }
}

/**
 * Guardar. Aquí va takeEvery, no takeLatest: cada guardado escribe campos
 * distintos y descartar uno a medias perdería lo que el niño acaba de
 * contestar.
 */
function* guardar({ payload, meta }: ReturnType<typeof guardarPedido>) {
  try {
    yield call(guardarPerfil, payload.uid, payload.cambios);
    yield put(guardado(payload.cambios));
    meta.avisar?.();
  } catch (falla) {
    yield put(fallo("No pudimos guardarlo."));
    meta.avisar?.(falla ?? new Error("No pudimos guardarlo."));
  }
}

export function* raiz() {
  yield all([
    takeLatest(leerPedido.type, leer),
    takeEvery(guardarPedido.type, guardar),
  ]);
}
