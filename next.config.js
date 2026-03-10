/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Public API endpoints — used by SDK/third-party integrations
        source: '/api/(compress|decompress)',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, x-api-key' },
        ],
      },
      {
        // Sensitive endpoints — same-origin only (session cookie auth)
        source: '/api/(keys|billing|auth|usage|analytics)/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://tokenshrink.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
