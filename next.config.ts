import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Eliminamos el bloque de eslint para evitar el error de "Unrecognized key"
};

export default nextConfig;