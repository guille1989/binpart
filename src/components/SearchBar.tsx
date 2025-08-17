import React from "react";
import type { SearchBarProps } from "../types/pokemon"; 

/**
 * SearchBar muestra el buscador y los filtros de tipo y generación.
 *
 * - Permite buscar Pokémon por nombre (incluye evoluciones).
 * - Permite filtrar por tipo y generación usando selects.
 * - Llama a las funciones de cambio de estado recibidas por props.
 *
 * @param query - Texto de búsqueda actual.
 * @param onQueryChange - Función para actualizar el texto de búsqueda.
 * @param typeFilter - Filtro de tipo seleccionado.
 * @param onTypeFilterChange - Función para actualizar el filtro de tipo.
 * @param genFilter - Filtro de generación seleccionado.
 * @param onGenFilterChange - Función para actualizar el filtro de generación.
 * @param typeOptions - Opciones de tipo disponibles.
 * @param generationOptions - Opciones de generación disponibles.
 * @returns JSX con el buscador y los filtros.
 */
export function SearchBar({
  query,
  onQueryChange,
  typeFilter,
  onTypeFilterChange,
  genFilter,
  onGenFilterChange,
  typeOptions,
  generationOptions,
}: SearchBarProps) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center">
      {/* Input para buscar por nombre */}
      <input
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Buscar por nombre... (incluye evoluciones)"
        className="w-full rounded-xl border px-3 py-2 md:w-72"
      />
      {/* Select para filtrar por tipo */}
      <select
        value={typeFilter}
        onChange={(e) => onTypeFilterChange(e.target.value)}
        className="rounded-xl border px-3 py-2"
      >
        <option value="">Tipo: todos</option>
        {typeOptions.map((t) => (
          <option key={t} value={t} className="capitalize">
            {t}
          </option>
        ))}
      </select>
      {/* Select para filtrar por generación */}
      <select
        value={genFilter}
        onChange={(e) => onGenFilterChange(e.target.value)}
        className="rounded-xl border px-3 py-2"
      >
        <option value="">Generación: todas</option>
        {generationOptions.map((g) => (
          <option key={g} value={g} className="capitalize">
            {g}
          </option>
        ))}
      </select>
    </div>
  );
}
