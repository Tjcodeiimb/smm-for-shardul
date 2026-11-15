import type { NextConfig } from "next";

// v2 removed or merged these pages (docs/v2/UPCREATE_V2_HANDOFF.md, section 4.2).
// Old bookmarks land on the page that replaced them.
const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/library", destination: "/content", permanent: false },
      { source: "/carousel-library", destination: "/content?format=carousel", permanent: false },
      { source: "/prompts", destination: "/studio", permanent: false },
      { source: "/scripts", destination: "/studio", permanent: false },
      { source: "/improve", destination: "/studio", permanent: false },
      { source: "/hooks", destination: "/studio", permanent: false },
      { source: "/carousels", destination: "/studio?format=carousel", permanent: false },
      { source: "/funnel", destination: "/research/playbook", permanent: false },
      { source: "/media", destination: "/dashboard", permanent: false },
      { source: "/publish", destination: "/dashboard", permanent: false },
    ];
  },
};

export default nextConfig;
