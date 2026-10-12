/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["geist"],
  // Lets a verification build/serve (NEXT_DIST_DIR=.next-verify) run beside a
  // live `next dev` without the two overwriting each other's output in .next
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
