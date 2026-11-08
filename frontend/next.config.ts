import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A static site: `npm run build` writes `out/`, which any static host serves (drag it onto Netlify).
  // Everything the app needs runs in the browser: it reads the treasury and signs with the wallet.
  output: "export",
  // Each route becomes a folder with its own index.html, so a plain static host needs no rewrites.
  trailingSlash: true,
};

export default nextConfig;