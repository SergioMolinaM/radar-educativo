/**
 * BrechaAcumulada — Proyección de cumplimiento a fin de año
 * Muestra: "A este ritmo, ¿llegas o no llegas a diciembre?"
 */
import { TrendingUp, TrendingDown, AlertTriangle, Target } from 'lucide-react';

// Indicadores clave con avance actual y meta anual
const INDICADORES_PROYECCION = [
  {
    nombre: 'Inasistencia crónica',
    actual: 38.4, meta: 25.0, unidad: '%',
    menorEsMejor: true,
    avanceMensual: -0.8, // cuánto mejora por mes
    mesesRestantes: 9, // abr-dic
    instrumento: 'ENEP OE1',
  },
  {
    nombre: 'EE categoría Insuficiente',
    actual: 18.9, meta: 15.0, unidad: '%',
    menorEsMejor: true,
    avanceMensual: -0.4,
    mesesRestantes: 9,
    instrumento: 'ENEP OE2',
  },
  {
    nombre: 'Docentes en norma',
    actual: 67.3, meta: 80.0, unidad: '%',
    menorEsMejor: false,
    avanceMensual: 1.2,
    mesesRestantes: 9,
    instrumento: 'ENEP OE4',
  },
  {
    nombre: 'Titulación TP',
    actual: 52.1, meta: 65.0, unidad: '%',
    menorEsMejor: false,
    avanceMensual: 1.5,
    mesesRestantes: 9,
    instrumento: 'ENEP OE5',
  },
  {
    nombre: 'Ejecución presupuestaria',
    actual: 78.4, meta: 90.0, unidad: '%',
    menorEsMejor: false,
    avanceMensual: 2.5,
    mesesRestantes: 9,
    instrumento: 'CGE',
  },
];

function proyeccion(ind) {
  const proyectado = ind.actual + (ind.avanceMensual * ind.mesesRestantes);
  const llegaAMeta = ind.menorEsMejor
    ? proyectado <= ind.meta
    : proyectado >= ind.meta;
  const brecha = ind.menorEsMejor
    ? ind.actual - ind.meta
    : ind.meta - ind.actual;
  const brechaProyectada = ind.menorEsMejor
    ? Math.max(0, proyectado - ind.meta)
    : Math.max(0, ind.meta - proyectado);
  return { proyectado: Math.round(proyectado * 10) / 10, llegaAMeta, brecha: Math.round(brecha * 10) / 10, brechaProyectada: Math.round(brechaProyectada * 10) / 10 };
}

export default function BrechaAcumulada() {
  const results = INDICADORES_PROYECCION.map(ind => ({ ...ind, ...proyeccion(ind) }));
  const llegan = results.filter(r => r.llegaAMeta).length;
  const noLlegan = results.filter(r => !r.llegaAMeta).length;

  return (
    <div className="glass-panel" style={{ padding: 20, marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Target size={18} style={{ color: '#f97316' }} />
            {'Proyección a diciembre 2026'}
          </h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' }}>
            {'Desde la línea base 2025: ¿se cumplen las metas si se mantiene el ritmo? (Tasas de avance mensual son estimadas)'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {noLlegan > 0 && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
              background: 'rgba(239,68,68,0.12)', color: '#ef4444',
            }}>
              <AlertTriangle size={11} /> {noLlegan} en riesgo
            </span>
          )}
          {llegan > 0 && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
              background: 'rgba(16,185,129,0.1)', color: '#10b981',
            }}>
              {llegan} en camino
            </span>
          )}
        </div>
      </div>

      {/* Indicadores */}
      <div style={{ display: 'grid', gap: 8 }}>
        {results.map((r, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 14px', borderRadius: 10,
            background: r.llegaAMeta ? 'rgba(16,185,129,0.04)' : 'rgba(239,68,68,0.04)',
            border: `1px solid ${r.llegaAMeta ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}`,
          }}>
            {/* Ícono estado */}
            <div style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: r.llegaAMeta ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
            }}>
              {r.llegaAMeta
                ? <TrendingUp size={16} style={{ color: '#10b981' }} />
                : <TrendingDown size={16} style={{ color: '#ef4444' }} />
              }
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                {r.nombre}
                <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 8, fontWeight: 400 }}>{r.instrumento}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                Base 2025: <strong>{r.actual}{r.unidad}</strong> {' → '} Proyectado dic 2026: <strong style={{ color: r.llegaAMeta ? '#10b981' : '#ef4444' }}>{r.proyectado}{r.unidad}</strong> · Meta: {r.meta}{r.unidad}
              </div>
            </div>

            {/* Veredicto */}
            <div style={{
              fontSize: 11, fontWeight: 700, flexShrink: 0,
              color: r.llegaAMeta ? '#10b981' : '#ef4444',
            }}>
              {r.llegaAMeta ? 'Llega' : `Brecha: ${r.brechaProyectada}${r.unidad}`}
            </div>
          </div>
        ))}
      </div>

      {/* Globo explicativo */}
      <div style={{
        marginTop: 12, padding: '10px 14px', borderRadius: 12,
        background: '#ffffff', color: '#334155',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        fontSize: 11, lineHeight: 1.6, position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: -7, left: 20,
          width: 0, height: 0,
          borderLeft: '7px solid transparent', borderRight: '7px solid transparent',
          borderBottom: '7px solid #ffffff',
        }} />
        <strong style={{ color: '#2563eb' }}>¿Cómo se calcula?</strong>{' '}
        Proyección estimada desde línea base 2025. Las tasas de avance son aproximadas y se ajustarán con datos 2026 cuando estén disponibles.
      </div>
    </div>
  );
}
