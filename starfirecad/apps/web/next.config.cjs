/***** @type {import('next').NextConfig} *****/
const nextConfig = {
  reactStrictMode: true,
  experimental: { esmExternals: true },
  output: 'standalone'
};
module.exports = nextConfig;