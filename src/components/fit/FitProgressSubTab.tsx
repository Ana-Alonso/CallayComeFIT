import React, { useState } from 'react';
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
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));

  const formatMonthLabel = (yearMonthStr: string) => {
    if (!yearMonthStr) return '';
    const [year, month] = yearMonthStr.split('-');
    if (!year || !month) return yearMonthStr;
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    const monthName = date.toLocaleString('es-ES', { month: 'long' });
    return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;
  };

  const formattedMonth = formatMonthLabel(selectedMonth);

  const filteredLogs = weightLogs.filter(w => w.log_date && w.log_date.startsWith(selectedMonth));
  const latestLog = filteredLogs[0] || weightLogs[0];

  const latestWeight = latestLog?.weight_kg || userProfile.current_weight_kg;
  const targetWeight = userProfile.target_weight_kg || 65;
  const weightDiff = Math.abs(Number((targetWeight - latestWeight).toFixed(1)));

  const monthlyActivities = activities.filter(a => a.activity_date && a.activity_date.startsWith(selectedMonth));
  const totalKcalBurned = monthlyActivities.reduce((sum, a) => sum + (a.calories_burned || 0), 0);

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Box style={{ background: '#121826', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <Box>
          <h2 style={{ margin: '0 0 6px 0', fontSize: '1.3rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={22} style={{ color: '#10B981' }} /> Evolución Corporal y Rendimiento Mensual
          </h2>
          <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem' }}>
            Seguimiento de peso diario, masa grasa/muscular y balance calórico mensual ({formattedMonth}).
          </p>
        </Box>

        <Box style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value || new Date().toISOString().slice(0, 7))}
            style={{
              background: '#1E293B',
              border: '1px solid rgba(16,185,129,0.4)',
              color: '#F8FAFC',
              padding: '8px 14px',
              borderRadius: '10px',
              fontSize: '0.88rem',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer'
            }}
          />

          <button
            onClick={onOpenAddWeightModal}
            style={{ background: '#10B981', color: '#FFF', border: 'none', padding: '10px 18px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={18} /> + Registrar Pesaje / Composición
          </button>
        </Box>
      </Box>

      <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        <Box style={{ background: '#121826', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '14px' }}>
          <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Peso Actual ({latestLog?.log_date ? format_date_display(latestLog.log_date) : 'Hoy'})</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10B981' }}>{latestWeight} kg</div>
          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Meta: {targetWeight} kg ({weightDiff} kg rest.)</div>
        </Box>

        <Box style={{ background: '#121826', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '14px' }}>
          <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Grasa Corporal</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#F59E0B' }}>
            {latestLog?.fat_percentage ? `${latestLog.fat_percentage}%` : '21.5%'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Masa Grasa: {latestLog?.fat_mass_kg || '--'} kg</div>
        </Box>

        <Box style={{ background: '#121826', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '14px' }}>
          <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Grasa Visceral</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#EF4444' }}>
            {latestLog?.visceral_fat ? `Nivel ${latestLog.visceral_fat}` : 'Nivel 4'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Rango saludable: 1 - 9</div>
        </Box>

        <Box style={{ background: '#121826', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '14px' }}>
          <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>IMC</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#60A5FA' }}>
            {latestLog?.bmi || '23.2'} kg/m²
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Índice de Masa Corporal</div>
        </Box>

        <Box style={{ background: '#121826', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '14px' }}>
          <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Masa Libre de Grasa</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#3B82F6' }}>
            {latestLog?.fat_free_mass_kg ? `${latestLog.fat_free_mass_kg} kg` : '53.8 kg'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Masa Magra Total</div>
        </Box>

        <Box style={{ background: '#121826', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '14px' }}>
          <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Masa Muscular</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#8B5CF6' }}>
            {latestLog?.muscle_mass_kg ? `${latestLog.muscle_mass_kg} kg` : '29.1 kg'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>% Músculo: {latestLog?.muscle_percentage || '--'}%</div>
        </Box>

        <Box style={{ background: '#121826', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '14px' }}>
          <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Mineral Óseo</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#A7F3D0' }}>
            {latestLog?.bone_mineral_kg ? `${latestLog.bone_mineral_kg} kg` : '2.9 kg'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>% Óseo: {latestLog?.bone_mineral_percentage || '--'}%</div>
        </Box>

        <Box style={{ background: '#121826', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '14px' }}>
          <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Agua Corporal</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38BDF8' }}>
            {latestLog?.body_water_percentage ? `${latestLog.body_water_percentage}%` : '58.0%'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Cintura: {latestLog?.waist_cm || 75} cm</div>
        </Box>
      </Box>

      <Box style={{ background: '#121826', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', fontWeight: 700 }}>
          Resumen Calórico y Actividad Mensual ({formattedMonth})
        </h3>
        <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Box style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', padding: '12px', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: '#FDBA74', display: 'block' }}>Calorías Quemadas en Entrenamientos</span>
            <strong style={{ fontSize: '1.4rem', color: '#FFF' }}>{totalKcalBurned} kcal</strong>
          </Box>
          <Box style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', padding: '12px', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: '#93C5FD', display: 'block' }}>Sesiones Registradas</span>
            <strong style={{ fontSize: '1.4rem', color: '#FFF' }}>{monthlyActivities.length} sesiones</strong>
          </Box>
        </Box>
      </Box>

      <Box style={{ background: '#121826', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700 }}>
          Historial Biométrico Detallado ({formattedMonth})
        </h3>

        {filteredLogs.length === 0 ? (
          <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>No hay registros guardados para {formattedMonth}.</p>
        ) : (
          <Box style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredLogs.map((log) => (
              <Box key={log.id} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <Box style={{ flex: 1 }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#10B981' }}>{log.weight_kg} kg</span>
                    <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>📅 {format_date_display(log.log_date)}</span>
                    {log.bmi && <span style={{ fontSize: '0.78rem', background: 'rgba(59,130,246,0.15)', color: '#60A5FA', padding: '2px 8px', borderRadius: '6px' }}>IMC {log.bmi}</span>}
                  </Box>

                  <Box style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', fontSize: '0.8rem', color: '#CBD5E1' }}>
                    {log.fat_percentage && <span>⚡ Grasa: <strong>{log.fat_percentage}%</strong> ({log.fat_mass_kg || '--'} kg)</span>}
                    {log.visceral_fat && <span>🔴 Visceral: <strong>Nivel {log.visceral_fat}</strong></span>}
                    {log.fat_free_mass_kg && <span>💪 Masa Libre Grasa: <strong>{log.fat_free_mass_kg} kg</strong></span>}
                    {log.muscle_mass_kg && <span>🏋️ Músculo: <strong>{log.muscle_mass_kg} kg</strong> ({log.muscle_percentage || '--'}%)</span>}
                    {log.bone_mineral_kg && <span>🦴 Mineral Óseo: <strong>{log.bone_mineral_kg} kg</strong> ({log.bone_mineral_percentage || '--'}%)</span>}
                    {log.body_water_percentage && <span>💧 Agua: <strong>{log.body_water_percentage}%</strong></span>}
                    {log.waist_cm && <span>📏 Cintura: <strong>{log.waist_cm} cm</strong></span>}
                  </Box>

                  {log.notes && <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '6px', fontStyle: 'italic' }}>📝 {log.notes}</div>}
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
