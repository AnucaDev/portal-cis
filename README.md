# CIS2026 - Portal Web y API

Proyecto web del Centro de Intervencion Psicoeducativa con frontend estatico y API en Node.js/Express.

## Ejecucion

- Iniciar API: `npm start`
- Modo desarrollo: `npm run dev`
- Entry point API: `api/server.js`

## Archivos criticos en raiz

- `package.json`
- `package-lock.json`
- `railway.toml`
- `cis_madrid.sql`
- `.env.example`
- `.gitignore`

## Estructura organizada

- `api/`: backend, scripts de inicializacion de BD
- `html/`, `css/`, `js/`, `imagenes/`: frontend
- `docs/`: documentacion funcional, guias e incidencias
- `scripts/`: utilidades de mantenimiento y generacion
- `tests/`: pruebas/manual tests auxiliares
- `private/`: archivos sensibles locales (ignorado por Git)

## Deploy Railway

- Start command: `node api/server.js`
- Post deploy: `bash api/init-db.sh`
- Healthcheck: `/health`
