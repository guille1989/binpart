import { NextResponse } from "next/server";
import { getPokemonFull } from "../../../../lib/pokeapi";

/**
 * API Route handler para obtener el detalle completo de un Pokémon por ID.
 *
 * @param _req - Request HTTP entrante (no se usa en este caso)
 * @param params - Objeto con los parámetros dinámicos de la ruta (id), es una Promise en Next.js 15+
 * @returns JSON con el detalle del Pokémon o error 500 si falla
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Espera a que params esté resuelto antes de acceder a id
  const { id } = await params;

  try {
    // Obtiene el detalle completo del Pokémon usando la función de la librería
    const p = await getPokemonFull(id);
    // Devuelve la respuesta en formato JSON con status 200
    return NextResponse.json(p, { status: 200 });
  } catch (err) {
    // Si ocurre un error, devuelve un mensaje y status 500
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}