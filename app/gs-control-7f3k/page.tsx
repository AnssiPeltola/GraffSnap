import { redirect } from "next/navigation";
import { auth } from "../../src/lib/auth/server";
import LoginForm from "./LoginForm";

// Render dynamically to check the current user session.
export const dynamic = "force-dynamic";

// Secret login page
export default async function LoginPage() {
  const { data: session } = await auth.getSession();

  if (session?.user) {
    redirect("/");
  }

  return (
    <main>
      <LoginForm />
    </main>
  );
}
