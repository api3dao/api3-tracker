/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    concurrentFeatures: false, // <- Turn this option to false for tailwindcss
    serverComponents: true,
  },
};

module.exports = nextConfig;
