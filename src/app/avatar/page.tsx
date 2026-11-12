import { Protegido } from "@/components/auth/Protegido";
import { CreadorAvatar } from "@/components/avatar/CreadorAvatar";

export const metadata = {
  title: "Tu avatar | Materama",
  description: "Arma tu avatar en 3D y acompáñate con él por toda la app.",
};

export default function AvatarPage() {
  return (
    <Protegido>
      <CreadorAvatar />
    </Protegido>
  );
}
