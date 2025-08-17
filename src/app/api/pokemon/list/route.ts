import { NextResponse } from "next/server";
import { getPokemonSpeciesPageGQL } from "../../../../lib/pokeapi-gql";

/**
 * API Route handler para obtener el listado paginado de especies de Pokémon.
 *
 * Query params:
 * - limit: cantidad de resultados por página (default: 36)
 * - offset: desplazamiento para paginación (default: 0)
 * - gen: generación a filtrar (opcional)
 *
 * Responde con JSON que incluye items, paginación y metadatos.
 */
export async function GET(req: Request) {
  try {
    // Extrae los parámetros de búsqueda de la URL
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit") ?? 36); // cantidad por página
    const offset = Number(searchParams.get("offset") ?? 0); // desplazamiento
    const gen = searchParams.get("gen") || undefined; // generación (opcional)

    // Llama a la función que obtiene los datos desde GraphQL (o fallback REST)
    const { items, total } = await getPokemonSpeciesPageGQL(limit, offset, gen);

    // Devuelve la respuesta en formato JSON, incluye headers de caché para CDN
    return NextResponse.json(
      {
        items,
        limit,
        offset,
        total,
        nextOffset: offset + items.length,
        hasMore: offset + items.length < total,
      },
      {
        headers: {
          "Cache-Control": "s-maxage=300, stale-while-revalidate=86400",
        },
      },
    );
  } catch (err) {
    // Si ocurre un error, responde con status 500 y el mensaje
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}
