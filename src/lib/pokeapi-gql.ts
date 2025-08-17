import type { PokemonBasic, GraphQLResp } from "../types/pokemon";
import { GEN_RANGES } from "../lib/utils";

const GQL_ENDPOINT =
  process.env.NEXT_PUBLIC_GQL_ENDPOINT ??
  "https://beta.pokeapi.co/graphql/v1beta";
const OFFICIAL_ARTWORK_BASE =
  process.env.NEXT_PUBLIC_OFFICIAL_ARTWORK_BASE ??
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/";
const officialArtwork = (id: number) => `${OFFICIAL_ARTWORK_BASE}${id}.png`;

async function postGQL<T>(query: string, variables: Record<string, unknown>) {
  const res = await fetch(GQL_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });
  const json = (await res.json()) as GraphQLResp<T>;
  if (!res.ok) throw new Error(`GraphQL HTTP ${res.status}`);
  if (json.errors?.length)
    throw new Error(
      `GraphQL: ${json.errors.map((e) => e.message).join(" | ")}`,
    );
  if (!json.data) throw new Error("GraphQL: respuesta sin data");
  return json.data as T;
}

/** Página de ESPECIES con tipos del Pokémon default + total; acepta gen opcional */
export async function getPokemonSpeciesPageGQL(
  limit = 36,
  offset = 0,
  gen?: string,
): Promise<{ items: PokemonBasic[]; total: number }> {
  const range = gen ? GEN_RANGES[gen] : undefined;
  const whereObj = range
    ? `where: { id: { _gte: ${range.min}, _lte: ${range.max} } }`
    : "";
  const whereAgg = whereObj ? `(${whereObj})` : "";
  const whereArg = whereObj ? `, ${whereObj}` : "";

  const query = /* GraphQL */ `
    query P($limit:Int!, $offset:Int!){
      species: pokemon_v2_pokemonspecies(limit:$limit, offset:$offset, order_by:{id: asc}${whereArg}){
        id
        name
        pokemon_v2_pokemons(where:{is_default:{_eq:true}}){
          pokemon_v2_pokemontypes(order_by:{slot: asc}){ slot pokemon_v2_type{ name } }
        }
      }
      total: pokemon_v2_pokemonspecies_aggregate${whereAgg}{ aggregate{ count } }
    }
  `;

  const data = await postGQL<{
    species: Array<{
      id: number;
      name: string;
      pokemon_v2_pokemons: Array<{
        pokemon_v2_pokemontypes: Array<{
          slot: number;
          pokemon_v2_type: { name: string };
        }>;
      }>;
    }>;
    total: { aggregate: { count: number } };
  }>(query, { limit, offset });

  const items: PokemonBasic[] = data.species.map((s) => ({
    id: s.id,
    name: s.name,
    sprite: officialArtwork(s.id),
    types: (s.pokemon_v2_pokemons?.[0]?.pokemon_v2_pokemontypes ?? []).map(
      (t) => ({
        slot: t.slot,
        type: { name: t.pokemon_v2_type.name, url: "" },
      }),
    ),
  }));

  return { items, total: data.total.aggregate.count };
}

/** Wrapper anterior por compatibilidad */
export async function getPokemonListGQL(limit = 36, offset = 0) {
  const { items } = await getPokemonSpeciesPageGQL(limit, offset);
  return items;
}
