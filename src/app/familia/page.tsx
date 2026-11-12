import { Protegido } from "@/components/auth/Protegido";
import { Familia } from "@/components/paneles/Familia";

export const metadata = {
  title: "Mi familia | Materama",
  description: "Sigue cómo van tus hijos.",
};

export default function FamiliaPage() {
  return (
    <Protegido>
      <Familia />
    </Protegido>
  );
}
