import { Protegido } from "@/components/auth/Protegido";
import { ProblemaWizard } from "@/components/problema/ProblemaWizard";

export const metadata = {
  title: "Geometría | Materama",
  description:
    "Arma tu problema de superficie o volumen y mira cómo se resuelve paso a paso.",
};

export default function GeometriaPage() {
  return (
    <Protegido>
      <ProblemaWizard />
    </Protegido>
  );
}
