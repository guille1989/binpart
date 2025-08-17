import { NextResponse } from "next/server";
import { searchPokemonIncludingEvolutions } from "../../../lib/pokeapi";

/**
 * API Route handler para buscar Pokémon por nombre, incluyendo evoluciones.
 *
 * Query param:
 * - q: texto de búsqueda (nombre o parte del nombre)
 *
 * Responde con JSON que incluye las coincidencias y evoluciones.
 */
export async function GET(req: Request) {
  try {
    // Extrae el parámetro de búsqueda 'q' de la URL
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") ?? "").trim();
    // Si no hay texto de búsqueda, responde con lista vacía
    if (!q) return NextResponse.json({ items: [] }, { status: 200 });
    // Busca Pokémon y evoluciones que coincidan con el texto
    const items = await searchPokemonIncludingEvolutions(q);
    // Devuelve la respuesta en formato JSON con status 200
    return NextResponse.json({ items }, { status: 200 });
  } catch (err) {
    // Si ocurre un error, responde con status 500 y el mensaje
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}