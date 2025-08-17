/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */

const config = {
  // ...otras opciones
  allowedDevOrigins: ["http://192.168.0.14:3000"], // agrega aquí las IPs/clientes permitidos
};

export default config;
