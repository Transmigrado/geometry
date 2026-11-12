import { Protegido } from "@/components/auth/Protegido";
import { Perfil } from "@/components/perfil/Perfil";

export const metadata = {
  title: "Tu perfil | Materama",
  description: "Tus datos y tu avatar.",
};

export default function PerfilPage() {
  return (
    <Protegido>
      <Perfil />
    </Protegido>
  );
}
