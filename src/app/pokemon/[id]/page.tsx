import { getPokemonFull } from "../../../lib/pokeapi";
import { PokemonDetail } from "../../../components/PokemonDetail";
import { BackButton } from "../../../components/BackButton";

/**
 * Página de detalle para un Pokémon específico.
 *
 * Obtiene el parámetro dinámico 'id' de la URL, busca el detalle completo
 * y lo muestra usando el componente PokemonDetail.
 *
 * @param params - Promise con los parámetros dinámicos de la ruta (id)
 * @returns JSX con la vista de detalle
 */
export default async function PokemonPage({ params }: { params: Promise<{ id: string }> }) {
  // Espera a que params esté resuelto antes de acceder a id
  const { id } = await params;
  // Obtiene el detalle completo del Pokémon por id
  const p = await getPokemonFull(id);
  // Renderiza la página de detalle con botón de volver y el componente principal
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