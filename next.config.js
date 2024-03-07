/** @type {import('next').NextConfig} */
module.exports = {
  webpack(config) {

    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '**'
      }
    ]
  }
}
