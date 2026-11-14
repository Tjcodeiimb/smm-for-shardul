"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { findArea } from "./nav-config";

// The one level of sub-tabs inside an area (e.g. Calendar: Month / Week / ...).
export default function SectionTabs() {
  const pathname = usePathname();
  const found = findArea(pathname);
  if (!found?.area.tabs) return null;

  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
      <div className="inline-flex max-w-full overflow-x-auto rounded-full bg-card p-1">
        {found.area.tabs.map((t) => {
          const active = t.href === pathname;
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`shrink-0 rounded-full px-5 py-2 text-sm transition-colors ${active ? "bg-surface font-medium" : "text-muted hover:text-foreground"}`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>
      <span className="text-sm text-muted">{found.tab?.description}</span>
    </div>
  );
}
