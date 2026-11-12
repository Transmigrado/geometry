import { Protegido } from "@/components/auth/Protegido";
import { Colegio } from "@/components/paneles/Colegio";

export const metadata = {
  title: "Tu colegio | Materama",
  description: "Administra a tus profesores y mira cómo van los cursos.",
};

export default function ColegioPage() {
  return (
    <Protegido>
      <Colegio />
    </Protegido>
  );
}
