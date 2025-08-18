"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { PokemonGrid } from "../components/PokemonGrid";
import { filterPokemon } from "../lib/filterPokemon";
import { Loader } from "../components/Loader";
import { SearchBar } from "../components/SearchBar";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TYPE_OPTIONS } from "../lib/styles";
import { generationFromId } from "../lib/generationFromId";
import { GENERATION_OPTIONS } from "../lib/utils";
import type {
  PokemonBasic,
  EvolutionEntry,
  PokemonListResponse,
  PokemonEvolutionEntryResponse,
} from "../types/pokemon";

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
    const data = (await res.json()) as PokemonListResponse;
    return data.items;
  } catch (err) {
    // Centraliza el error para el componente principal
    throw new Error((err as Error).message || "Error desconocido");
  }
}

async function fetchSearch(query: string): Promise<EvolutionEntry[]> {
  if (!query.trim()) return [];
  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Error en buscador");
  const data = (await res.json()) as PokemonEvolutionEntryResponse;
  return data.items;
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
            void Promise.resolve(loadPage()).finally(() => {
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
    void (async () => {
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
    return filterPokemon(
      items,
      debouncedQuery,
      typeFilter,
      genFilter,
      generationFromId,
    );
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
              Sin resultados para &quot;{debouncedQuery}&quot;
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
          <Loader
            loading={loading}
            hasMore={hasMore}
            onLoadMore={() => void loadPage()}
          />
        </div>
      </section>
    </main>
  );
}