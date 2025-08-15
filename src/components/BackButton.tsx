"use client";
export function BackButton() {
  return (
    <button
      onClick={() => (history.length > 1 ? history.back() : (location.href = "/"))}
      className="text-sm px-3 py-2 rounded-lg border hover:bg-gray-50"
    >
      ← Volver
    </button>
  );
}