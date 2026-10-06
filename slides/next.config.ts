import type { NextConfig } from "next";
import path from "node:path";

const config: NextConfig = {
  devIndicators: false,
  transpilePackages: ["@course/sandbox"],
  turbopack: { root: path.resolve(import.meta.dirname, "..") },
};
export default config;
