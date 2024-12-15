module.exports = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'utfs.io',
          port: "",
          pathname: '/**',
        },
      ],
    },
  };
  