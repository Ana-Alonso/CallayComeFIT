import React from 'react';
import { TrendingUp, Plus, Trash2 } from 'lucide-react';
import { Box } from '../common';
import type { FitWeightLogItem, FitUserProfile, FitActivity } from '../../types';
import { format_date_display } from '../../utils/planner_helpers';

interface FitProgressSubTabProps {
  weightLogs: FitWeightLogItem[];
  userProfile: FitUserProfile;
  activities: FitActivity[];
  onOpenAddWeightModal: () => void;
  onRemoveWeightLog: (id: string) => void;
}

export const FitProgressSubTab: React.FC<FitProgressSubTabProps> = ({
  weightLogs,
  userProfile,
  activities,
  onOpenAddWeightModal,
  onRemoveWeightLog
}) => {
  const latestWeight = weightLogs[0]?.weight_kg || userProfile.current_weight_kg;
  const targetWeight = userProfile.target_weight_kg || 65;
  const weightDiff = Math.abs(Number((targetWeight - latestWeight).toFixed(1)));
  const totalKcalBurned = activities.reduce((sum, a) => sum + (a.calories_burned || 0), 0);

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Box style={{ background: '#121826', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <Box>
          <h2 style={{ margin: '0 0 6px 0', fontSize: '1.3rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={22} style={{ color: '#10B981' }} /> Evolución Corporal y Rendimiento
          </h2>
          <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem' }}>
            Seguimiento de peso, porcentaje de grasa, masa muscular y entrenamientos acumulados.
          </p>
        </Box>

        <button
          onClick={onOpenAddWeightModal}
          style={{ background: '#10B981', color: '#FFF', border: 'none', padding: '10px 18px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={18} /> + Registrar Pesaje / Composición
        </button>
      </Box>

      <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        <Box style={{ background: '#121826', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '6px' }}>Último Peso Registrado</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10B981' }}>{latestWeight} kg</div>
          <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px' }}>
            Objetivo: <strong>{targetWeight} kg</strong> ({weightDiff} kg para meta)
          </div>
        </Box>

        <Box style={{ background: '#121826', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '6px' }}>Masa Muscular Estimada</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#3B82F6' }}>
            {weightLogs[0]?.muscle_mass_kg ? `${weightLogs[0].muscle_mass_kg} kg` : '28.5 kg'}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px' }}>Mantiene masa magra para metabolismo</div>
        </Box>

        <Box style={{ background: '#121826', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '6px' }}>Grasa Corporal (%)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#F59E0B' }}>
            {weightLogs[0]?.fat_percentage ? `${weightLogs[0].fat_percentage}%` : '22.0%'}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px' }}>
            Perímetro Cintura: <strong>{weightLogs[0]?.waist_cm || 76} cm</strong>
          </div>
        </Box>

        <Box style={{ background: '#121826', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '6px' }}>Entrenamientos Totales</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#8B5CF6' }}>{activities.length} sesiones</div>
          <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px' }}>
            Acumulado: <strong>{totalKcalBurned} kcal quemadas</strong>
          </div>
        </Box>
      </Box>

      <Box style={{ background: '#121826', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700 }}>Historial Temporal de Registro Corporal</h3>

        {weightLogs.length === 0 ? (
          <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>No hay registros de peso guardados aún. Registra tu pesaje para ver la evolución.</p>
        ) : (
          <Box style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {weightLogs.map((log) => (
              <Box key={log.id} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <Box>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#10B981', marginRight: '12px' }}>{log.weight_kg} kg</span>
                  <span style={{ fontSize: '0.82rem', color: '#94A3B8', marginRight: '12px' }}>📅 {format_date_display(log.log_date)}</span>
                  {log.muscle_mass_kg && <span style={{ fontSize: '0.8rem', color: '#3B82F6', marginRight: '10px' }}>💪 Músculo: {log.muscle_mass_kg} kg</span>}
                  {log.fat_percentage && <span style={{ fontSize: '0.8rem', color: '#F59E0B', marginRight: '10px' }}>⚡ Grasa: {log.fat_percentage}%</span>}
                  {log.waist_cm && <span style={{ fontSize: '0.8rem', color: '#CBD5E1' }}>📏 Cintura: {log.waist_cm} cm</span>}
                  {log.notes && <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>{log.notes}</div>}
                </Box>

                <button
                  onClick={() => onRemoveWeightLog(log.id)}
                  style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #EF4444', color: '#EF4444', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer' }}
                  title="Borrar registro"
                >
                  <Trash2 size={14} />
                </button>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};
