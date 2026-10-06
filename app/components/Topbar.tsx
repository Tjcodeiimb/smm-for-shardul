"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/auth-actions";
import { Icon } from "./Icons";
import SettingsModal from "./SettingsModal";
import CommandPalette, { SearchButton } from "./CommandPalette";
import HelpMenu from "./HelpMenu";
import { HIDDEN_CHROME, findItem } from "./nav-config";

function useClickOutside(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onClose]);
  return ref;
}

const iconBtn = "relative grid place-items-center h-10 w-10 rounded-full text-foreground hover:bg-foreground/5";
const panel = "animate-pop absolute right-0 top-12 z-50 rounded-[18px] border border-border/10 bg-surface p-2";

export default function Topbar({ userEmail = "" }: { userEmail?: string }) {
  const pathname = usePathname();
  const [menu, setMenu] = useState<null | "profile">(null);
  const [dark, setDark] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const ref = useClickOutside(() => setMenu(null));

  useEffect(() => {
    const t = setTimeout(() => setDark(document.documentElement.dataset.theme === "dark"), 0);
    return () => clearTimeout(t);
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    try {
      localStorage.setItem("upcreate_theme", next ? "dark" : "light");
    } catch {}
  }

  if (HIDDEN_CHROME.includes(pathname)) return null;

  const found = findItem(pathname);
  const group = found?.group;
  const item = found?.item;
  const initial = (userEmail || "U").slice(0, 1).toUpperCase();

  return (
    <>
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 bg-background/90 backdrop-blur px-4 md:px-10 h-16 border-b border-border/10">
      <div className="pl-12 md:pl-0 text-sm text-muted truncate">
        {group && (
          <>
            {group.title} <span className="mx-1.5">/</span>
            <span className={found?.tab ? "" : "text-foreground"}>{item?.label}</span>
            {found?.tab && (<><span className="mx-1.5">/</span><span className="text-foreground">{found.tab.label}</span></>)}
          </>
        )}
        {pathname === "/settings" && <span className="text-foreground">Settings</span>}
      </div>

      <div className="flex-1 flex justify-center">
        <SearchButton onOpen={() => setSearchOpen(true)} />
      </div>

      <div ref={ref} className="flex items-center gap-1">
        <button className={`${iconBtn} lg:hidden`} aria-label="Search" onClick={() => setSearchOpen(true)}>
          <Icon name="search" />
        </button>

        <HelpMenu />

        <button className={iconBtn} aria-label="Toggle dark mode" onClick={toggleTheme}>
          <span key={dark ? "sun" : "moon"} className="animate-pop grid place-items-center"><Icon name={dark ? "sun" : "moon"} /></span>
        </button>

        <button onClick={() => setSettingsOpen(true)} className={iconBtn} aria-label="Settings">
          <Icon name="settings" />
        </button>

        <div className="relative ml-2">
          <button
            onClick={() => setMenu(menu === "profile" ? null : "profile")}
            className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-foreground/5"
            aria-label="Profile"
          >
            <span className="grid place-items-center h-8 w-8 rounded-full bg-accent text-accent-deep text-sm font-medium">{initial}</span>
            <span className="hidden sm:block text-sm font-medium truncate max-w-32">{userEmail || "Account"}</span>
            <Icon name="chevron" size={14} className="text-muted" />
          </button>
          {menu === "profile" && (
            <div className={`${panel} w-60`}>
              <div className="px-3 py-2.5 border-b border-border/10 mb-1">
                <div className="text-xs text-muted truncate">{userEmail}</div>
              </div>
              <Link href="/brand" onClick={() => setMenu(null)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm hover:bg-foreground/5">
                <Icon name="user" size={16} /> Brand profile
              </Link>
              <button onClick={() => { setMenu(null); setSettingsOpen(true); }} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm hover:bg-foreground/5">
                <Icon name="settings" size={16} /> Settings
              </button>
              <form action={logoutAction}>
                <button className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm hover:bg-foreground/5">
                  <Icon name="logout" size={16} /> Log out
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
    {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} userEmail={userEmail} />}
    <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
