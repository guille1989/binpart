PokeDesk — Next.js + TypeScript (T3 mínimo)

Pokédex con listado, filtros (tipo y generación), buscador en tiempo real (incluye evoluciones) y detalle con imagen, tipos, stats y cadena de evoluciones.
Optimizada para la PokéAPI con GraphQL (1 llamada por página) y fallback REST.

🚀 Arranque rápido
# 1) Instalar dependencias
npm install

# 2) Desarrollo

# Pokédex Binpart

Proyecto web realizado con Next.js y TypeScript para explorar y buscar Pokémon usando la PokeAPI y su endpoint GraphQL. Incluye paginación, filtros por tipo y generación, buscador con evoluciones y diseño responsivo.

## Características

- Listado de Pokémon con paginación e infinite scroll
- Filtros por tipo y generación
- Buscador en tiempo real (incluye evoluciones)
- Detalle de cada Pokémon con stats, tipos y evoluciones
- UI responsiva y moderna con Tailwind CSS
- API propia en `/api/pokemon/list` y `/api/search`
- Separación de componentes reutilizables

## Instalación

```bash
npm install
```

## Desarrollo local

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Despliegue en Vercel

```bash
npm install -g vercel
vercel login
vercel
```

## Estructura principal

```
src/
  app/
    page.tsx           // Página principal
    api/               // Endpoints API
  components/          // Componentes UI
  lib/                 // Utilidades y lógica de datos
  styles/              // Estilos globales
```

## Variables de entorno
Si necesitas variables de entorno, agrégalas en `.env.local`.

## Contribuir
1. Haz un fork del repositorio
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Haz tus cambios y commitea
4. Haz push y abre un Pull Request

## Licencia
MIT