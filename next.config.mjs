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
        source: "/:path*",
        has: [{ type: "host", value: "ktltc.vercel.app" }],
        destination: "https://ktltc.ac.th/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "ktltc.site" }],
        destination: "https://ktltc.ac.th/:path*",
        permanent: true,
      },
    ];
  },

  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const isVercel = process.env.VERCEL === "1" || process.env.NEXT_PUBLIC_VERCEL_ENV !== undefined;
    
    // Proxy only if on Vercel and NEXT_PUBLIC_API_URL is configured to the tunnel (different from main domain)
    const shouldProxy = isVercel && apiUrl && apiUrl !== "https://ktltc.ac.th" && apiUrl !== "https://ktltc.site";

    if (shouldProxy) {
      return [
        {
          source: "/uploads/:path*",
          destination: `${apiUrl}/api/media/uploads/:path*`,
        },
        {
          source: "/attendance_photos/:path*",
          destination: `${apiUrl}/api/media/attendance_photos/:path*`,
        },
        {
          source: "/images/:path*",
          destination: `${apiUrl}/api/media/images/:path*`,
        },
        {
          source: "/pdf/:path*",
          destination: `${apiUrl}/api/media/pdf/:path*`,
        },
        {
          source: "/ktltc_drive/:path*",
          destination: `${apiUrl}/api/media/ktltc_drive/:path*`,
        },
        {
          source: "/api/:path*",
          destination: `${apiUrl}/api/:path*`,
        },
      ];
    }

    // Default local behavior
    return [
      {
        source: "/uploads/:path*",
        destination: "/api/media/uploads/:path*",
      },
      {
        source: "/attendance_photos/:path*",
        destination: "/api/media/attendance_photos/:path*",
      },
      {
        source: "/images/:path*",
        destination: "/api/media/images/:path*",
      },
      {
        source: "/pdf/:path*",
        destination: "/api/media/pdf/:path*",
      },
      {
        source: "/ktltc_drive/:path*",
        destination: "/api/media/ktltc_drive/:path*",
      },
    ];
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "500mb",
      allowedOrigins: ["ktltc.ac.th", "ktltc.site", "localhost:3000"],
    },
  },
  outputFileTracingExcludes: {
    "*": ["public/images/**/*", "public/pdf/**/*", "public/uploads/**/*"],
  },

  serverExternalPackages: ["sharp", "mongodb", "tesseract.js"],

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
      {
        protocol: "https",
        hostname: "ui-avatars.com",
        pathname: "/**",
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  turbopack: {
    // ระบุให้ Turbopack ข้ามการจัดการโฟลเดอร์เหล่านี้ในส่วนของ Dev/Build
    rules: {
      "*.{png,jpg,jpeg,gif,webp,pdf,docx,xlsx}": {
        // อาจไม่จำเป็นถ้าคุณจัดการผ่าน /api/media อยู่แล้ว
      },
    },
  },

  compress: true,
  devIndicators: {
    appIsrStatus: false,
  },
};

export default withPWA(nextConfig);
