/**
 * ENEPPanel — Seguimiento de Objetivos Estratégicos ENEP
 *
 * Muestra el estado de los 5 OE del SLEP Barrancas con alertas cuando
 * un indicador está bajo la meta. Detecta brechas y sugiere acciones.
 *
 * Datos: SLEP Barrancas 2025 (fuente: plataforma IDEA ENEP)
 */

import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, TrendingDown, TrendingUp, Minus, ChevronRight, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Datos reales SLEP Barrancas 2025 — fuente: ENEP (plataforma IDEA)
const ENEP_BARRANCAS = {
  slep: 'Barrancas',
  ee: 53,
  matricula: 20991,
  anio: 2025,
  objetivos: [
    {
      id: 'OE1',
      nombre: 'Trayectoria y asistencia',
      descripcion: 'Reducir la inasistencia crónica y la deserción escolar',
      indicador_principal: '% estudiantes con inasistencia crónica',
      valor: 38.4,
      meta: 25.0,
      unidad: '%',
      menor_es_mejor: true,
      tendencia: 'mejorando',
      color: '#3b82f6',
      alerta: true,
      mensaje_alerta: '13 pp sobre la meta ENEP',
      detalle_alerta: '38.4% de los estudiantes falta más del 10% de los días del año. La meta nacional es 25%. Esto afecta directamente el aprendizaje y la retención.',
      accion: 'Revisar establecimientos con mayor inasistencia crónica',
    },
    {
      id: 'OE2',
      nombre: 'Aprendizaje y calidad',
      descripcion: 'Mejorar los logros de aprendizaje y reducir brecha SIMCE',
      indicador_principal: '% establecimientos en categoría Insuficiente',
      valor: 18.9,
      meta: 15.0,
      unidad: '%',
      menor_es_mejor: true,
      tendencia: 'estable',
      color: '#8b5cf6',
      alerta: true,
      mensaje_alerta: '3.9 pp sobre la meta',
      detalle_alerta: '10 de 53 establecimientos están en categoría "Insuficiente" según la Agencia de Calidad. La meta es bajar a 15%. Requiere acompañamiento pedagógico intensivo.',
      accion: 'Activar acompañamiento en los 10 EE en rojo de desempeño',
    },
    {
      id: 'OE3',
      nombre: 'NTI y educación digital',
      descripcion: 'Cobertura NTI en educación parvularia y continuidad digital',
      indicador_principal: '% cobertura NTI educación parvularia',
      valor: 81.2,
      meta: 80.0,
      unidad: '%',
      menor_es_mejor: false,
      tendencia: 'mejorando',
      color: '#10b981',
      alerta: false,
      mensaje_alerta: null,
      detalle_alerta: 'Sobre la meta nacional. El SLEP cubre el 81.2% de los establecimientos con infraestructura digital NTI, superando el piso de 80%.',
      accion: null,
    },
    {
      id: 'OE4',
      nombre: 'Dotación y condiciones docentes',
      descripcion: 'Docentes en norma estimada y reducción de horas no cubiertas',
      indicador_principal: '% docentes en norma estimada',
      valor: 67.3,
      meta: 80.0,
      unidad: '%',
      menor_es_mejor: false,
      tendencia: 'estable',
      color: '#f59e0b',
      alerta: true,
      mensaje_alerta: '12.7 pp bajo la meta',
      detalle_alerta: 'Solo el 67.3% de los docentes está en norma estimada. La meta es 80%. Alta rotación en liceos técnicos y 8 vacantes sin cubrir afectan la cobertura horaria.',
      accion: 'Revisar concursos docentes pendientes y horas sin cubrir',
    },
    {
      id: 'OE5',
      nombre: 'Titulación técnico-profesional',
      descripcion: 'Egresados TP que logran titularse en el sistema',
      indicador_principal: '% graduados TP que se titulan',
      valor: 52.1,
      meta: 65.0,
      unidad: '%',
      menor_es_mejor: false,
      tendencia: 'mejorando',
      color: '#ef4444',
      alerta: true,
      mensaje_alerta: '12.9 pp bajo la meta',
      detalle_alerta: 'Solo el 52.1% de los egresados técnicos logra titularse. La meta nacional es 65%. Menor desempeño que el promedio nacional. Requiere coordinación con SENCE y empresas.',
      accion: 'Coordinar con liceos TP: brechas en proceso de titulación',
    },
  ],
};

