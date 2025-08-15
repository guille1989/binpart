import { NextResponse } from "next/server";
import { getPokemonFull } from "../../../../lib/pokeapi";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await getPokemonFull(params.id);
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}