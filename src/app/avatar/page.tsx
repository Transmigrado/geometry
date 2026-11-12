import { Protegido } from "@/components/auth/Protegido";
import { SelectorAvatar } from "@/components/avatar/SelectorAvatar";

export const metadata = {
  title: "Tu avatar | Materama",
  description: "Arma tu avatar en 3D y acompáñate con él por toda la app.",
};

export default function AvatarPage() {
  return (
    <Protegido>
      <SelectorAvatar />
    </Protegido>
  );
}
