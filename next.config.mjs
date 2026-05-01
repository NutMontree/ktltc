import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'ktltc.vercel.app' }],
        destination: 'https://ktltc.ac.th/:path*',
        permanent: true,
      },
    ]
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  outputFileTracingExcludes: {
    "*": ["public/images/**/*", "public/pdf/**/*", "public/uploads/**/*"],
  },

  serverExternalPackages: ["sharp", "mongodb"],

  images: {
    unoptimized: false,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ktltcv1.vercel.app",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ktltcv2.vercel.app",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ktltcv3.vercel.app",
        pathname: "/**",
      },
    ],
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  turbopack: {},

  compress: true,
  devIndicators: {
    appIsrStatus: false,
  },
};

export default withPWA(nextConfig);
