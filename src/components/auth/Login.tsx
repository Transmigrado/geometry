"use client";

import { useState } from "react";
import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  type AuthProvider,
} from "firebase/auth";
import { autenticacion, hayConfiguracion } from "@/lib/firebase";

const CAMPO =
  "block w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-sm text-slate-900 focus:border-sky-500 focus:ring-sky-500";
const BOTON_EXTERNO =
  "inline-flex w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-100 focus:z-10 focus:ring-4 focus:ring-slate-200 disabled:opacity-50";

export function Login() {
  const configurado = hayConfiguracion();
  const [modo, setModo] = useState<"entrar" | "crear">("entrar");
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [recordar, setRecordar] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [esperando, setEsperando] = useState(false);

  async function intentar(accion: () => Promise<unknown>) {
    setError(null);
    setAviso(null);
    setEsperando(true);
    try {
      await setPersistence(
        autenticacion(),
        recordar ? browserLocalPersistence : browserSessionPersistence,
      );
      await accion();
    } catch (falla) {
      setError(mensajeDe(falla));
    } finally {
      setEsperando(false);
    }
  }

  function conProveedor(proveedor: AuthProvider) {
    return intentar(() => signInWithPopup(autenticacion(), proveedor));
  }

  function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    intentar(() =>
      modo === "entrar"
        ? signInWithEmailAndPassword(autenticacion(), correo, clave)
        : createUserWithEmailAndPassword(autenticacion(), correo, clave),
    );
  }

  function recuperar() {
    if (!correo) {
      setError("Escribe tu correo y volvemos a intentarlo.");
      return;
    }
    intentar(async () => {
      await sendPasswordResetEmail(autenticacion(), correo);
      setAviso("Te enviamos un correo para crear una contraseña nueva.");
    });
  }

  return (
    <section className="bg-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="flex items-center justify-center px-6 py-10 sm:px-10">
          <form
            onSubmit={enviar}
            className="w-full max-w-md space-y-5 xl:max-w-xl"
          >
            <h1 className="text-2xl font-extrabold text-slate-900">
              {modo === "entrar" ? "Hola de nuevo" : "Crea tu cuenta"}
            </h1>

            {!configurado && (
              <p className="rounded-lg bg-amber-100 p-4 text-sm font-semibold text-amber-900">
                Falta conectar Firebase: copia <code>.env.local.example</code>{" "}
                como <code>.env.local</code>, pega los datos de tu proyecto y
                vuelve a levantar el servidor.
              </p>
            )}

            <div className="items-center space-y-3 sm:flex sm:space-x-4 sm:space-y-0">
              <button
                type="button"
                disabled={!configurado || esperando}
                onClick={() => conProveedor(new GoogleAuthProvider())}
                className={BOTON_EXTERNO}
              >
                <IconoGoogle />
                Entrar con Google
              </button>
            </div>

            <div className="flex items-center">
              <div className="h-0.5 w-full bg-slate-200" />
              <div className="px-5 text-center text-slate-500">o</div>
              <div className="h-0.5 w-full bg-slate-200" />
            </div>

            <div>
              <label
                htmlFor="correo"
                className="mb-2 block text-sm font-medium text-slate-900"
              >
                Correo
              </label>
              <input
                type="email"
                id="correo"
                value={correo}
                onChange={(evento) => setCorreo(evento.target.value)}
                placeholder="escribe tu correo"
                required
                className={CAMPO}
              />
            </div>

            <div>
              <label
                htmlFor="clave"
                className="mb-2 block text-sm font-medium text-slate-900"
              >
                Contraseña
              </label>
              <input
                type="password"
                id="clave"
                value={clave}
                onChange={(evento) => setClave(evento.target.value)}
                placeholder="••••••••"
                required
                className={CAMPO}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-3 text-sm text-slate-500">
                <input
                  type="checkbox"
                  checked={recordar}
                  onChange={(evento) => setRecordar(evento.target.checked)}
                  className="h-4 w-4 rounded border border-slate-300 bg-slate-50 focus:ring-3 focus:ring-sky-300"
                />
                No cerrar sesión
              </label>
              <button
                type="button"
                onClick={recuperar}
                className="text-sm font-medium text-sky-600 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {error && (
              <p className="rounded-lg bg-rose-100 p-3 text-sm font-semibold text-rose-900">
                {error}
              </p>
            )}
            {aviso && (
              <p className="rounded-lg bg-emerald-100 p-3 text-sm font-semibold text-emerald-900">
                {aviso}
              </p>
            )}

            <button
              type="submit"
              disabled={!configurado || esperando}
              className="w-full rounded-lg bg-sky-600 px-5 py-2.5 text-center text-sm font-bold text-white hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-300 disabled:opacity-50"
            >
              {esperando
                ? "Un momento…"
                : modo === "entrar"
                  ? "Entrar a mi cuenta"
                  : "Crear mi cuenta"}
            </button>

            <p className="text-sm font-light text-slate-500">
              {modo === "entrar" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setModo(modo === "entrar" ? "crear" : "entrar");
                  setError(null);
                  setAviso(null);
                }}
                className="font-medium text-sky-600 hover:underline"
              >
                {modo === "entrar" ? "Regístrate" : "Entra aquí"}
              </button>
            </p>
          </form>
        </div>

        <div className="flex items-center justify-center bg-sky-600 px-6 py-10 sm:px-10">
          <div className="max-w-md xl:max-w-xl">
            <p className="mb-4 flex items-center text-2xl font-extrabold text-white">
              📐 Materama
            </p>
            <h2 className="mb-4 text-3xl font-extrabold leading-none tracking-tight text-white xl:text-5xl">
              La geometría del colegio, para verla con los ojos.
            </h2>
            <p className="mb-8 font-light text-sky-100">
              Arma el problema que te dieron, desarma los cuerpos, cuenta los
              cuadritos y descubre tú mismo la respuesta antes de mirar la
              cuenta.
            </p>
            <ul className="flex items-center gap-3">
              {["🧊", "📦", "⚽", "🥫"].map((figura) => (
                <li
                  key={figura}
                  className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/70 bg-sky-500 text-2xl"
                >
                  {figura}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function mensajeDe(falla: unknown) {
  const codigo =
    typeof falla === "object" && falla && "code" in falla
      ? String((falla as { code: string }).code)
      : "";

  const mensajes: Record<string, string> = {
    "auth/invalid-credential": "El correo o la contraseña no coinciden.",
    "auth/invalid-email": "Ese correo no parece estar bien escrito.",
    "auth/user-not-found": "No encontramos una cuenta con ese correo.",
    "auth/wrong-password": "El correo o la contraseña no coinciden.",
    "auth/email-already-in-use": "Ese correo ya tiene una cuenta.",
    "auth/weak-password": "La contraseña necesita al menos 6 caracteres.",
    "auth/popup-closed-by-user": "Cerraste la ventana antes de terminar.",
    "auth/operation-not-allowed":
      "Ese modo de entrar todavía no está habilitado en Firebase.",
    "auth/unauthorized-domain":
      "Este dominio no está autorizado en Firebase para entrar.",
  };

  return mensajes[codigo] ?? "No pudimos entrar. Inténtalo de nuevo.";
}

function IconoGoogle() {
  return (
    <svg className="mr-2 h-5 w-5" viewBox="0 0 21 20" fill="none">
      <path
        d="M20.3081 10.2303C20.3081 9.55056 20.253 8.86711 20.1354 8.19836H10.7031V12.0492H16.1046C15.8804 13.2911 15.1602 14.3898 14.1057 15.0879V17.5866H17.3282C19.2205 15.8449 20.3081 13.2728 20.3081 10.2303Z"
        fill="#3F83F8"
      />
      <path
        d="M10.7019 20.0006C13.3989 20.0006 15.6734 19.1151 17.3306 17.5865L14.1081 15.0879C13.2115 15.6979 12.0541 16.0433 10.7056 16.0433C8.09669 16.0433 5.88468 14.2832 5.091 11.9169H1.76562V14.4927C3.46322 17.8695 6.92087 20.0006 10.7019 20.0006Z"
        fill="#34A853"
      />
      <path
        d="M5.08857 11.9169C4.66969 10.6749 4.66969 9.33008 5.08857 8.08811V5.51233H1.76688C0.348541 8.33798 0.348541 11.667 1.76688 14.4927L5.08857 11.9169Z"
        fill="#FBBC04"
      />
      <path
        d="M10.7019 3.95805C12.1276 3.936 13.5055 4.47247 14.538 5.45722L17.393 2.60218C15.5852 0.904587 13.1858 -0.0287217 10.7019 0.000673888C6.92087 0.000673888 3.46322 2.13185 1.76562 5.51234L5.08732 8.08813C5.87733 5.71811 8.09302 3.95805 10.7019 3.95805Z"
        fill="#EA4335"
      />
    </svg>
  );
}
