import { getPokemonFull } from "../../../lib/pokeapi";
import { PokemonDetail } from "../../../components/PokemonDetail";
import { BackButton } from "../../../components/BackButton";

export default async function PokemonPage({ params }: { params: { id: string } }) {
  const p = await getPokemonFull(params.id);
  return (
    <main className="max-w-5xl mx-auto p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="text-gray-500 text-sm">Detalle del Pokémon</div>
        <BackButton />
      </div>
      <PokemonDetail p={p} />
    </main>
  );
}