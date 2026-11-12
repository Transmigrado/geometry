import { Protegido } from "@/components/auth/Protegido";
import { Practica } from "@/components/fracciones/Practica";

export const metadata = {
  title: "Fracciones | Materama",
  description: "Pinta la parte que te piden y mira si acertaste.",
};

export default function FraccionesPage() {
  return (
    <Protegido>
      <Practica />
    </Protegido>
  );
}
