const isGitHubPages = process.env.GITHUB_PAGES === "true";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  ...(isGitHubPages ? {
    output: "export",
    basePath: "/Clover",
    assetPrefix: "/Clover/",
    trailingSlash: true,
    images: { unoptimized: true }
  } : {})
};

export default nextConfig;
