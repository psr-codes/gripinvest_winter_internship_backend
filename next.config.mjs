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
    // Enable standalone output for Docker
    output: "standalone",
    // Configure static exports to avoid build errors
    experimental: {
        missingSuspenseWithCSRBailout: false,
    },
    // Skip static optimization for dynamic routes
    generateBuildId: async () => {
        return "build-" + Date.now();
    },
};

export default nextConfig;
