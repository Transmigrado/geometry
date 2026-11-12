import { Protegido } from "@/components/auth/Protegido";
import { Inicio } from "@/components/inicio/Inicio";

export default function Home() {
  return (
    <Protegido>
      <Inicio />
    </Protegido>
  );
}
