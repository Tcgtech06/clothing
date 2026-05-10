/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
      },
    ],
  },
  // Exclude functions folder from Next.js build (it's for Firebase Cloud Functions)
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'firebase-functions': 'commonjs firebase-functions',
        'firebase-admin': 'commonjs firebase-admin',
        'web-push': 'commonjs web-push',
      });
    }
    return config;
  },
};

export default nextConfig;
