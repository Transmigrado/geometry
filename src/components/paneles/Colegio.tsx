"use client";

import { useCallback, useEffect, useState } from "react";
import { usePerfil } from "@/components/auth/ProveedorPerfil";
import {
  colegio as leerColegio,
  crearColegio,
  cursosDelColegio,
  invitarProfesor,
  profesoresDe,
  type Curso,
  type Miembro,
} from "@/lib/colegio";
import {
  Aviso, BOTON, CAMPO, Cargando, Codigo, ETIQUETA, Tarjeta, Titulo, Vacio,
  porque,
} from "./piezas";

export function Colegio() {
  const { perfil } = usePerfil();

  return perfil.colegio ? <Panel id={perfil.colegio} /> : <Primero />;
}

/** Quien dice ser un colegio pero todavía no lo ha creado. */
function Primero() {
  const [nombre, setNombre] = useState("");
  const [quienEres, setQuienEres] = useState("");
  const [creando, setCreando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  async function crear(evento: React.FormEvent) {
    evento.preventDefault();
    setCreando(true);
    setAviso(null);
    try {
      await crearColegio({ nombre: nombre.trim(), quienEres: quienEres.trim() });
      // el rol y el colegio llegan en el token; hay que pedirlo de nuevo
      window.location.reload();
    } catch (falla) {
      setAviso("!" + porque(falla, "No pudimos crear el colegio."));
      setCreando(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Titulo>Tu colegio</Titulo>

      <Tarjeta
        titulo="Primero, crea tu establecimiento"
        pie="Después podrás invitar a tus profesores, y ellos armarán sus cursos."
      >
        <form onSubmit={crear} className="flex flex-col gap-4">
          <label className="flex max-w-md flex-col gap-2">
            <span className={ETIQUETA}>Nombre del colegio</span>
            <input
              type="text"
              value={nombre}
              onChange={(evento) => setNombre(evento.target.value)}
              maxLength={120}
              autoFocus
              placeholder="Escuela República de Chile"
              className={CAMPO}
            />
          </label>

          <label className="flex max-w-md flex-col gap-2">
            <span className={ETIQUETA}>Tu cargo</span>
            <input
              type="text"
              value={quienEres}
              onChange={(evento) => setQuienEres(evento.target.value)}
              maxLength={60}
              placeholder="Dirección"
              className={CAMPO}
            />
          </label>

          <Aviso texto={aviso} />

          <button
            type="submit"
            disabled={!nombre.trim() || creando}
            className={`${BOTON} self-start`}
          >
            {creando ? "Creando…" : "Crear el colegio"}
          </button>
        </form>
      </Tarjeta>
    </div>
  );
}

function Panel({ id }: { id: string }) {
  const [nombre, setNombre] = useState<string | null>(null);
  const [profesores, setProfesores] = useState<Miembro[] | null>(null);
  const [cursos, setCursos] = useState<Curso[] | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const recargar = useCallback(() => {
    leerColegio(id).then((suyo) => setNombre(suyo?.nombre ?? "")).catch(() => {});
    profesoresDe(id).then(setProfesores).catch(() => setProfesores([]));
    cursosDelColegio(id).then(setCursos).catch(() => setCursos([]));
  }, [id]);

  useEffect(recargar, [recargar]);

  const alumnosPorCurso = (cursos ?? []).length;

  return (
    <div className="flex flex-col gap-6">
      <Titulo>{nombre ?? "Tu colegio"}</Titulo>

      <div className="grid gap-4 sm:grid-cols-3">
        <Cifra que="Profesores" cuanto={profesores?.length} />
        <Cifra que="Cursos" cuanto={alumnosPorCurso} />
        <Cifra que="Año" cuanto={new Date().getFullYear()} />
      </div>

      <Invitar id={id} alInvitar={() => { recargar(); setAviso(null); }} />

      <Tarjeta titulo="Profesores">
        {!profesores ? (
          <Cargando />
        ) : profesores.length === 0 ? (
          <Vacio>Todavía no hay nadie. Invita al primero ahí arriba.</Vacio>
        ) : (
          <ul className="flex flex-col divide-y divide-slate-100">
            {profesores.map((quien) => (
              <li key={quien.id} className="flex flex-wrap items-baseline justify-between gap-2 py-3">
                <span className="font-bold text-slate-800">
                  {quien.nombre || quien.correo}
                </span>
                <span className="text-sm text-slate-500">
                  {quien.rol === "admin" ? "Dirección" : "Profesor"}
                  {quien.estado !== "active" ? " · pendiente" : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Tarjeta>

      <Tarjeta titulo="Cursos" pie="Los arma cada profesor desde su panel.">
        {!cursos ? (
          <Cargando />
        ) : cursos.length === 0 ? (
          <Vacio>Ningún profesor ha creado cursos todavía.</Vacio>
        ) : (
          <ul className="flex flex-col divide-y divide-slate-100">
            {cursos.map((curso) => (
              <li key={curso.id} className="flex flex-wrap items-baseline justify-between gap-2 py-3">
                <span className="font-bold text-slate-800">{curso.nombre}</span>
                <span className="text-sm text-slate-500">{curso.anio}</span>
              </li>
            ))}
          </ul>
        )}
      </Tarjeta>

      <Aviso texto={aviso} />
    </div>
  );
}

function Cifra({ que, cuanto }: { que: string; cuanto?: number }) {
  return (
    <div className="flex flex-col gap-1 rounded-3xl bg-white p-5 shadow-sm">
      <span className={ETIQUETA}>{que}</span>
      <span className="text-3xl font-extrabold text-sky-800">
        {cuanto ?? "—"}
      </span>
    </div>
  );
}

function Invitar({ id, alInvitar }: { id: string; alInvitar: () => void }) {
  const [correo, setCorreo] = useState("");
  const [codigo, setCodigo] = useState<{ codigo: string; caduca: number } | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  async function invitar(evento: React.FormEvent) {
    evento.preventDefault();
    setEnviando(true);
    setAviso(null);
    try {
      setCodigo(await invitarProfesor({ schoolId: id, correo: correo.trim() }));
      setCorreo("");
      alInvitar();
    } catch (falla) {
      setAviso("!" + porque(falla, "No pudimos crear la invitación."));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Tarjeta
      titulo="Invitar a un profesor"
      pie="El código sólo sirve para el correo que pongas aquí, y dura una semana."
    >
      <form onSubmit={invitar} className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-64 flex-1 flex-col gap-2">
          <span className={ETIQUETA}>Su correo</span>
          <input
            type="email"
            value={correo}
            onChange={(evento) => setCorreo(evento.target.value)}
            placeholder="profesor@colegio.cl"
            className={CAMPO}
          />
        </label>
        <button type="submit" disabled={!correo.trim() || enviando} className={BOTON}>
          {enviando ? "Creando…" : "Crear invitación"}
        </button>
      </form>

      <Aviso texto={aviso} />

      {codigo && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-slate-600">
            Pásale este código. Todavía no se envían correos desde la app, así
            que se lo tienes que hacer llegar tú.
          </p>
          <Codigo valor={codigo.codigo} caduca={codigo.caduca} />
        </div>
      )}
    </Tarjeta>
  );
}
