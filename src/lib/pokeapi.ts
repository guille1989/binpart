// src/lib/pokeapi.ts
type PokeAPIListItem = { name: string; url: string };

export type PokemonType = { slot: number; type: { name: string; url: string } };

export type PokemonStat = {
  base_stat: number;
  effort: number;
  stat: { name: string; url: string };
};

export type PokemonBasic = {
  id: number;
  name: string;
  sprite: string;
  types: PokemonType[];
};

export type EvolutionEntry = {
  id: number;
  name: string;
  sprite: string;
  isCurrent: boolean;
};

export type PokemonFull = PokemonBasic & {
  generation: string; // e.g. "generation-i"
  stats: PokemonStat[];
  evolutions: EvolutionEntry[];
  captureRate: number;
  isMythical: boolean; // true si es un Pokémon mítico
  isLegendary: boolean; // true si es un Pokémon legendario
};

const BASE = "https://pokeapi.co/api/v2";

const officialArtwork = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

const getIdFromUrl = (url: string) => {
  // URLs suelen terminar con ".../pokemon-species/25/" -> extraemos "25"
  const parts = url.split("/").filter(Boolean);
  return Number(parts[parts.length - 1]);
};

// Revisar
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
 * Lista de Pokémon (paginada). Devuelve sólo id, name y sprite para pintar rápido.
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
      console.log(detail)
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
 * Datos completos de un Pokémon por id o nombre:
 * - name, id, sprite
 * - tipos, stats
 * - generación
 * - evoluciones (toda la cadena, marcando el actual)
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
 * Búsqueda por texto que incluya evoluciones:
 * devuelve ids/nombres que coinciden o que son evoluciones de la coincidencia.
 * (Estrategia simple: resolvemos la cadena de evolución de cada match)
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
