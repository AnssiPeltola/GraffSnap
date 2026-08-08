import { redirect } from "next/navigation";
import { auth } from "./server";

export async function requireUser() {
  const { data: session } = await auth.getSession();

  if (!session?.user) {
    redirect("/gs-control-7f3k");
  }

  return session;
}
