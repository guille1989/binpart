/**
 * Determina la generación de Pokémon según su id nacional.
 * @param id Id nacional del Pokémon
 * @returns Nombre de la generación (generation-i, generation-ii, ...)
 */
export function generationFromId(id: number): string {
  // Generación I: 1-151
  if (id >= 1 && id <= 151) return "generation-i";
  // Generación II: 152-251
  if (id <= 251) return "generation-ii";
  // Generación III: 252-386
  if (id <= 386) return "generation-iii";
  // Generación IV: 387-493
  if (id <= 493) return "generation-iv";
  // Generación V: 494-649
  if (id <= 649) return "generation-v";
  // Generación VI: 650-721
  if (id <= 721) return "generation-vi";
  // Generación VII: 722-809
  if (id <= 809) return "generation-vii";
  // Generación VIII: 810-898
  if (id <= 898) return "generation-viii";
  // Generación IX: 899 en adelante
  return "generation-ix";
}