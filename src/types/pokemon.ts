/**
 * Representa el tipo de un Pokémon (ej: agua, fuego, etc.)
 * slot: posición del tipo (primario/secundario)
 * type: objeto con nombre y URL del tipo
 */
export type PokemonType = {
  slot: number;
  type: { name: string; url: string };
};

/**
 * Datos básicos de un Pokémon para listados y vistas rápidas.
 * Incluye id, nombre, sprite, tipos y flags opcionales de mítico/legendario.
 */
export type PokemonBasic = {
  id: number;
  name: string;
  sprite: string;
  types: PokemonType[];
  isMythical?: boolean; // opcional, si es mítico
  isLegendary?: boolean; // opcional, si es legendario
};

export type PokemonListResponse = { items: PokemonBasic[] };

/**
 * Entrada de evolución para mostrar la cadena evolutiva de un Pokémon.
 * isCurrent indica si corresponde al Pokémon actual.
 */
export type EvolutionEntry = {
  id: number;
  name: string;
  sprite: string;
  isCurrent: boolean;
};

export type PokemonEvolutionEntryResponse = { items: EvolutionEntry[] };

/**
 * Respuesta genérica de una consulta GraphQL.
 */
export type GraphQLResp<T> = { data?: T; errors?: Array<{ message: string }> };

/**
 * Item básico de listado de la PokéAPI (nombre y URL).
 */
export type PokeAPIListItem = { name: string; url: string };

/**
 * Estadística de un Pokémon (ej: ataque, defensa, velocidad).
 */
export type PokemonStat = {
  base_stat: number;
  effort: number;
  stat: { name: string; url: string };
};

/**
 * Datos completos de un Pokémon, extendiendo los básicos.
 * Incluye generación, stats, evoluciones, ratio de captura y flags de mítico/legendario.
 */
export type PokemonFull = PokemonBasic & {
  generation: string; // e.g. "generation-i"
  stats: PokemonStat[];
  evolutions: EvolutionEntry[];
  captureRate: number;
  isMythical: boolean; // true si es un Pokémon mítico
  isLegendary: boolean; // true si es un Pokémon legendario
};

/**
 * Props para el componente Loader (carga e infinito scroll).
 */
export type LoaderProps = {
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
};

/**
 * Props para el componente PokemonGrid (grilla de Pokémon).
 */
export type PokemonGridProps = {
  items: PokemonBasic[];
};

/**
 * Props para el componente SearchBar (buscador y filtros).
 */
export type SearchBarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  genFilter: string;
  onGenFilterChange: (value: string) => void;
  typeOptions: string[];
  generationOptions: string[];
};

export type EvolutionNode = {
  species: { name: string; url: string };
  evolves_to: EvolutionNode[];
};
