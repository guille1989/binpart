/**
 * Opciones de generación disponibles para filtros y selects en la UI.
 */
export const GENERATION_OPTIONS = [
  "generation-i",
  "generation-ii",
  "generation-iii",
  "generation-iv",
  "generation-v",
  "generation-vi",
  "generation-vii",
  "generation-viii",
  "generation-ix",
];

/**
 * Rangos de IDs por generación, usados para filtrar especies en la PokéAPI.
 * Ajusta los valores si la PokéAPI agrega nuevas generaciones.
 */
export const GEN_RANGES: Record<string, { min: number; max: number }> = {
  "generation-i": { min: 1, max: 151 },
  "generation-ii": { min: 152, max: 251 },
  "generation-iii": { min: 252, max: 386 },
  "generation-iv": { min: 387, max: 493 },
  "generation-v": { min: 494, max: 649 },
  "generation-vi": { min: 650, max: 721 },
  "generation-vii": { min: 722, max: 809 },
  "generation-viii": { min: 810, max: 898 },
  "generation-ix": { min: 899, max: 1025 }, // ajusta si crece la PokéAPI
};

/**
 * Configuración para rutas dinámicas en Next.js (App Router).
 * - dynamic: fuerza el modo dinámico para endpoints que dependen de parámetros.
 * - revalidate: desactiva la revalidación automática (0 = siempre dinámico).
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;