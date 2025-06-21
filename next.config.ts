import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 开发模式优化
  experimental: {
    // 减少开发模式下的错误
    optimizePackageImports: ['@radix-ui/react-select', '@radix-ui/react-dialog', '@radix-ui/react-popover'],
    // 优化 React 渲染
    optimizeCss: true,
  },
  // 减少开发模式下的警告
  onDemandEntries: {
    // 减少内存使用
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // 开发模式配置
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },
  // 减少开发模式下的错误
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // 在开发模式下忽略某些错误
      config.ignoreWarnings = [
        /Failed to execute 'removeChild' on 'Node'/,
        /The node to be removed is not a child of this node/,
      ];
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'image.pollinations.ai',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
