import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d3v53265btnfty.cloudfront.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "arziplus.s3.eu-north-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "arziplus.storage.c2.liara.space",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "arziplus.storage.c2.liara.site",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "storadge.arziplus.com",
        pathname: "/**",
      },
    
    ],
  },
};

export default nextConfig;
