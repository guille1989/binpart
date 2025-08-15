import type { PokemonBasic } from "../lib/pokeapi";

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
