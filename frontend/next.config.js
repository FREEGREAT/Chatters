/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  output: 'standalone',
  
  poweredByHeader: false,
  compress: true,
  
  images: {
    domains: ['localhost'],
    unoptimized: process.env.NODE_ENV === 'development',
  },
}

module.exports = nextConfig