/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // TypeScript errors are checked in CI via `tsc --noEmit` separately.
    // Skipping here prevents one-at-a-time blocking during Vercel builds.
    ignoreBuildErrors: true,
  },
  eslint: {
    // ESLint runs via lint-staged on commit; skip during build to avoid duplicates.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
