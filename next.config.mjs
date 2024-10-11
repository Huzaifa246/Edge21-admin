/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'export',
    images: {
        domains: ['lh3.googleusercontent.com'],
        remotePatterns: [
            {
              protocol: "https",
              hostname: "firebasestorage.googleapis.com",
              pathname: "/**",
            },
          ],
    },
};

export default nextConfig;