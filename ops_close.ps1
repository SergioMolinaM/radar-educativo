param(
  [string]$SlepOperativo = "slep_barrancas",
  [int]$Year = 2025,
  [int]$Month = 4,
  [string]$DbPath = "radar_edu.duckdb"
)

$ErrorActionPreference = "Stop"
$env:PYTHONPATH = (Get-Location).Path

Write-Host "== 1) Ingesta operativa (PILOTO) ==" -ForegroundColor Cyan
python -m scripts.ingestion.run_operative_ingestion --slep $SlepOperativo --year $Year --month $Month

Write-Host "== 2) Export outputs ==" -ForegroundColor Cyan
New-Item -ItemType Directory -Force .\outputs | Out-Null

@"
import duckdb
import pandas as pd
from pathlib import Path

con = duckdb.connect("$DbPath")

tables = con.sql("""
select table_schema, table_name
from information_schema.tables
where table_schema in ('staging','analytics')
order by 1,2
""").df()
tables.to_csv("outputs/01_tablas_disponibles.csv", index=False)

rows = []
for _, r in tables.iterrows():
    schema, table = r["table_schema"], r["table_name"]
    cnt = con.sql(f'SELECT COUNT(*) FROM "{schema}"."{table}"').fetchone()[0]
    rows.append((schema, table, cnt))
pd.DataFrame(rows, columns=["schema","table","rows"]).to_csv("outputs/02_conteo_tablas.csv", index=False)

sample = con.sql('SELECT * FROM analytics.vh_radar_integral LIMIT 200').df()
sample.to_csv("outputs/03_sample_vh_radar_integral.csv", index=False)

print("OK outputs")
print(Path("outputs").resolve())
"@ | python

Write-Host "== 3) Resumen final ==" -ForegroundColor Cyan
Get-ChildItem .\outputs\ | Select-Object Name,Length,LastWriteTime
