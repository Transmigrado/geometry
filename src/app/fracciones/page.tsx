import { Protegido } from "@/components/auth/Protegido";
import { Juegos } from "@/components/fracciones/Juegos";

export const metadata = {
  title: "Fracciones | Materama",
  description: "Elige un juego para practicar fracciones.",
};

export default function FraccionesPage() {
  return (
    <Protegido>
      <Juegos />
    </Protegido>
  );
}
