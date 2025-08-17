// Mapeo de tipos de Pokémon a clases de Tailwind CSS para estilos de fondo y texto.
// Cada tipo tiene un color de fondo y color de texto asociado para mostrar etiquetas o chips.
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

// Lista de tipos de Pokémon disponibles en la Pokédex.
// Se utiliza para generar opciones de filtrado y validación de tipos.
export const TYPE_OPTIONS = [
  "bug",
  "dark",
  "dragon",
  "electric",
  "fairy",
  "fighting",
  "fire",
  "flying",
  "ghost",
  "grass",
  "ground",
  "ice",
  "normal",
  "poison",
  "psychic",
  "rock",
  "steel",
  "water",
];