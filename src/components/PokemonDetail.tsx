import Link from "next/link";
import type { PokemonFull } from "../lib/pokeapi";
import { TYPE_COLORS, generationFromId } from "../lib/styles";

export function PokemonDetail({ p }: { p: PokemonFull }) {
  console.log("Rendering PokemonDetail for:", p.name);
  return (
    <section className="mt-2">
      <header>
        <h1 className="text-3xl font-bold capitalize">
          {p.name} <span className="font-normal text-gray-400">#{p.id}</span>
        </h1>
        <div className="mt-1 text-sm text-gray-500">
          Generación:{" "}
          <span className="capitalize">
            {p.generation || generationFromId(p.id)}
          </span>
        </div>
      </header>

  <section className="flex flex-col md:flex-row items-center justify-center gap-6">
  <section className="flex flex-col items-center w-full md:w-auto">
          {/* Imagen principal */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={p.sprite}
            alt={p.name}
            className="mt-4 w-full max-w-xs h-auto object-contain"
          />

          {/* Tipos */}
          <section className="mt-4">
            <h2 className="text-lg font-semibold">Tipos</h2>
            <div className="mt-2 flex gap-2">
              {p.types.map((t) => (
                <span
                  key={t.type.name}
                  className={`rounded-full px-3 py-1 text-xs capitalize ${
                    TYPE_COLORS[t.type.name] ?? "bg-gray-200 text-black"
                  }`}
                >
                  {t.type.name}
                </span>
              ))}
              {p.isLegendary && (
                <span className="rounded-full px-3 py-1 text-xs capitalize bg-yellow-200 text-black">
                  legendary
                </span>
              )}
              {p.isMythical && (
                <span className="rounded-full px-3 py-1 text-xs capitalize bg-pink-200 text-black">
                  mythical
                </span>
              )}
            </div>
          </section>
        </section>

        {/* Stats */}
  <section className="mt-6 md:ml-6 flex flex-col items-center w-full md:w-auto">
          <h2 className="text-lg font-semibold">Stats</h2>
          <ul className="mt-2 w-100 space-y-2">
            {p.stats.map((s) => {
              const value = s.base_stat;
              const pct = Math.min(1, value / 180); // barra hasta 180 aprox.
              return (
                <li key={s.stat.name} className="flex items-center gap-3">
                  <div className="w-32 text-sm text-gray-600 capitalize">
                    {s.stat.name}
                  </div>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${pct * 100}%` }}
                    />
                  </div>
                  <div className="w-10 text-right text-sm text-gray-600">
                    {value}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </section>
      {/* Evoluciones */}
  <section className="mt-8">
        <h2 className="text-lg font-semibold">Evoluciones</h2>
        {p.evolutions.length === 0 ? (
          <div className="mt-2 text-sm text-gray-500">
            Este Pokémon no tiene evoluciones.
          </div>
        ) : (
          <div className="mt-3 flex flex-wrap gap-4 overflow-x-auto">
            {p.evolutions.map((evo) => (
              <Link
                key={evo.id}
                href={`/pokemon/${evo.id}`}
                className={`flex flex-col items-center rounded-xl border p-2 transition hover:shadow ${
                  evo.isCurrent ? "ring-2 ring-blue-500" : ""
                }`}
                title={evo.name}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={evo.sprite}
                  alt={evo.name}
                  className="h-24 w-24 object-contain"
                />
                <span className="mt-1 text-sm capitalize">{evo.name}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
