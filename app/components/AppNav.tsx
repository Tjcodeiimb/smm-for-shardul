"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/auth-actions";
import { Icon, type IconName } from "./Icons";
import Logo from "./Logo";
import { AREAS, HIDDEN_CHROME, findArea } from "./nav-config";

const AREA_ICONS: Record<string, IconName> = { Research: "search", Studio: "pen", Content: "layers", Calendar: "calendar" };

// v2 chrome: four tabs in a top bar on desktop, a bottom tab bar on mobile,
// and Settings / Profile / theme / log out behind the account avatar.
export default function AppNav({ userEmail = "" }: { userEmail?: string }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDark(document.documentElement.dataset.theme === "dark"), 0);
    function onDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", onDown);
    };
  }, []);

  if (HIDDEN_CHROME.includes(pathname)) return null;

  const active = findArea(pathname)?.area.label;
  const initial = (userEmail || "U").slice(0, 1).toUpperCase();

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    try {
      localStorage.setItem("upcreate_theme", next ? "dark" : "light");
    } catch {}
  }

  const item = "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm hover:bg-foreground/5";

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border/10 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 md:px-10">
          <Link href="/dashboard" aria-label="Home" className="shrink-0">
            <Logo size={26} />
          </Link>
          <nav className="hidden md:flex items-center gap-1" aria-label="Main">
            {AREAS.map((a) => (
              <Link
                key={a.label}
                href={a.href}
                className={`rounded-full px-4 py-2 text-sm transition-colors ${active === a.label ? "bg-accent font-medium text-accent-deep" : "text-muted hover:text-foreground"}`}
              >
                {a.label}
              </Link>
            ))}
          </nav>
          <div ref={menuRef} className="relative ml-auto">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Account"
              aria-expanded={menuOpen}
              className="grid h-9 w-9 place-items-center rounded-full bg-accent text-sm font-medium text-accent-deep"
            >
              {initial}
            </button>
            {menuOpen && (
              <div className="animate-pop absolute right-0 top-12 z-50 w-60 rounded-[18px] border border-border/10 bg-surface p-2">
                {userEmail && <div className="mb-1 truncate border-b border-border/10 px-3 py-2.5 text-xs text-muted">{userEmail}</div>}
                <Link href="/settings" onClick={() => setMenuOpen(false)} className={item}>
                  <Icon name="settings" size={16} /> Settings
                </Link>
                <Link href="/brand" onClick={() => setMenuOpen(false)} className={item}>
                  <Icon name="user" size={16} /> Profile
                </Link>
                <button onClick={toggleTheme} className={item}>
                  <Icon name={dark ? "sun" : "moon"} size={16} /> {dark ? "Light mode" : "Dark mode"}
                </button>
                <form action={logoutAction}>
                  <button className={item}>
                    <Icon name="logout" size={16} /> Log out
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </header>

      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-border/10 bg-background/95 backdrop-blur md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {AREAS.map((a) => (
          <Link
            key={a.label}
            href={a.href}
            className={`flex flex-col items-center gap-1 py-2.5 text-[11px] ${active === a.label ? "font-medium text-foreground" : "text-muted"}`}
          >
            <span className={`grid h-7 w-12 place-items-center rounded-full ${active === a.label ? "bg-accent text-accent-deep" : ""}`}>
              <Icon name={AREA_ICONS[a.label]} size={18} />
            </span>
            {a.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
