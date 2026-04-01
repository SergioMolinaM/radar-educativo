# Checklist: Primer Perfilado (Dataset Mineduc)

## 0. Preparación del Archivo
- [ ] Colocar el CSV fuente en: `data/raw/mineduc_directorio.csv`
- [ ] Asegurar que el nombre del archivo sea exactamente: `mineduc_directorio.csv`

## 1. Ejecución del Perfilado
Ejecutar el comando de análisis estructural:
```powershell
python scripts/main.py profile mineduc_directorio
```
*Si el archivo no existe, el sistema lanzará un error tipo `FileNotFoundError` indicando la ruta faltante.*

## 2. Verificación de Artefactos
- [ ] Confirmar creación del reporte en: `catalog/profile_reports/mineduc_directorio_profile.json`
- [ ] Abrir el JSON y verificar que la clave `columns` contenga los nombres fuente esperados:
    - `RBD`
    - `NOM_ESTAB`
    - `COD_COM_RBD`
    - `COD_REG_ALU` (Atención: Verificar si corresponde a la región del establecimiento)
    - `DESC_DEPE`

## 3. Próximos pasos (Gate de Calidad)
**NO avanzar a `validate` ni `load` hasta confirmar:**
- [ ] El perfilado fue exitoso (status: `success`).
- [ ] Los nombres de columnas en el reporte coinciden exactamente con el mapping en `config/schema_rules.yaml`.
- [ ] El conteo de filas (`row_count`) es coherente con el dataset real.

*Nota: La validación automatizada (`validate`) tiene un umbral crítico de nulos del **5.0%** para campos como RBD y Comuna. Si el perfilado muestra porcentajes mayores, la validación fallará.*
