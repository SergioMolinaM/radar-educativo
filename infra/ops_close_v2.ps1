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
import duckdb, pandas as pd
from pathlib import Path
from datetime import datetime

con = duckdb.connect("$DbPath")

tables = con.sql("""
select table_schema, table_name
from information_schema.tables
where table_schema in ('staging','analytics')
order by 1,2
""").df()
tables.to_csv("outputs/01_tablas_disponibles.csv", index=False)

rows=[]
for _,r in tables.iterrows():
    c = con.sql(f'SELECT COUNT(*) FROM "{r.table_schema}"."{r.table_name}"').fetchone()[0]
    rows.append((r.table_schema, r.table_name, c))
counts = pd.DataFrame(rows, columns=["schema","table","rows"])
counts.to_csv("outputs/02_conteo_tablas.csv", index=False)

sample = con.sql("SELECT * FROM analytics.vh_radar_integral LIMIT 200").df()
sample.to_csv("outputs/03_sample_vh_radar_integral.csv", index=False)

# Dictamen
has_analytics = ((counts["schema"]=="analytics") & (counts["rows"]>0)).any()
has_staging = ((counts["schema"]=="staging") & (counts["rows"]>0)).any()
status = "GO" if (has_analytics and has_staging) else "BLOQUEADO"

msg = f"""Estado: {status}
Fecha: {datetime.now().isoformat(timespec='seconds')}
Criterios:
- staging con datos: {has_staging}
- analytics con datos: {has_analytics}
Nota: financiero real sigue pendiente por codigo_organismo real.
"""
Path("outputs/04_status_hoy.txt").write_text(msg, encoding="utf-8")
print(msg)
"@ | python

Write-Host "== 3) Evidencia final ==" -ForegroundColor Cyan
Get-ChildItem .\outputs\ | Select-Object Name,Length,LastWriteTime
Write-Host "== 4) Dictamen ==" -ForegroundColor Cyan
Get-Content .\outputs\04_status_hoy.txt
