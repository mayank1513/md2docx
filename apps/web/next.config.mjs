import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  typescript: {
    // When deploying on Vercel, package DTS generation is skipped for fast builds;
    // full typechecking is handled in CI and local verification.
    ignoreBuildErrors: Boolean(process.env.VERCEL),
  },
};

export default withMDX(config);
