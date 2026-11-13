import { Protegido } from "@/components/auth/Protegido";
import { Album } from "@/components/album/Album";

export const metadata = {
  title: "Mis álbumes | Materama",
  description: "Las láminas que vas a ir consiguiendo.",
};

export default function AlbumesPage() {
  return (
    <Protegido>
      <Album />
    </Protegido>
  );
}
