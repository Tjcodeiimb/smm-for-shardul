// v2 navigation (docs/v2/UPCREATE_V2_HANDOFF.md, section 4): four areas and
// nothing else. Each area may have one level of sub-tabs; each tab keeps its
// own route. Home (/dashboard) is reached from the logo; Settings and Profile
// sit behind the account avatar.

export type Tab = { href: string; label: string; description: string };
export type Area = { href: string; label: string; description: string; tabs?: Tab[] };

export const AREAS: Area[] = [
  {
    href: "/research",
    label: "Research",
    description: "Collect ideas, verify facts, and keep the playbook.",
    tabs: [
      { href: "/research", label: "Ideas", description: "Capture ideas and score them" },
      { href: "/research/references", label: "References", description: "Outliers from other creators and what to borrow" },
      { href: "/research/playbook", label: "Playbook", description: "The rules your scripts follow" },
    ],
  },
  {
    href: "/scripts",
    label: "Studio",
    description: "Write a hook, a script or a carousel.",
    tabs: [
      { href: "/scripts", label: "Write", description: "Write a new script" },
      { href: "/improve", label: "Improve", description: "Diagnose and tighten a saved script" },
      { href: "/hooks", label: "Hooks", description: "Generate and save hooks" },
      { href: "/carousels", label: "Carousel", description: "Write a carousel slide by slide" },
    ],
  },
  { href: "/content", label: "Content", description: "Every script and carousel you have." },
  {
    href: "/calendar",
    label: "Calendar",
    description: "Plan, track to posted, and log how it did.",
    tabs: [
      { href: "/calendar", label: "Month", description: "Schedule pieces on dates" },
      { href: "/pipeline", label: "Week", description: "Move pieces through each status" },
      { href: "/production", label: "Shoot", description: "Shot lists for a recording session" },
      { href: "/analytics", label: "Posts", description: "Log how each post performed" },
      { href: "/insights", label: "Review", description: "What is working across your posts" },
    ],
  },
];

export function findArea(pathname: string) {
  for (const area of AREAS) {
    const tab = area.tabs?.find((t) => t.href === pathname);
    if (tab || area.href === pathname) return { area, tab: tab ?? null };
  }
  return null;
}

export const HIDDEN_CHROME = ["/login", "/signup", "/onboarding", "/forgot-password"];
