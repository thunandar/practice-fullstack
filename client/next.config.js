/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: "export",
  experimental: {
    appDir: true,
  },
  images: {
    domains: ["162.0.214.189"],
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/images/**",
      },
      {
        protocol: "http",
        hostname: "s.gravatar.com",
        port: "80",
        pathname: "/images/**",
      },
      {
        protocol: "http",
        hostname: "162.0.214.189",
        port: "80",
        pathname: "/images/**",
      },
    ],
  },
  webpack: (config) => {
    config.ignoreWarnings = [
      { module: /node_modules\/node-fetch\/lib\/index\.js/ },
      { file: /node_modules\/node-fetch\/lib\/index\.js/ },
    ];

    return config;
  },
};

module.exports = nextConfig;
