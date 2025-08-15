import { NextResponse } from "next/server";
import { searchPokemonIncludingEvolutions } from "../../../lib/pokeapi";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") ?? "").trim();
    if (!q) return NextResponse.json({ items: [] }, { status: 200 });
    const items = await searchPokemonIncludingEvolutions(q);
    return NextResponse.json({ items }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}