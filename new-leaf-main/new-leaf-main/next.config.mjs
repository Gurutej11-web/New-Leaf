/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Don't fail production builds on lint errors (migration-era pragmatism)
    ignoreDuringBuilds: true,
  },
  images: {
    // We mostly use plain <img> with assets in /public; keep optimization off
    // to avoid surprises during the migration.
    unoptimized: true,
  },
};

export default nextConfig;
