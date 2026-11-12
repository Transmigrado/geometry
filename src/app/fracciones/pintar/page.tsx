import { Protegido } from "@/components/auth/Protegido";
import { Practica } from "@/components/fracciones/Practica";

export const metadata = {
  title: "Pintar fracciones | Materama",
  description: "Pinta la parte que te piden y mira si acertaste.",
};

export default function PintarPage() {
  return (
    <Protegido>
      <Practica />
    </Protegido>
  );
}
