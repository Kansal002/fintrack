import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static build (HTML/CSS/JS in `out/`) — deployable to any static host.
  output: "export",
  // Emit `/dashboard/index.html` so every route resolves on any static server.
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
