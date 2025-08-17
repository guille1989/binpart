import React from "react";
import type { LoaderProps } from "../types/pokemon";

/**
 * Loader muestra el estado de carga y el botón para cargar más resultados.
 *
 * - Si está cargando, muestra un mensaje.
 * - Si hay más resultados y no está cargando, muestra el botón "Cargar más".
 * - Si no hay más resultados, muestra un mensaje final.
 *
 * @param loading - Indica si se está cargando una página nueva.
 * @param hasMore - Indica si hay más resultados para cargar.
 * @param onLoadMore - Función que se ejecuta al hacer clic en "Cargar más".
 * @returns JSX con el loader y el botón.
 */
export function Loader({ loading, hasMore, onLoadMore }: LoaderProps) {
  return (
    <div className="flex h-12 items-center justify-center">
      {/* Muestra mensaje de carga si loading es true */}
      {loading && <span className="text-sm text-gray-500">Cargando…</span>}
      {/* Muestra botón si hay más resultados y no está cargando */}
      {hasMore && !loading && (
        <button
          onClick={onLoadMore}
          className="rounded border px-3 py-1 text-sm"
        >
          Cargar más
        </button>
      )}
      {/* Muestra mensaje final si no hay más resultados */}
      {!hasMore && (
        <span className="text-sm text-gray-400">No hay más Pokémon</span>
      )}
    </div>
  );
}
