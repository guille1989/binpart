import Link from "next/link";
import type { PokemonBasic } from "../lib/pokeapi";
import { TYPE_COLORS, generationFromId } from "../lib/styles";

interface PokemonGridProps {
  items: PokemonBasic[];
}

export function PokemonGrid({ items }: PokemonGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((p) => (
        <Link
          key={p.id}
          href={`/pokemon/${p.id}`}
          className="flex flex-col rounded-2xl border p-3 transition hover:shadow"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs text-gray-500">#{p.id}</span>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] capitalize">
              {generationFromId(p.id)}
            </span>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={p.sprite}
            alt={p.name}
            className="mt-2 h-32 w-full object-contain"
          />
          <div className="mt-2 font-semibold capitalize">{p.name}</div>
          <div className="mt-1 flex flex-wrap gap-1">
            {p.types.map((t) => {
              const typeName = t.type.name;
              return (
                <span
                  key={typeName}
                  className={`rounded-full px-2 py-0.5 text-xs capitalize ${TYPE_COLORS[typeName] ?? "bg-gray-200 text-black"}`}
                >
                  {typeName}
                </span>
              );
            })}
          </div>
        </Link>
      ))}
    </div>
  );
}
