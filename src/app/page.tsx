import { Protegido } from "@/components/auth/Protegido";
import { ProblemaWizard } from "@/components/problema/ProblemaWizard";

export default function Home() {
  return (
    <Protegido>
      <ProblemaWizard />
    </Protegido>
  );
}
