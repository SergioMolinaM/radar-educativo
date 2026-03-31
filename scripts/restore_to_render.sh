#!/bin/bash
# =============================================================
# Restaurar datos a PostgreSQL de Render
# =============================================================
# USO:
#   1. En Render Dashboard > tu DB > Connection > External Connection String
#   2. Copia la URL y reemplaza abajo
#   3. Ejecuta: bash scripts/restore_to_render.sh
# =============================================================

RENDER_DB_URL="${1:-YOUR_RENDER_DATABASE_URL_HERE}"

if [ "$RENDER_DB_URL" = "YOUR_RENDER_DATABASE_URL_HERE" ]; then
  echo "ERROR: Pasa la URL de la DB de Render como argumento"
  echo "Uso: bash scripts/restore_to_render.sh 'postgresql://user:pass@host:port/dbname'"
  exit 1
fi

echo "==> Creando schema analytics..."
psql "$RENDER_DB_URL" -c "CREATE SCHEMA IF NOT EXISTS analytics;"

echo "==> Restaurando dump (6.9MB, 20 tablas)..."
pg_restore --no-owner --no-privileges --clean --if-exists \
  -d "$RENDER_DB_URL" \
  radar_edu_render.dump

echo "==> Verificando tablas..."
psql "$RENDER_DB_URL" -c "
  SELECT schemaname, tablename,
         pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
  FROM pg_tables
  WHERE schemaname IN ('public','analytics')
  ORDER BY schemaname, tablename;
"

echo "==> Listo! Base de datos restaurada."
