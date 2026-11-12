import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // El build de Unity sale comprimido con brotli. Sin estas cabeceras el
  // navegador recibe los bytes crudos y el loader no los sabe leer.
  async headers() {
    const brotli = (tipo: string) => [
      { key: "Content-Encoding", value: "br" },
      { key: "Content-Type", value: tipo },
    ];

    return [
      {
        source: "/avatar/Build/:archivo*.data.br",
        headers: brotli("application/octet-stream"),
      },
      {
        source: "/avatar/Build/:archivo*.framework.js.br",
        headers: brotli("application/javascript"),
      },
      {
        source: "/avatar/Build/:archivo*.wasm.br",
        headers: brotli("application/wasm"),
      },
    ];
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
