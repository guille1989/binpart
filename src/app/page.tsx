// src/app/page.tsx
"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { PokemonGrid } from "../components/PokemonGrid";
import { filterPokemon } from "../lib/filterPokemon";
import { Loader } from "../components/Loader";
import { SearchBar } from "../components/SearchBar";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// --- Tipos mínimos que esperamos del endpoint /api/pokemon/list
// (coinciden con PokemonBasic en src/lib/pokeapi.ts)
type PokemonType = { slot: number; type: { name: string; url: string } };
export type PokemonBasic = {
  id: number;
  name: string;
  sprite: string;
  types: PokemonType[];
  isMythical?: boolean; // opcional, si es mítico
  isLegendary?: boolean; // opcional, si es legendario
};

// Para el buscador que incluye evoluciones
export type EvolutionEntry = {
  id: number;
  name: string;
  sprite: string;
  isCurrent: boolean;
};

// --- Utilidades ---
const TYPE_OPTIONS = [
  "bug",
  "dark",
  "dragon",
  "electric",
  "fairy",
  "fighting",
  "fire",
  "flying",
  "ghost",
  "grass",
  "ground",
  "ice",
  "normal",
  "poison",
  "psychic",
  "rock",
  "steel",
  "water",
];

// Colores base por tipo (usa Tailwind classes)
export const TYPE_COLORS: Record<string, string> = {
  bug: "bg-lime-500 text-white",
  dark: "bg-gray-800 text-white",
  dragon: "bg-indigo-600 text-white",
  electric: "bg-yellow-400 text-black",
  fairy: "bg-pink-400 text-white",
  fighting: "bg-red-700 text-white",
  fire: "bg-orange-500 text-white",
  flying: "bg-sky-400 text-white",
  ghost: "bg-purple-700 text-white",
  grass: "bg-green-500 text-white",
  ground: "bg-amber-700 text-white",
  ice: "bg-cyan-300 text-black",
  normal: "bg-gray-400 text-black",
  poison: "bg-purple-500 text-white",
  psychic: "bg-pink-500 text-white",
  rock: "bg-yellow-700 text-white",
  steel: "bg-slate-400 text-black",
  water: "bg-blue-500 text-white",
};

// Mapeo simple por rango de id -> generación (no pide llamadas extra)
function generationFromId(id: number): string {
  if (id >= 1 && id <= 151) return "generation-i";
  if (id <= 251) return "generation-ii";
  if (id <= 386) return "generation-iii";
  if (id <= 493) return "generation-iv";
  if (id <= 649) return "generation-v";
  if (id <= 721) return "generation-vi";
  if (id <= 809) return "generation-vii";
  if (id <= 898) return "generation-viii";
  // Ajusta si necesitas para nuevas gens de PokeAPI
  return "generation-ix";
}

