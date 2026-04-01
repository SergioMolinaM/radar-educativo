$ErrorActionPreference = "Stop"
$env:PYTHONPATH = (Get-Location).Path

@"
import duckdb, pandas as pd
from pathlib import Path
from datetime import datetime

out = Path("outputs")
out.mkdir(exist_ok=True)

con = duckdb.connect("radar_edu.duckdb")
counts = con.sql("""
select table_schema as schema, table_name as table_name,
       (select count(*) from (select * from information_schema.tables t2
        where t2.table_schema=t.table_schema and t2.table_name=t.table_name)) as meta_ok
from information_schema.tables t
where table_schema in ('staging','analytics')
order by 1,2
""").df()

# Conteos reales por tabla
rows = []
for _, r in con.sql("""
select table_schema, table_name
from information_schema.tables
where table_schema in ('staging','analytics')
order by 1,2
""").df().iterrows():
    c = con.sql(f'SELECT COUNT(*) FROM "{r.table_schema}"."{r.table_name}"').fetchone()[0]
    rows.append((r.table_schema, r.table_name, c))

df = pd.DataFrame(rows, columns=["schema","table","rows"])
staging_rows = int(df.loc[df["schema"]=="staging","rows"].sum())
analytics_rows = int(df.loc[df["schema"]=="analytics","rows"].sum())
status = "GO_PILOTO" if (staging_rows>0 and analytics_rows>0) else "BLOQUEADO"

kpi = pd.DataFrame([{
    "run_at": datetime.now().isoformat(timespec="seconds"),
    "status": status,
    "staging_rows": staging_rows,
    "analytics_rows": analytics_rows,
    "total_tables": len(df)
}])

log_path = out / "09_kpi_history.csv"
if log_path.exists():
    old = pd.read_csv(log_path)
    kpi = pd.concat([old, kpi], ignore_index=True)

kpi.to_csv(log_path, index=False)
print(f"OK: {log_path}")
print(kpi.tail(5).to_string(index=False))
"@ | python
