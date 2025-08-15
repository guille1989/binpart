import React from "react";

interface LoaderProps {
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export function Loader({ loading, hasMore, onLoadMore }: LoaderProps) {
  return (
    <div className="flex h-12 items-center justify-center">
      {loading && <span className="text-sm text-gray-500">Cargando…</span>}
      {hasMore && !loading && (
        <button
          onClick={onLoadMore}
          className="rounded border px-3 py-1 text-sm"
        >
          Cargar más
        </button>
      )}
      {!hasMore && (
        <span className="text-sm text-gray-400">No hay más Pokémon</span>
      )}
    </div>
  );
}
