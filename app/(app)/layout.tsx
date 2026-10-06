import type { Metadata } from "next";
import "@fontsource/geist/400.css";
import "@fontsource/geist/500.css";
import "@fontsource/geist/600.css";
import "@fontsource/geist/700.css";
import "../globals.css";
import { sql } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { getBrand } from "@/lib/brand";
import Nav from "@/app/components/Nav";
import Topbar from "@/app/components/Topbar";
import HelpBubble from "@/app/components/HelpBubble";
import SectionTabs from "@/app/components/SectionTabs";
import { TourProvider } from "@/app/components/Tour";

export const metadata: Metadata = {
  title: "Upcreate",
  description: "The Instagram/short-form content operating system: calendar, hooks, scripts, research, and prompts, all in one place.",
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Pages under this group that require auth already call requireUserId()
  // themselves (and proxy.ts gates them at the edge); this just needs
  // best-effort identity for the chrome (brand name, account email) and
  // renders fine with blanks when signed out (login/signup/onboarding).
  const userId = await getCurrentUserId();
  let brandName = "";
  let brandHandle = "";
  let userEmail = "";
  if (userId !== null) {
    const [brand, [user]] = await Promise.all([
      getBrand(userId),
      sql<{ email: string }[]>`SELECT email FROM users WHERE id = ${userId}`,
    ]);
    brandName = brand.nameField || brand.handle;
    brandHandle = brand.handle;
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
      <body className="min-h-full flex flex-col md:flex-row bg-background text-foreground">
        <TourProvider>
          <Nav brandName={brandName} brandHandle={brandHandle} />
          <div className="flex-1 min-w-0 flex flex-col">
            <Topbar userEmail={userEmail} />
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:px-10 md:py-10">
              <SectionTabs />
              {children}
            </main>
          </div>
          <HelpBubble />
        </TourProvider>
      </body>
    </html>
  );
}
