import type { Metadata } from "next";
import "@fontsource/geist/400.css";
import "@fontsource/geist/500.css";
import "@fontsource/geist/600.css";
import "@fontsource/geist/700.css";
import "../globals.css";
import { sql } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import AppNav from "@/app/components/AppNav";
import SectionTabs from "@/app/components/SectionTabs";

export const metadata: Metadata = {
  title: "Upcreate",
  description: "Research, write, plan and learn from short videos: Research, Studio, Content and Calendar.",
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Pages that need auth call requireUserId() themselves (and proxy.ts gates
  // them); this only needs best-effort identity for the account menu.
  const userId = await getCurrentUserId();
  let userEmail = "";
  if (userId !== null) {
    const [user] = await sql<{ email: string }[]>`SELECT email FROM users WHERE id = ${userId}`;
    userEmail = user?.email ?? "";
  }

  return (
    <html lang="en" suppressHydrationWarning className="h-full antialiased">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem("upcreate_theme")==="dark")document.documentElement.dataset.theme="dark"}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AppNav userEmail={userEmail} />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 pt-8 pb-28 md:px-10 md:py-10">
          <SectionTabs />
          {children}
        </main>
      </body>
    </html>
  );
}
