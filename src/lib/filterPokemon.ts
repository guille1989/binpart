import type { PokemonBasic } from "../types/pokemon";

/**
 * Filtra una lista de Pokémon según nombre, tipo y generación.
 * @param items Lista de Pokémon básicos
 * @param query Texto de búsqueda por nombre
 * @param typeFilter Filtro por tipo de Pokémon
 * @param genFilter Filtro por generación (ej: 'generation-i')
 * @param generationFromId Función que determina la generación a partir del id
 * @returns Lista filtrada de Pokémon
 */
export function filterPokemon(
  items: PokemonBasic[],
  query: string,
  typeFilter: string,
  genFilter: string,
  generationFromId: (id: number) => string
): PokemonBasic[] {
  const byQuery = query
    ? items.filter((p) => p.name.includes(query.toLowerCase()))
    : items;

  const byType = typeFilter
    ? byQuery.filter((p) => p.types.some((t) => t.type.name === typeFilter))
    : byQuery;

  const byGen = genFilter
    ? byType.filter((p) => generationFromId(p.id) === genFilter)
    : byType;

  return byGen;
}
