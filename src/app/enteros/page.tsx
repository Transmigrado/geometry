import { Protegido } from "@/components/auth/Protegido";
import { Practica } from "@/components/enteros/Practica";

export const metadata = {
  title: "Números enteros | Materama",
  description: "Suma números enteros viendo cómo avanza o retrocede un auto.",
};

export default function EnterosPage() {
  return (
    <Protegido>
      <Practica />
    </Protegido>
  );
}
