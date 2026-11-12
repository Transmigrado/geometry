import { Protegido } from "@/components/auth/Protegido";
import { OperacionPractica } from "@/components/fracciones/OperacionPractica";

export const metadata = {
  title: "Sumar fracciones | Materama",
  description: "Suma fracciones y representa el resultado en una figura.",
};

export default function SumarPage() {
  return (
    <Protegido>
      <OperacionPractica operacion="suma" />
    </Protegido>
  );
}
