export const TYPE_COLORS: Record<string, string> = {
  bug: "bg-lime-500 text-white",
  dark: "bg-gray-800 text-white",
  dragon: "bg-indigo-600 text-white",
  electric: "bg-yellow-400 text-black",
  fairy: "bg-pink-400 text-white",
  fighting: "bg-red-700 text-white",
  fire: "bg-orange-500 text-white",
  flying: "bg-sky-400 text-white",
  ghost: "bg-purple-700 text-white",
  grass: "bg-green-500 text-white",
  ground: "bg-amber-700 text-white",
  ice: "bg-cyan-300 text-black",
  normal: "bg-gray-400 text-black",
  poison: "bg-purple-500 text-white",
  psychic: "bg-pink-500 text-white",
  rock: "bg-yellow-700 text-white",
  steel: "bg-slate-400 text-black",
  water: "bg-blue-500 text-white",
};

export function generationFromId(id: number): string {
  if (id >= 1 && id <= 151) return "generation-i";
  if (id <= 251) return "generation-ii";
  if (id <= 386) return "generation-iii";
  if (id <= 493) return "generation-iv";
  if (id <= 649) return "generation-v";
  if (id <= 721) return "generation-vi";
  if (id <= 809) return "generation-vii";
  if (id <= 898) return "generation-viii";
  return "generation-ix";
}