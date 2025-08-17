import type {
  PokeAPIListItem,
  PokemonFull,
  PokemonStat,
  PokemonBasic,
  EvolutionEntry,
  PokemonType,
} from "../types/pokemon";

// URL base de la PokéAPI, configurable por variable de entorno.
const BASE =
  process.env.NEXT_PUBLIC_POKEAPI_BASE ?? "https://pokeapi.co/api/v2";
// URL base para sprites oficiales de Pokémon, configurable por variable de entorno.
const OFFICIAL_ARTWORK_BASE =
  process.env.NEXT_PUBLIC_OFFICIAL_ARTWORK_BASE ??
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/";
// Devuelve la URL del sprite oficial de un Pokémon dado su id.
const officialArtwork = (id: number) => `${OFFICIAL_ARTWORK_BASE}${id}.png`;

// Extrae el id numérico de un Pokémon desde una URL de la PokéAPI.
const getIdFromUrl = (url: string) => {
  // URLs suelen terminar con ".../pokemon-species/25/" -> extraemos "25"
  const parts = url.split("/").filter(Boolean);
  return Number(parts[parts.length - 1]);
};

// Realiza una petición fetch y devuelve el JSON tipado.
// Incluye revalidación para caché en Next.js App Router.
async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    // Opcional: caché básica en servidor (Next.js App Router)
    next: { revalidate: 3 }, // revalida cada 3s
  });
  if (!res.ok) {
    throw new Error(`Fetch failed ${res.status}: ${url}`);
  }
  return res.json() as Promise<T>;
}

/**
 * Obtiene una lista paginada de Pokémon.
 * Devuelve sólo id, name, sprite y tipos para renderizado rápido.
 * @param limit Cantidad de Pokémon a traer
 * @param offset Offset para paginación
 */
export async function getPokemonList(
  limit = 1,
  offset = 0,
): Promise<PokemonBasic[]> {
  const list = await fetchJSON<{ results: PokeAPIListItem[] }>(
    `${BASE}/pokemon?limit=${limit}&offset=${offset}`,
  );
  // Traemos detalles en paralelo (tipos e id)
  const items = await Promise.all(
    list.results.map(async (it) => {
      const detail = await fetchJSON<{
        id: number;
        name: string;
        types: PokemonType[];
      }>(it.url);
      console.log(detail);
      return {
        id: detail.id,
        name: detail.name,
        sprite: officialArtwork(detail.id),
        types: detail.types,
      } satisfies PokemonBasic;
    }),
  );

  // Orden por id por defecto (por si acaso)
  return items.sort((a, b) => a.id - b.id);
}

/**
 * Obtiene los datos completos de un Pokémon por id o nombre.
 * Incluye: name, id, sprite, tipos, stats, generación y cadena de evoluciones.
 * @param idOrName Id numérico o nombre del Pokémon
 */
export async function getPokemonFull(
  idOrName: string | number,
): Promise<PokemonFull> {
  // 1) /pokemon: tipos + stats + id + name
  const pokemon = await fetchJSON<{
    id: number;
    name: string;
    types: PokemonType[];
    stats: PokemonStat[];
    species: { url: string };
  }>(`${BASE}/pokemon/${idOrName}`);

  // 2) /pokemon-species: generación + url de cadena de evolución
  const species = await fetchJSON<{
    generation: { name: string };
    evolution_chain: { url: string };
    capture_rate: number;
    is_mythical: boolean;
    is_legendary: boolean;
  }>(pokemon.species.url);

  // 3) /evolution-chain: recorrer cadena para obtener todos los nombres/ids
  const evo = await fetchJSON<{
    chain: {
      species: { name: string; url: string };
      evolves_to: any[];
    };
  }>(species.evolution_chain.url);

  const flatEvolutionNames: string[] = [];
  (function walk(node: any) {
    if (!node) return;
    flatEvolutionNames.push(node.species.name);
    (node.evolves_to || []).forEach(walk);
  })(evo.chain);

  // Mapear a entradas con id + sprite
  const evolutions: EvolutionEntry[] = flatEvolutionNames.map((name) => {
    // Podemos derivar el id desde la URL de species (más preciso)
    // Para eso, buscamos el nodo en la cadena:
    const findNode = (n: any): string | null => {
      if (n.species.name === name) return n.species.url;
      for (const child of n.evolves_to || []) {
        const url = findNode(child);
        if (url) return url;
      }
      return null;
    };
    const speciesUrl = findNode(evo.chain);
    const id = speciesUrl ? getIdFromUrl(speciesUrl) : -1;
    return {
      id,
      name,
      sprite: id > 0 ? officialArtwork(id) : "",
      isCurrent: name === pokemon.name,
    };
  });

  return {
    id: pokemon.id,
    name: pokemon.name,
    sprite: officialArtwork(pokemon.id),
    types: pokemon.types,
    stats: pokemon.stats,
    generation: species.generation?.name ?? "unknown",
    evolutions,
    captureRate: species.capture_rate,
    isMythical: species.is_mythical,
    isLegendary: species.is_legendary,
  };
}

/**
 * Realiza una búsqueda por texto que incluya evoluciones.
 * Devuelve ids/nombres que coinciden o que son evoluciones de la coincidencia.
 * Estrategia: resuelve la cadena de evolución de cada match y deduplica resultados.
 * @param query Texto de búsqueda
 */
export async function searchPokemonIncludingEvolutions(
  query: string,
): Promise<EvolutionEntry[]> {
  if (!query.trim()) return [];

  // Sugerencias del endpoint /pokemon-species?limit=... -> filtrar por nombre
  // Nota: PokéAPI no tiene búsqueda fuzzy; aquí hacemos "includes".
  const all = await fetchJSON<{ results: PokeAPIListItem[] }>(
    `${BASE}/pokemon-species?limit=2000`,
  );
  const matches = all.results.filter((r) =>
    r.name.includes(query.toLowerCase()),
  );

  // Expandir a TODA la cadena de evolución por cada match y deduplicar
  const byName = new Map<string, EvolutionEntry>();

  await Promise.all(
    matches.map(async (m) => {
      const sp = await fetchJSON<{ evolution_chain: { url: string } }>(m.url);
      const chain = await fetchJSON<{ chain: any }>(sp.evolution_chain.url);

      const collect: EvolutionEntry[] = [];
      (function walk(node: any) {
        if (!node) return;
        const name = node.species.name;
        const id = getIdFromUrl(node.species.url);
        collect.push({
          id,
          name,
          sprite: officialArtwork(id),
          isCurrent: false,
        });
        (node.evolves_to || []).forEach(walk);
      })(chain.chain);

      collect.forEach((e) => byName.set(e.name, e));
    }),
  );

  return Array.from(byName.values()).sort((a, b) => a.id - b.id);
}
