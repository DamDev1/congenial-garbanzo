import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: false, // Temporarily enabled for local PWA testing
});

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {},
};

export default withSerwist(nextConfig);
