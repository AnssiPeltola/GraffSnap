import { auth } from "../src/lib/auth/server";
import LogoutButton from "@/src/components/LogoutButton";
import GraffitiMapWrapper from "@/src/components/map/GraffitiMapWrapper";
import AddGraffitiButton from "@/src/components/graffiti/AddGraffitiButton";
import { getAllGraffitiSightings } from "@/src/db/repositories/graffiti.repository";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { data: session } = await auth.getSession();

  const graffitiSightings = await getAllGraffitiSightings();

  return (
    <main>
      {session?.user && (
        <AddGraffitiButton authenticated={Boolean(session?.user)} />
      )}

      {session?.user && <LogoutButton />}

      <GraffitiMapWrapper graffitiSightings={graffitiSightings} />
    </main>
  );
}
