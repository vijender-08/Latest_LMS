import { redirect } from "next/navigation";
import { PublicFooter, PublicHeader } from "@/components/layout/PublicHeader";
import { getCurrentSession } from "@/lib/auth";
import { LoginPageClient } from "./LoginPageClient";

export const metadata = {
  title: "Sign In — RBMI Library Management System",
  description: "Staff and Patron authentication portal for RBMI Central Library",
};

export default async function LoginPage() {
  try {
    const auth = await getCurrentSession();
    if (auth) {
      if ("patron" in auth) {
        redirect("/account");
      }
      if ("user" in auth) {
        redirect("/circulation");
      }
    }
  } catch (err) {
    // Next.js redirect() throws a NEXT_REDIRECT digest error that must be rethrown
    if (
      err &&
      typeof err === "object" &&
      "digest" in err &&
      typeof (err as { digest: unknown }).digest === "string" &&
      (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
    ) {
      throw err;
    }
    // Otherwise non-fatal (e.g. DB connectivity check failure on login page)
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicHeader currentPath="/login" isLoggedIn={false} />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <LoginPageClient />
      </main>

      <PublicFooter />
    </div>
  );
}
