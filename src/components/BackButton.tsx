"use client";

/**
 * Botón para volver a la página anterior en la navegación.
 *
 * Si hay historial, navega hacia atrás. Si no, redirige a la página principal.
 *
 * @returns JSX con el botón estilizado.
 */
export function BackButton() {
  return (
    <button
      // Si hay historial, vuelve atrás; si no, va a la home
      onClick={() => (history.length > 1 ? history.back() : (location.href = "/"))}
      className="text-sm px-3 py-2 rounded-lg border hover:bg-gray-50"
    >
      ← Volver
    </button>
  );
}