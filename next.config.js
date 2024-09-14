/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['sharp', 'onnxruntime-node'],
  },
  env: {
    REPLICATE_API_TOKEN: process.env.REPLICATE_API_TOKEN,
  },
}

// Load the API token from .env.local
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

console.log('REPLICATE_API_TOKEN in next.config.js:', process.env.REPLICATE_API_TOKEN ? 'Set' : 'Not set');

module.exports = nextConfig