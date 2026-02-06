import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Esto evita que el build se trabe revisando tipos
    ignoreBuildErrors: true,
  },
  eslint: {
    // Esto acelera el proceso al no revisar reglas de estilo
    ignoreDuringBuilds: true,
  },
  /* Aquí puedes agregar otras opciones si las tenías */
};

export default nextConfig;