/** @type {import('next').NextConfig} */
const nextConfig = {
    // Helps catch potential issues in development
    reactStrictMode: true,
  
    // Proxy any request starting with /apiProxy to the Express backend
    async rewrites() {
      return [
        {
          source: '/apiProxy/:path*',
          destination: 'http://localhost:3001/api/:path*', // backend URL
        },
      ];
    },
  };
  
  export default nextConfig;
  