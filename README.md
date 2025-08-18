PokeDesk — Next.js + TypeScript (T3 mínimo)

Pokédex con listado, filtros (tipo y generación), buscador en tiempo real (incluye evoluciones) y detalle con imagen, tipos, stats y cadena de evoluciones.
Optimizada para la PokéAPI con GraphQL (1 llamada por página) y fallback REST.

🚀 Arranque rápido
# 1) Instalar dependencias
npm install

# 2) Desarrollo
npm run dev
# → http://localhost:3000

# 3) Linter (opcional)
npm run lint

# 4) Producción
npm run build
npm start

Requisitos: Node 18+ y npm. No hace falta .env.

🗂️ Estructura principal
```text
src/
  app/
    layout.tsx                       # Layout global de la aplicación
    page.tsx                         # Página principal: listado + filtros + buscador + infinite scroll
    api/
      pokemon/
        list/
          route.ts                   # Endpoint listado (GraphQL + fallback REST, acepta ?gen)
        [id]/
          route.ts                   # Endpoint para detalle de Pokémon por id
      search/
        route.ts                     # Buscador por nombre (incluye evoluciones)
    pokemon/
      [id]/
        page.tsx                     # Página de detalle (Server Component)
  components/
    HomePageClient.tsx               # Página principal: listado + filtros + buscador + infinite scroll
    BackButton.tsx                   # Botón para volver atrás en la navegación
    PokemonDetail.tsx                # Muestra el detalle de un Pokémon (imagen, tipos, stats, evoluciones)
    PokemonGrid.tsx                  # Grid responsivo para mostrar el listado de Pokémon
    Loader.tsx                       # Indicador de carga y botón para cargar más resultados
    SearchBar.tsx                    # Buscador y filtros (tipo, generación) en la UI principal
  lib/
    pokeapi.ts                       # REST: detalle y utilidades (stats, evoluciones, etc.)
    pokeapi-gql.ts                   # GraphQL: listado por especies (+ filtro gen)
    styles.ts                        # Colores por tipo y helper de generación
    filterPokemon.ts                 # Utilidad para filtrar listado
    generationFromId.ts              # Helper para obtener generación desde id
    utils.ts                         # Constantes y utilidades varias (rangos, opciones)
  styles/
    globals.css                      # Estilos globales Tailwind
  types/
    pokemon.ts                       # Tipos globales y modelos de datos
public/
  poke.png                        # Ícono de la app
```

## 🧱 Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS
- PokéAPI GraphQL ([beta.pokeapi.co/graphql/v1beta](https://beta.pokeapi.co/graphql/v1beta))
- Fallback REST si GraphQL falla (rate-limit/red)
- Sin DB, sin Auth, sin tRPC (T3 mínimo)

---

## ✨ Funcionalidades

- Listado paginado por especies (IDs ascendentes) con infinite scroll.
- Filtros:
  - Tipo (UI, filtrado en cliente).
  - Generación (servidor): el endpoint devuelve solo esa gen (`?gen=generation-iii`).
- Buscador en tiempo real por nombre que muestra coincidencias y evoluciones.
- Detalle: nombre, imagen (official-artwork), generación, tipos (con colores), stats (barras) y evoluciones (marca la actual).
- Mantiene estado del listado (filtros, búsqueda y scroll) al volver desde el detalle.

---

## 🔌 Endpoints (API interna)

### `GET /api/pokemon/list`
Listado paginado (GraphQL + fallback REST).

**Query params**
- `limit` (number, por defecto 60)
- `offset` (number, por defecto 0)
- `gen` (opcional: "generation-i" … "generation-ix")

**Ejemplos**
- # primera página (todas)
  curl "http://localhost:3000/api/pokemon/list?limit=60&offset=0"
- # segunda página (todas)
  curl "http://localhost:3000/api/pokemon/list?limit=60&offset=60"
- # primera página de Gen III
  curl "http://localhost:3000/api/pokemon/list?limit=60&offset=0&gen=generation-iii"

**Respuesta**
```json
{
  "items": [{ "id":1, "name":"bulbasaur", "sprite":"...", "types":[...] }],
  "limit": 60,
  "offset": 0,
  "total": 1010,
  "nextOffset": 60,
  "hasMore": true
}
```

---

## ⚙️ Rendimiento y decisiones
- GraphQL (especies): 1 query por página → evita N+1 de REST.
- Filtro de generación en backend: `src/lib/pokeapi-gql.ts` usa rangos de IDs por generación.
- Fallback REST: si GraphQL falla, el listado sigue funcionando (concurrencia limitada).
- Caché:
  - `route.ts` del listado es dinámico (`force-dynamic`) y respeta limit/offset/gen.
  - Respuestas con `Cache-Control: s-maxage=300, stale-while-revalidate=86400`.
  - Peticiones a GraphQL en `no-store` para evitar mezclar caches con filtros.

---

## 🧪 Checklist de pruebas
- Todas: http://localhost:3000/api/pokemon/list?limit=36&offset=0
- Gen II: http://localhost:3000/api/pokemon/list?limit=36&offset=0&gen=generation-ii
- UI: en `/`, elige una generación y luego “todas” → no debe dar 500 y recarga desde el inicio.
- Detalle: http://localhost:3000/pokemon/25

---

## 📦 Roadmap breve
- Filtro por tipo también en backend (GraphQL where por type.name).
- Colores oficiales por tipo y tarjetas mejoradas.
- Prefetch SSR del primer bloque del listado.
- SWR/React Query para caché y reintentos en cliente.

---

🔗 **Despliegue:**  
Este proyecto está desplegado en Vercel:  
[https://pokedeskbinpart.vercel.app](https://pokedeskbinpart.vercel.app/)

---