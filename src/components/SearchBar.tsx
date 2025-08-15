import React from "react";

interface SearchBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  genFilter: string;
  onGenFilterChange: (value: string) => void;
  typeOptions: string[];
  generationOptions: string[];
}

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
      <input
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Buscar por nombre... (incluye evoluciones)"
        className="w-full rounded-xl border px-3 py-2 md:w-72"
      />
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
