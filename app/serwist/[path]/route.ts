import { spawnSync } from "node:child_process";
import { createSerwistRoute } from "@serwist/turbopack";

const gitHash = spawnSync("git", ["rev-parse", "HEAD"], {
  encoding: "utf-8",
}).stdout?.trim();
const revision = gitHash || crypto.randomUUID();

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } =
  createSerwistRoute({
    additionalPrecacheEntries: [{ url: "/~offline", revision }],
    swSrc: "app/sw.ts",
    useNativeEsbuild: true,
  });
