/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["geist"],
  // Static export: the site is served from S3 behind CloudFront, so there is
  // no Next server at runtime and next/image can't resize on the fly
  output: "export",
  images: { unoptimized: true },
  // Lets a verification build/serve (NEXT_DIST_DIR=.next-verify) run beside a
  // live `next dev` without the two overwriting each other's output in .next
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
