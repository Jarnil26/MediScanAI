/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/health',
        destination: 'http://localhost:8000/health/', // Django's health check endpoint
      },
    ];
  },
};

export default nextConfig;
