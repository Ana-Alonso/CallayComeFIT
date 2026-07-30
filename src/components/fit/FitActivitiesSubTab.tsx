import React from 'react';
import { Plus, Watch, Upload, Edit2, Trash2 } from 'lucide-react';
import { Box } from '../common';
import type { FitActivity } from '../../types';

interface FitActivitiesSubTabProps {
  activities: FitActivity[];
  onOpenAddActivityModal: (act?: FitActivity) => void;
  onRemoveActivity: (id: string) => void;
}

export const FitActivitiesSubTab: React.FC<FitActivitiesSubTabProps> = ({
  activities,
  onOpenAddActivityModal,
  onRemoveActivity
}) => {
  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Box style={{ background: '#121826', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <Box>
          <h2 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', fontWeight: 700 }}>Actividad Física y Entrenamientos</h2>
          <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem' }}>Conecta tus apps o añade entrenamientos manuales para calcular tu gasto calórico.</p>
        </Box>

        <button
          onClick={() => onOpenAddActivityModal()}
          style={{ background: '#10B981', color: '#FFF', border: 'none', padding: '10px 16px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={18} /> Registrar Entrenamiento
        </button>
      </Box>

      <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <Box style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '14px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Watch size={32} style={{ color: '#60A5FA' }} />
          <Box>
            <strong style={{ color: '#FFF', display: 'block', fontSize: '0.95rem' }}>Reloj / Pulsera de Actividad</strong>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Health Connect / Google Fit integrado</span>
          </Box>
        </Box>

        <Box style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: '14px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Upload size={32} style={{ color: '#F97316' }} />
          <Box>
            <strong style={{ color: '#FFF', display: 'block', fontSize: '0.95rem' }}>Importar Archivo GPX / Strava</strong>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Formatos GPX y FIT soportados</span>
          </Box>
        </Box>
      </Box>

      <Box style={{ background: '#121826', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700 }}>Historial de Sesiones Registradas</h3>

        {activities.length === 0 ? (
          <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>No hay actividades registradas hoy.</p>
        ) : (
          <Box style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activities.map((act) => (
              <Box key={act.id} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <Box>
                  <strong style={{ fontSize: '1rem', color: '#FFF', display: 'block' }}>{act.title}</strong>
                  <span style={{ fontSize: '0.82rem', color: '#94A3B8' }}>
                    ⏱️ {act.duration_minutes} min | 🔥 {act.calories_burned} kcal
                    {act.distance_km ? ` | 📍 ${act.distance_km} km` : ''}
                    {act.avg_heart_rate ? ` | ❤️ ${act.avg_heart_rate} bpm` : ''}
                  </span>
                </Box>

                <Box style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => onOpenAddActivityModal(act)}
                    style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#FFF', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer' }}
                    title="Editar Actividad"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => onRemoveActivity(act.id)}
                    style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #EF4444', color: '#EF4444', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer' }}
                    title="Borrar Actividad"
                  >
                    <Trash2 size={14} />
                  </button>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};