// Tooltip tipo comic
function AlertTooltip({ oe, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  return (
    <div ref={ref} style={{
      position: 'absolute', right: 0, top: 'calc(100% + 10px)', zIndex: 200,
      background: 'white', color: '#1e293b',
      borderRadius: 12, padding: '14px 16px',
      width: 240, boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
      fontSize: 12, lineHeight: 1.6,
    }}>
      {/* Triángulo apuntador */}
      <div style={{
        position: 'absolute', top: -7, right: 10,
        width: 0, height: 0,
        borderLeft: '7px solid transparent',
        borderRight: '7px solid transparent',
        borderBottom: '7px solid white',
      }} />
      <div style={{ fontWeight: 700, color: oe.alerta ? '#ef4444' : '#10b981', marginBottom: 6, fontSize: 13 }}>
        {oe.alerta ? '⚠ Bajo la meta' : '✓ Sobre la meta'}
      </div>
      <p style={{ margin: 0, color: '#334155' }}>{oe.detalle_alerta}</p>
      {oe.alerta && oe.accion && (
        <p style={{ margin: '8px 0 0', color: '#3b82f6', fontWeight: 600, fontSize: 11 }}>
          → {oe.accion}
        </p>
      )}
    </div>
  );
}

function TendenciaIcon({ tendencia, menorEsMejor }) {
  // Para "menor es mejor": mejorando = bajando (TrendingDown = buena señal)
  // Para "mayor es mejor": mejorando = subiendo (TrendingUp = buena señal)
  if (tendencia === 'mejorando') {
    const Icon = menorEsMejor ? TrendingDown : TrendingUp;
    return <Icon size={13} style={{ color: 'var(--alert-green)' }} />;
  }
  if (tendencia === 'empeorando') {
    const Icon = menorEsMejor ? TrendingUp : TrendingDown;
    return <Icon size={13} style={{ color: 'var(--alert-red)' }} />;
  }
  return <Minus size={13} style={{ color: 'var(--text-muted)' }} />;
}

function OECard({ oe }) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const { valor, meta, menor_es_mejor, unidad } = oe;
  const pct = menor_es_mejor
    ? Math.min(100, (meta / valor) * 100)
    : Math.min(100, (valor / meta) * 100);

  // Semáforo claro: verde (OK), naranja (5-10pp gap), rojo (>10pp gap)
  const gap = menor_es_mejor ? valor - meta : meta - valor;
  const semaforoColor = !oe.alerta ? '#10b981' : gap > 10 ? '#ef4444' : '#f59e0b';
  const barColor = !oe.alerta
    ? '#10b981'
    : `linear-gradient(90deg, ${semaforoColor}88, ${semaforoColor})`;

  return (
    <div style={{
      padding: '14px 16px',
      borderRadius: 10,
      background: oe.alerta
        ? `linear-gradient(135deg, rgba(255,255,255,0.03), ${oe.color}08)`
        : 'rgba(16,185,129,0.04)',
      border: `1px solid ${oe.alerta ? oe.color + '30' : 'rgba(16,185,129,0.2)'}`,
      transition: 'transform 0.15s',
      position: 'relative',
    }}>
      {/* Cabecera OE */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 6,
            background: `${oe.color}20`, color: oe.color, letterSpacing: '0.06em',
          }}>
            {oe.id}
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
            {oe.nombre}
          </span>
        </div>

        {/* Ícono clicable con tooltip */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={() => setTooltipOpen(!tooltipOpen)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px',
              display: 'flex', alignItems: 'center',
              borderRadius: 6,
              background: tooltipOpen ? 'rgba(255,255,255,0.1)' : 'none',
            }}
            title="Ver detalle"
          >
            {oe.alerta
              ? <AlertTriangle size={14} style={{ color: oe.color }} />
              : <Info size={14} style={{ color: '#10b981' }} />
            }
          </button>
          {tooltipOpen && <AlertTooltip oe={oe} onClose={() => setTooltipOpen(false)} />}
        </div>
      </div>

      {/* Indicador principal */}
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>
        {oe.indicador_principal}
      </div>

      {/* Barra de progreso */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 11 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: semaforoColor }}>
            {valor}{unidad}
          </span>
          <span style={{ color: 'var(--text-muted)' }}>
            Meta: {meta}{unidad}
          </span>
        </div>
        <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${pct}%`, borderRadius: 3,
            background: barColor,
            transition: 'width 0.6s ease',
          }} />
        </div>
        {/* Etiqueta de cumplimiento con semáforo */}
        <div style={{ fontSize: 10, color: semaforoColor, marginTop: 3, textAlign: 'right', fontWeight: 600 }}>
          {Math.round(pct)}% del objetivo
        </div>
      </div>

      {/* Tendencia */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
        <TendenciaIcon tendencia={oe.tendencia} menorEsMejor={menor_es_mejor} />
        <span style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>{oe.tendencia}</span>
        {oe.alerta && oe.mensaje_alerta && (
          <span style={{ marginLeft: 4, color: oe.color, fontWeight: 600 }}>
            · {oe.mensaje_alerta}
          </span>
        )}
        {!oe.alerta && (
          <span style={{ marginLeft: 4, color: '#10b981', fontWeight: 600 }}>· Sobre la meta</span>
        )}
      </div>

      {/* Acción sugerida (solo en alerta) */}
      {oe.alerta && oe.accion && (
        <div style={{
          marginTop: 10, padding: '7px 10px', borderRadius: 7,
          background: 'rgba(59, 130, 246, 0.07)',
          fontSize: 11, color: 'var(--accent-primary)', lineHeight: 1.4,
        }}>
          <strong>Acción sugerida:</strong> {oe.accion}
        </div>
      )}
    </div>
  );
}

export default function ENEPPanel({ fullPage = false }) {
  const navigate = useNavigate();
  const { objetivos, slep, anio, ee, matricula } = ENEP_BARRANCAS;
  const alertasActivas = objetivos.filter(o => o.alerta).length;
  const sobreMeta = objetivos.filter(o => !o.alerta).length;

  return (
    <div style={{ marginBottom: fullPage ? 0 : 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h3 style={{ fontSize: fullPage ? 22 : 18, fontWeight: 700, margin: 0 }}>
              Objetivos Estratégicos ENEP
            </h3>
            {alertasActivas > 0 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                background: 'rgba(239,68,68,0.12)', color: 'var(--alert-red)',
                border: '1px solid rgba(239,68,68,0.2)',
              }}>
                <AlertTriangle size={11} /> {alertasActivas} bajo meta
              </span>
            )}
            {sobreMeta > 0 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                background: 'rgba(16,185,129,0.1)', color: '#10b981',
                border: '1px solid rgba(16,185,129,0.2)',
              }}>
                ✓ {sobreMeta} sobre meta
              </span>
            )}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
            SLEP {slep} · {ee} establecimientos · {matricula.toLocaleString('es-CL')} alumnos · Datos base {anio}, gestión 2026
          </p>
        </div>
        {!fullPage && (
          <button
            onClick={() => navigate('/dashboard/enep')}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'none', border: '1px solid var(--border-color)',
              color: 'var(--text-muted)', borderRadius: 8, padding: '6px 12px',
              fontSize: 12, cursor: 'pointer',
            }}
          >
            Ver detalle <ChevronRight size={13} />
          </button>
        )}
      </div>

      {/* Leyenda semáforo — globo cómic blanco */}
      <div style={{
        display: 'flex', gap: 14, marginBottom: 14, flexWrap: 'wrap',
        padding: '10px 16px', borderRadius: 12,
        background: '#ffffff', color: '#334155',
        fontSize: 12, lineHeight: 1.6,
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
          <strong>Rojo</strong> = Muy bajo la meta (&gt;10 pp)
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} />
          <strong>Naranja</strong> = Bajo la meta (&le;10 pp)
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
          <strong>Verde</strong> = Sobre la meta o dentro del rango
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b' }}>
          Haz clic en <AlertTriangle size={11} style={{ color: '#ef4444' }} /> para ver detalle y acci\u00f3n sugerida
        </span>
      </div>

      {/* Grid OEs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 10,
      }}>
        {objetivos.map(oe => (
          <OECard key={oe.id} oe={oe} />
        ))}
      </div>

      {/* Footer — globo cómic blanco */}
      <div style={{
        marginTop: 12, padding: '12px 16px', borderRadius: 12,
        background: '#ffffff', color: '#334155',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        fontSize: 12, lineHeight: 1.6, position: 'relative',
      }}>
        {/* Puntero arriba */}
        <div style={{
          position: 'absolute', top: -7, left: 20,
          width: 0, height: 0,
          borderLeft: '7px solid transparent',
          borderRight: '7px solid transparent',
          borderBottom: '7px solid #ffffff',
        }} />
        <strong style={{ color: '#2563eb' }}>¿Qué es la ENEP?</strong>{' '}
        La Estrategia Nacional de Educación Pública define 5 Objetivos Estratégicos que todos los SLEPs deben cumplir.
        Radar cruza estos objetivos con el PAL y el CGE, detecta brechas automáticamente y sugiere acciones concretas al equipo directivo.{' '}
        <em style={{ color: '#64748b' }}>Fuente: ENEP vía plataforma IDEA.</em>
      </div>
    </div>
  );
}
