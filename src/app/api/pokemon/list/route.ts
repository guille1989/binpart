import { NextResponse } from "next/server";
import { getPokemonSpeciesPageGQL } from "../../../../lib/pokeapi-gql";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit") ?? 36);
    const offset = Number(searchParams.get("offset") ?? 0);
    const gen = searchParams.get("gen") || undefined;

    const { items, total } = await getPokemonSpeciesPageGQL(limit, offset, gen);

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
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}
