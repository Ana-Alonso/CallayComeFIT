import React, { useState, useEffect } from 'react';
import { Box } from '../common';
import type { FitActivity } from '../../types';

interface FitEditActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityToEdit?: FitActivity | null;
  onAddActivity: (act: FitActivity) => void;
  onUpdateActivity: (act: FitActivity) => void;
}

export const FitEditActivityModal: React.FC<FitEditActivityModalProps> = ({
  isOpen,
  onClose,
  activityToEdit,
  onAddActivity,
  onUpdateActivity
}) => {
  const [activityDate, setActivityDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');
  const [distance, setDistance] = useState('');
  const [heartRate, setHeartRate] = useState('');

  useEffect(() => {
    if (activityToEdit) {
      setActivityDate(activityToEdit.activity_date ? activityToEdit.activity_date.split('T')[0] : new Date().toISOString().split('T')[0]);
      setTitle(activityToEdit.title);
      setDuration(activityToEdit.duration_minutes.toString());
      setCalories(activityToEdit.calories_burned.toString());
      setDistance(activityToEdit.distance_km ? activityToEdit.distance_km.toString() : '');
      setHeartRate(activityToEdit.avg_heart_rate ? activityToEdit.avg_heart_rate.toString() : '');
    } else {
      setActivityDate(new Date().toISOString().split('T')[0]);
      setTitle('');
      setDuration('');
      setCalories('');
      setDistance('');
      setHeartRate('');
    }
  }, [activityToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !duration || !calories) return;

    const formattedDate = activityDate || new Date().toISOString().split('T')[0];

    if (activityToEdit) {
      onUpdateActivity({
        ...activityToEdit,
        activity_date: formattedDate,
        title,
        duration_minutes: parseInt(duration) || 0,
        calories_burned: parseInt(calories) || 0,
        distance_km: distance ? parseFloat(distance) : undefined,
        avg_heart_rate: heartRate ? parseInt(heartRate) : undefined
      });
    } else {
      onAddActivity({
        id: Date.now().toString(),
        activity_date: formattedDate,
        source: 'manual',
        activity_type: 'workout',
        title,
        duration_minutes: parseInt(duration) || 0,
        calories_burned: parseInt(calories) || 0,
        distance_km: distance ? parseFloat(distance) : undefined,
        avg_heart_rate: heartRate ? parseInt(heartRate) : undefined
      });
    }

    onClose();
  };

  return (
    <Box style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <Box style={{ background: '#121826', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '440px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', fontWeight: 800 }}>
          {activityToEdit ? 'Editar Entrenamiento' : 'Registrar Entrenamiento Manual'}
        </h3>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Box style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', padding: '10px 12px', borderRadius: '10px' }}>
            <label style={{ fontSize: '0.8rem', color: '#10B981', fontWeight: 700, display: 'block', marginBottom: '4px' }}>📅 Fecha de la Actividad</label>
            <input
              type="date"
              required
              value={activityDate}
              onChange={(e) => setActivityDate(e.target.value)}
              style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(16,185,129,0.3)', color: '#FFF', padding: '8px 10px', borderRadius: '8px', fontSize: '0.88rem' }}
            />
          </Box>
          <Box>
            <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Título / Nombre de la Actividad *</label>
            <input
              type="text"
              required
              placeholder="Ej. Carrera continua, Gimnasio Fuerza..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '10px', borderRadius: '8px' }}
            />
          </Box>

          <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Box>
              <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Duración (minutos) *</label>
              <input
                type="number"
                required
                placeholder="Ej. 45"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '10px', borderRadius: '8px' }}
              />
            </Box>

            <Box>
              <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Calorías Quemadas (kcal) *</label>
              <input
                type="number"
                required
                placeholder="Ej. 350"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '10px', borderRadius: '8px' }}
              />
            </Box>
          </Box>

          <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Box>
              <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Distancia (km - Opcional)</label>
              <input
                type="number"
                step="0.1"
                placeholder="Ej. 6.5"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '10px', borderRadius: '8px' }}
              />
            </Box>

            <Box>
              <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>FC Media (bpm - Opcional)</label>
              <input
                type="number"
                placeholder="Ej. 145"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '10px', borderRadius: '8px' }}
              />
            </Box>
          </Box>

          <Box style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button type="button" onClick={onClose} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
              Cancelar
            </button>
            <button type="submit" style={{ background: '#10B981', color: '#FFF', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
              {activityToEdit ? 'Guardar Cambios' : 'Guardar Entrenamiento'}
            </button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};
