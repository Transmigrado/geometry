import { Protegido } from "@/components/auth/Protegido";
import { Estadisticas } from "@/components/estadisticas/Estadisticas";

export const metadata = {
  title: "Estadísticas | Materama",
  description: "Cómo te ha ido en cada materia.",
};

export default function EstadisticasPage() {
  return (
    <Protegido>
      <Estadisticas />
    </Protegido>
  );
}