const GENERATION_OPTIONS = [
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

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function useDebounced<T>(value: T, delay = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

// --- Fetchers ---
async function fetchPage(
  limit: number,
  offset: number,
  gen?: string,
): Promise<PokemonBasic[]> {
  const url = `/api/pokemon/list?limit=${limit}&offset=${offset}${gen ? `&gen=${encodeURIComponent(gen)}` : ""}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Error al cargar listado");
    const data = await res.json();
    return data.items as PokemonBasic[];
  } catch (err) {
    // Centraliza el error para el componente principal
    throw new Error((err as Error).message || "Error desconocido");
  }
}

async function fetchSearch(query: string): Promise<EvolutionEntry[]> {
  if (!query.trim()) return [];
  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Error en buscador");
  const data = await res.json();
  return data.items as EvolutionEntry[];
}

// --- Componente principal ---
export default function HomePage() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Estado derivado de la URL (para que se mantenga al volver de los detalles)
  const [query, setQuery] = useState<string>(searchParams.get("q") ?? "");
  const [typeFilter, setTypeFilter] = useState<string>(
    searchParams.get("type") ?? "",
  );
  const [genFilter, setGenFilter] = useState<string>(
    searchParams.get("gen") ?? "",
  );

  // Debounce para el input
  const debouncedQuery = useDebounced(query, 300);

  // Sincroniza el estado -> URL (sin recargar)
  useEffect(() => {
    const sp = new URLSearchParams(searchParams);
    if (query) sp.set("q", query);
    else sp.delete("q");
    if (typeFilter) sp.set("type", typeFilter);
    else sp.delete("type");
    if (genFilter) sp.set("gen", genFilter);
    else sp.delete("gen");
    router.replace(`${pathname}?${sp.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, typeFilter, genFilter]);

  // Datos del listado con infinite scroll
  const [items, setItems] = useState<PokemonBasic[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Resetear cuando cambie el filtro de tipo o generación (el back mantiene estado)
  useEffect(() => {
    setItems([]);
    setOffset(0);
    setHasMore(true);
  }, [typeFilter, genFilter]);

  // Carga de página
  const LIMIT = 60;
  const loadPage = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const page = await fetchPage(LIMIT, offset, genFilter || undefined);
      setItems((prev) => {
        const merged = [...prev, ...page];
        // dedupe por si acaso
        const seen = new Set<number>();
        return merged.filter((p) => (seen.has(p.id) ? false : seen.add(p.id)));
      });
      setOffset((o) => o + page.length);
      if (page.length < LIMIT) setHasMore(false);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [LIMIT, offset, loading, hasMore]);

  useEffect(() => {
    // cargar primera página si no hay nada
    if (items.length === 0 && hasMore && !loading) {
      void loadPage();
    }
  }, [items.length, hasMore, loading, loadPage]);

  // IntersectionObserver para infinite scroll
  const loaderRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;

    let pending = false;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !pending) {
            pending = true;
            Promise.resolve(loadPage()).finally(() => {
              pending = false;
            });
          }
        });
      },
      { rootMargin: "600px 0px 600px 0px", threshold: 0 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [loadPage]);

  // Buscador (incluye evoluciones)
  const [searchResults, setSearchResults] = useState<EvolutionEntry[]>([]);
  useEffect(() => {
    let active = true;
    (async () => {
      if (!debouncedQuery) {
        setSearchResults([]);
        return;
      }
      try {
        const res = await fetchSearch(debouncedQuery);
        if (active) setSearchResults(res);
      } catch (_) {
        if (active) setSearchResults([]);
      }
    })();
    return () => {
      active = false;
    };
  }, [debouncedQuery]);

  // Filtro en memoria por tipo y generación
  const visibleItems = useMemo(() => {
    return filterPokemon(items, debouncedQuery, typeFilter, genFilter, generationFromId);
  }, [items, debouncedQuery, typeFilter, genFilter]);

  return (
    <main className="mx-auto max-w-6xl p-6">
      {error && (
        <div className="mb-4 rounded bg-red-100 px-4 py-2 text-red-700">
          Error: {error}
        </div>
      )}
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pokédex</h1>
          <p className="text-sm text-gray-500">
            Listado por ID con filtros y buscador en tiempo real.
          </p>
        </div>
        <SearchBar
          query={query}
          onQueryChange={setQuery}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          genFilter={genFilter}
          onGenFilterChange={setGenFilter}
          typeOptions={TYPE_OPTIONS}
          generationOptions={GENERATION_OPTIONS}
        />
      </header>

      {/* Sugerencias del buscador que incluye evoluciones */}
      {debouncedQuery && (
        <section className="mt-4">
          <h2 className="mb-2 text-sm font-semibold text-gray-600">
            Coincidencias y evoluciones
          </h2>
          {searchResults.length === 0 ? (
            <div className="text-sm text-gray-500">
              Sin resultados para "{debouncedQuery}"
            </div>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {searchResults.map((evo) => (
                <Link
                  key={evo.id}
                  href={`/pokemon/${evo.id}`}
                  className="flex min-w-[96px] flex-col items-center rounded-xl border p-2 hover:shadow"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={evo.sprite}
                    alt={evo.name}
                    className="h-16 w-16 object-contain"
                  />
                  <span className="mt-1 text-xs capitalize">{evo.name}</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Grid del listado */}
      <section className="mt-6">
  <PokemonGrid items={visibleItems} />

        {/* Loader / sentinel para infinite scroll */}
        <div ref={loaderRef}>
          <Loader loading={loading} hasMore={hasMore} onLoadMore={() => void loadPage()} />
        </div>
      </section>
    </main>
  );
}

/* ---
  NOTA IMPORTANTE
  Este componente asume que tienes el endpoint /api/pokemon/list del paso anterior.
  Si aún no lo tienes, créalo tal y como te pasé:
  - src/app/api/pokemon/list/route.ts -> devuelve { items: PokemonBasic[], ... }

  Además, para el buscador que incluye evoluciones, añade este endpoint sencillo:
  - src/app/api/search/route.ts
--- */

// src/app/api/search/route.ts
import { NextResponse } from "next/server";
import { searchPokemonIncludingEvolutions } from "../lib/pokeapi";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") ?? "").trim();
    if (!q) return NextResponse.json({ items: [] }, { status: 200 });
    const items = await searchPokemonIncludingEvolutions(q);
    return NextResponse.json({ items }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}
