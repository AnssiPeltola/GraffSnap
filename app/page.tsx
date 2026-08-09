import { auth } from "../src/lib/auth/server";
import LogoutButton from "@/src/components/LogoutButton";
import GraffitiMapWrapper from "@/src/components/map/GraffitiMapWrapper";
import { getAllGraffitiSightings } from "@/src/db/repositories/graffiti.repository";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { data: session } = await auth.getSession();

  const graffitiSightings = await getAllGraffitiSightings();

  return (
    <main>
      <h1>GraffSnap</h1>

      {session?.user ? (
        <>
          <p>Logged in as {session.user.name}</p>
          <LogoutButton />
        </>
      ) : (
        <p>Not logged in</p>
      )}

      <GraffitiMapWrapper graffitiSightings={graffitiSightings} />
    </main>
  );
}
