import { Protegido } from "@/components/auth/Protegido";
import { Practica } from "@/components/ecuaciones/Practica";

export const metadata = {
  title: "Ecuaciones | Materama",
  description: "Descubre cuánto pesa cada fruta mirando la pesa.",
};

export default function EcuacionesPage() {
  return (
    <Protegido>
      <Practica />
    </Protegido>
  );
}
