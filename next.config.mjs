import { withSerwist } from "@serwist/turbopack";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
};

export default withSerwist(nextConfig);
