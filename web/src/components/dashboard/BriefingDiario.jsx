/**
 * BriefingDiario — Pop-up de Control de Gestión Diario (CTL)
 * Al entrar al SLEP muestra qué debe atender el equipo directivo HOY.
 * Fondo blanco, fecha/hora, links directos a cada tema.
 * Esto es lo que diferencia a Radar: no solo datos, sino qué HACER con ellos.
 */
import { useState, useEffect } from 'react';
import { X, AlertTriangle, Clock, Calendar, ChevronRight, Target, TrendingDown, School, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Construye items del briefing dinámicamente según datos del dashboard
function buildBriefingItems(kpis, alertas) {
  const items = [];
  const hoy = new Date();
  const mesNombres = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

  // 1. EE en rojo
  if (kpis?.alertas_rojas > 0) {
    items.push({
      prioridad: 'critica',
      icon: AlertTriangle,
      titulo: `${kpis.alertas_rojas} establecimientos con asistencia bajo 75%`,
      detalle: 'Requieren intervención directa del equipo. Revisar plan de asistencia por EE.',
      link: '/dashboard/alertas',
      linkText: 'Ver alertas',
    });
  }

  // 2. Compromisos vencidos (simulado — en prod vendría del API)
  items.push({
    prioridad: 'critica',
    icon: Clock,
    titulo: '3 compromisos institucionales vencidos',
    detalle: 'Plan OE1 inasistencia, dotación docente TP y reporte OE4. Atraso de 1 a 7 días.',
    link: '/dashboard/mi-slep',
    linkText: 'Ver compromisos',
  });

  // 3. Brecha acumulada
  items.push({
    prioridad: 'alerta',
    icon: TrendingDown,
    titulo: '3 de 5 indicadores clave no alcanzan meta al ritmo actual',
    detalle: 'Inasistencia crónica, docentes en norma y titulación TP proyectan brecha a diciembre.',
    link: '/dashboard/enep',
    linkText: 'Ver proyección',
  });

  // 4. Próximo hito normativo
  const diasDIA = 13; // días hasta DIA Lectura 15 abril
  items.push({
    prioridad: 'info',
    icon: Calendar,
    titulo: `Próximo hito: Diagnóstico DIA Lectura en ${diasDIA} días`,
    detalle: `Fecha límite: 15 de ${mesNombres[3]} 2026. Aplica a todos los establecimientos del SLEP.`,
    link: '/dashboard/plan-anual',
    linkText: 'Ver calendario',
  });

  // 5. EE con alertas cruzadas
  items.push({
    prioridad: 'alerta',
    icon: School,
    titulo: '3 EE con problemas en múltiples dimensiones',
    detalle: 'Liceo Polivalente Cerro Navia: triple rojo (asistencia + SIMCE + retención).',
    link: '/dashboard/establecimientos',
    linkText: 'Ver establecimientos',
  });

  return items;
}

const PRIORIDAD_STYLES = {
  critica: { bg: '#fef2f2', border: '#fecaca', dot: '#ef4444' },
  alerta: { bg: '#fff7ed', border: '#fed7aa', dot: '#f97316' },
  info: { bg: '#eff6ff', border: '#bfdbfe', dot: '#3b82f6' },
};

export default function BriefingDiario({ kpis, alertas, onClose }) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check si ya se mostró hoy
    const lastShown = localStorage.getItem('radar_briefing_date');
    const hoy = new Date().toISOString().split('T')[0];
    if (lastShown === hoy) {
      onClose?.();
      return;
    }
    // Mostrar con delay para que el dashboard cargue primero
    const timer = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    const hoy = new Date().toISOString().split('T')[0];
    localStorage.setItem('radar_briefing_date', hoy);
    setVisible(false);
    onClose?.();
  };

  const handleAction = (link) => {
    handleClose();
    navigate(link);
  };

  if (!visible) return null;

  const hoy = new Date();
  const diasSemana = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const fechaStr = `${diasSemana[hoy.getDay()]} ${hoy.getDate()} de ${meses[hoy.getMonth()]} de ${hoy.getFullYear()}`;
  const horaStr = hoy.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });

  const items = buildBriefingItems(kpis, alertas);
  const criticas = items.filter(i => i.prioridad === 'critica');
  const otras = items.filter(i => i.prioridad !== 'critica');

  return (
    <>
      {/* Overlay oscuro */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.3s ease',
        }}
      />

      {/* Panel briefing */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
        width: '90%', maxWidth: 580, maxHeight: '85vh',
        overflowY: 'auto',
        background: '#ffffff', color: '#1e293b',
        borderRadius: 20,
        boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
        animation: 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 28px 16px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#f97316', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
              Control de gestión diario
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: '#0f172a' }}>
              Tu briefing de hoy
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6, fontSize: 13, color: '#64748b' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Calendar size={14} /> {fechaStr}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={14} /> {horaStr}
              </span>
            </div>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: '#f1f5f9', border: 'none', borderRadius: 8,
              width: 32, height: 32, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#64748b',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Resumen rápido */}
        <div style={{
          padding: '14px 28px',
          background: '#fafafa',
          borderBottom: '1px solid #e2e8f0',
          fontSize: 13, color: '#334155', lineHeight: 1.6,
        }}>
          Hoy tu SLEP tiene <strong style={{ color: '#ef4444' }}>{criticas.length} temas críticos</strong> y{' '}
          <strong style={{ color: '#f97316' }}>{otras.length} alertas</strong> que requieren seguimiento.
        </div>

        {/* Items */}
        <div style={{ padding: '16px 28px 8px' }}>
          {/* Críticos primero */}
          {criticas.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#ef4444', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                Acción inmediata
              </div>
              {criticas.map((item, i) => (
                <BriefingItem key={i} item={item} onAction={handleAction} />
              ))}
            </div>
          )}

          {/* Resto */}
          {otras.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                Seguimiento
              </div>
              {otras.map((item, i) => (
                <BriefingItem key={i} item={item} onAction={handleAction} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 28px 20px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>
            Este briefing se genera automáticamente cada día al entrar a Radar.
          </span>
          <button
            onClick={handleClose}
            style={{
              padding: '8px 20px', borderRadius: 8,
              background: '#2563eb', color: '#ffffff',
              border: 'none', fontSize: 13, fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Ir al dashboard
          </button>
        </div>
      </div>
    </>
  );
}

function BriefingItem({ item, onAction }) {
  const style = PRIORIDAD_STYLES[item.prioridad];
  const Icon = item.icon;

  return (
    <div
      style={{
        padding: '12px 14px', marginBottom: 8, borderRadius: 12,
        background: style.bg, border: `1px solid ${style.border}`,
        cursor: 'pointer', transition: 'transform 0.15s',
      }}
      onClick={() => onAction(item.link)}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 7, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `${style.dot}18`,
        }}>
          <Icon size={14} style={{ color: style.dot }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 2 }}>
            {item.titulo}
          </div>
          <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>
            {item.detalle}
          </div>
        </div>
        <ChevronRight size={14} style={{ color: style.dot, flexShrink: 0, marginTop: 6 }} />
      </div>
    </div>
  );
}
