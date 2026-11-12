import { Protegido } from "@/components/auth/Protegido";
import { Profesor } from "@/components/paneles/Profesor";

export const metadata = {
  title: "Mis cursos | Materama",
  description: "Arma tus cursos y mira cómo le va a tu clase.",
};

export default function ProfesorPage() {
  return (
    <Protegido>
      <Profesor />
    </Protegido>
  );
}
