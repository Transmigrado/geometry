import { Protegido } from "@/components/auth/Protegido";
import { OperacionPractica } from "@/components/fracciones/OperacionPractica";

export const metadata = {
  title: "Restar fracciones | Materama",
  description: "Resta fracciones y representa el resultado en una figura.",
};

export default function RestarPage() {
  return (
    <Protegido>
      <OperacionPractica operacion="resta" />
    </Protegido>
  );
}
