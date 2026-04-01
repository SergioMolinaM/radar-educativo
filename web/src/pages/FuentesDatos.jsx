import { Database, ExternalLink, CheckCircle, Clock, AlertTriangle, Shield } from 'lucide-react';

const FUENTES = [
  {
    categoria: 'Datos educativos',
    color: '#3b82f6',
    fuentes: [
      { nombre: 'Matrícula oficial', origen: 'MINEDUC - Datos Abiertos', url: 'https://datosabiertos.mineduc.cl', periodo: '2024-2025', estado: 'activo', registros: '3.5M' },
      { nombre: 'Asistencia escolar', origen: 'MINEDUC - SIGE', url: 'https://datosabiertos.mineduc.cl', periodo: '2024-2025', estado: 'activo', registros: '6.7M' },
      { nombre: 'SIMCE', origen: 'Agencia de Calidad de la Educación', url: 'https://www.agenciaeducacion.cl', periodo: '2022-2024', estado: 'activo', registros: '24K' },
      { nombre: 'Rendimiento (aprobación/reprobación)', origen: 'MINEDUC - Datos Abiertos', url: 'https://datosabiertos.mineduc.cl', periodo: '2024', estado: 'activo', registros: '32K' },
      { nombre: 'Directorio de establecimientos', origen: 'MINEDUC', url: 'https://datosabiertos.mineduc.cl', periodo: '2025', estado: 'activo', registros: '16.7K' },
    ],
  },
  {
    categoria: 'Datos financieros',
    color: '#10b981',
    fuentes: [
      { nombre: 'Ejecución SEP', origen: 'MINEDUC - Comunidad Escolar', url: 'https://comunidadescolar.cl', periodo: '2024', estado: 'activo', registros: '3.1M' },
      { nombre: 'Compras públicas', origen: 'Mercado Público API', url: 'https://api.mercadopublico.cl', periodo: 'Tiempo real', estado: 'activo', registros: 'API viva' },
      { nombre: 'Presupuesto SLEP', origen: 'DIPRES - Ley de Presupuestos', url: 'https://www.dipres.gob.cl', periodo: '2025', estado: 'pendiente', registros: '-' },
    ],
  },
  {
    categoria: 'Datos de gestión',
    color: '#f59e0b',
    fuentes: [
      { nombre: 'Plan Anual Local (PAL)', origen: 'DEP - SLEP', url: null, periodo: '2025', estado: 'parcial', registros: '1 doc' },
      { nombre: 'IVE (vulnerabilidad)', origen: 'JUNAEB', url: 'https://www.junaeb.cl', periodo: '2024', estado: 'pendiente', registros: '-' },
      { nombre: 'Categoría de desempeño', origen: 'Agencia de Calidad', url: 'https://www.agenciaeducacion.cl', periodo: '2024', estado: 'pendiente', registros: '-' },
      { nombre: 'IDPS', origen: 'Agencia de Calidad', url: 'https://www.agenciaeducacion.cl', periodo: '2023', estado: 'pendiente', registros: '-' },
      { nombre: 'Dotación docente', origen: 'MINEDUC - Datos Abiertos', url: 'https://datosabiertos.mineduc.cl', periodo: '2024', estado: 'pendiente', registros: '-' },
      { nombre: 'Denuncias Supereduc', origen: 'datos.gob.cl', url: 'https://datos.gob.cl', periodo: '2023-2024', estado: 'pendiente', registros: '-' },
    ],
  },
];

const estadoConfig = {
  activo: { icon: CheckCircle, color: '#10b981', label: 'Activo' },
  parcial: { icon: Clock, color: '#f59e0b', label: 'Parcial' },
  pendiente: { icon: AlertTriangle, color: '#6b7280', label: 'Pendiente' },
};

export default function FuentesDatos() {
  const totalActivos = FUENTES.flatMap(f => f.fuentes).filter(f => f.estado === 'activo').length;
  const totalFuentes = FUENTES.flatMap(f => f.fuentes).length;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>Fuentes de datos</h2>
        <div style={{
          padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600,
          background: 'rgba(16, 185, 129, 0.1)', color: '#10b981',
        }}>
          {totalActivos}/{totalFuentes} activas
        </div>
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
        Transparencia total: cada dato tiene origen verificable y público
      </p>

      {/* Nota de transparencia */}
      <div className="card" style={{
        padding: 16, marginBottom: 24,
        background: 'rgba(59, 130, 246, 0.05)',
        borderLeft: '3px solid #3b82f6',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Shield size={16} style={{ color: '#3b82f6' }} />
          <span style={{ fontWeight: 600, fontSize: 13 }}>Compromiso de transparencia</span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
          Radar de la Educación Pública utiliza exclusivamente datos de fuentes públicas y oficiales del Estado de Chile.
          Ningún dato es inventado, estimado o proyectado sin indicarlo explícitamente.
          Cada indicador incluye referencia a su fuente, período y fecha de última actualización.
        </p>
      </div>

      {/* Fuentes por categoría */}
      {FUENTES.map((cat) => (
        <div key={cat.categoria} style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: cat.color, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
            {cat.categoria}
          </h3>
          <div className="card" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  {['Fuente', 'Origen', 'Período', 'Registros', 'Estado'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cat.fuentes.map((f) => {
                  const est = estadoConfig[f.estado];
                  const EstIcon = est.icon;
                  return (
                    <tr key={f.nombre} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600 }}>{f.nombre}</td>
                      <td style={{ padding: '12px 16px', fontSize: 12 }}>
                        {f.url ? (
                          <a href={f.url} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                            {f.origen} <ExternalLink size={10} />
                          </a>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>{f.origen}</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-muted)' }}>{f.periodo}</td>
                      <td style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600 }}>{f.registros}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <EstIcon size={14} style={{ color: est.color }} />
                          <span style={{ fontSize: 11, fontWeight: 600, color: est.color }}>{est.label}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
