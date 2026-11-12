import { Protegido } from "@/components/auth/Protegido";
import { CursoDetalle } from "@/components/paneles/CursoDetalle";

export const metadata = {
  title: "Curso | Materama",
  description: "Los alumnos del curso y su código de matrícula.",
};

export default async function CursoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Protegido>
      <CursoDetalle id={id} />
    </Protegido>
  );
}
