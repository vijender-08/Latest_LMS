"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface PublicHeaderProps {
  currentPath?: string;
  isLoggedIn?: boolean;
  csrfToken?: string;
}

export function PublicHeader({
  currentPath,
  isLoggedIn: initialIsLoggedIn,
  csrfToken: initialCsrfToken,
}: PublicHeaderProps) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState<boolean>(initialIsLoggedIn ?? false);
  const [token, setToken] = useState<string>(initialCsrfToken ?? "");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (initialIsLoggedIn !== undefined) {
      setLoggedIn(initialIsLoggedIn);
      if (initialCsrfToken) setToken(initialCsrfToken);
      return;
    }

    let isMounted = true;
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted) return;
        if (data?.authenticated) {
          setLoggedIn(true);
          if (data.csrfToken) {
            setToken(data.csrfToken);
          }
        } else {
          setLoggedIn(false);
        }
      })
      .catch(() => {
        // Non-critical background auth check
      });

    return () => {
      isMounted = false;
    };
  }, [initialIsLoggedIn, initialCsrfToken]);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      let activeCsrf = token;
      if (!activeCsrf) {
        try {
          const meRes = await fetch("/api/auth/me");
          if (meRes.ok) {
            const meData = await meRes.json();
            activeCsrf = meData.csrfToken || "";
          }
        } catch {
          // Non-fatal
        }
      }

      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": activeCsrf,
        },
        body: JSON.stringify({ csrfToken: activeCsrf }),
      });
    } finally {
      setLoggedIn(false);
      setLoggingOut(false);
      router.push("/login");
      router.refresh();
    }
  };

  const navLinks = [
    { href: "/opac", label: "OPAC Catalogue", icon: "📚" },
    { href: "/account", label: "Patron Account", icon: "👤" },
    { href: "/health", label: "System Status", icon: "💚" },
  ];

  return (
    <header className="no-print border-b border-slate-200 bg-white shadow-xs sticky top-0 z-30">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2.5 sm:px-6 sm:py-3">
        {/* Brand */}
        <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
          <Link href="/" className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
            <span className="flex h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-900 text-xs sm:text-sm font-bold text-white shadow-xs">
              LMS
            </span>
            <div className="truncate">
              <h1 className="text-sm sm:text-base font-bold leading-tight text-slate-900 truncate">
                RBMI Central Library
              </h1>
              <p className="text-[10px] sm:text-[11px] text-slate-500 hidden xs:block truncate">
                RBMI Group of Institutions, Bareilly
              </p>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4 text-xs font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition py-1 px-1.5 rounded ${
                currentPath === link.href
                  ? "font-bold text-blue-900 bg-blue-50/60"
                  : "text-slate-600 hover:text-blue-700 hover:bg-slate-50"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {loggedIn ? (
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {loggingOut ? "Signing Out..." : "Sign Out"}
            </button>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-blue-900 px-3 py-1.5 font-semibold text-white transition hover:bg-blue-800 shadow-xs"
            >
              Sign In
            </Link>
          )}
        </nav>

        {/* Mobile Hamburger Toggle Button */}
        <div className="flex items-center space-x-2 md:hidden">
          {loggedIn ? (
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {loggingOut ? "..." : "Sign Out"}
            </button>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-blue-900 px-2.5 py-1 text-xs font-semibold text-white shadow-xs"
            >
              Sign In
            </Link>
          )}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-700 hover:bg-slate-100 transition"
          >
            {isMobileMenuOpen ? (
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col space-y-1">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center space-x-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                currentPath === "/"
                  ? "bg-blue-50 font-bold text-blue-900"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>🏠</span>
              <span>Home Portal</span>
            </Link>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  currentPath === link.href
                    ? "bg-blue-50 font-bold text-blue-900"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
            {loggedIn ? (
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                disabled={loggingOut}
                className="flex w-full items-center space-x-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition cursor-pointer text-left"
              >
                <span>🚪</span>
                <span>{loggingOut ? "Signing Out..." : "Sign Out"}</span>
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                <span>🔑</span>
                <span>Sign In</span>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="no-print border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        RBMI Group of Institutions, Bareilly &bull; Library Management System v1.0 &bull; Session
        2026-27
      </div>
    </footer>
  );
}
