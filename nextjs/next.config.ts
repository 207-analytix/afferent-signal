import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Cloudflare Pages deployment
  // Outputs a static-compatible build that Cloudflare can serve at the edge
  output: "standalone",

  // Image optimization — use unoptimized for Cloudflare Pages free tier
  // (Cloudflare Image Resizing requires paid plan)
  images: {
    unoptimized: true,
  },

  // Trailing slash for consistent Cloudflare routing
  trailingSlash: false,

  // Environment variables exposed to the browser (non-secret)
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  },

  // Headers for security — prevent /ops from being indexed or framed
  async headers() {
    return [
      {
        source: "/ops/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
