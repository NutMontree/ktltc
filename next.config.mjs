import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
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

  async redirects() {
    return [
      {
        source: "/:path*",
        destination: "https://ktltc.site/:path*",
        permanent: true,
      },
    ];
  },
};

export default withPWA(nextConfig);
