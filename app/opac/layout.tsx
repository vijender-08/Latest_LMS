import type React from "react";
import { PublicFooter, PublicHeader } from "@/components/layout/PublicHeader";
import { getCurrentSession } from "@/lib/auth";

export const metadata = {
  title: "OPAC — Online Public Access Catalogue — RBMI Central Library",
  description:
    "Search books, journals, and learning resources across RBMI Group of Institutions libraries",
};

export default async function OpacLayout({ children }: { children: React.ReactNode }) {
  let isLoggedIn = false;
  let csrfToken: string | undefined;

  try {
    const auth = await getCurrentSession();
    if (auth) {
      isLoggedIn = true;
      csrfToken = auth.session.csrfToken;
    }
  } catch {
    // Non-fatal
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <PublicHeader currentPath="/opac" isLoggedIn={isLoggedIn} csrfToken={csrfToken} />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">{children}</main>
      <PublicFooter />
    </div>
  );
}
