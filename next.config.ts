import type { NextConfig } from "next";

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com https://accounts.google.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' blob: data: https://images.unsplash.com https://*.supabase.co https://*.googleusercontent.com;
  font-src 'self' data: https://fonts.gstatic.com;
  connect-src 'self' https://*.supabase.co wss://*.supabase.co https://accounts.google.com https://api.stripe.com https://api.razorpay.com;
  frame-src 'self' https://accounts.google.com https://api.stripe.com https://checkout.razorpay.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
`.replace(/\s{2,}/g, ' ').trim();

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: cspHeader,
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(self)",
  },
];

const nextConfig: NextConfig = {
  experimental: {
    agentUpgrade: "security",
  },
  // Disable X-Powered-By header
  poweredByHeader: false,

  // Disable client source maps in production build
  productionBrowserSourceMaps: false,

  // Security headers applied to all routes
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

  // Image domains for external luxury jewelry photo hosts
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
};

export default nextConfig;
