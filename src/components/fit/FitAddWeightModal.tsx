import React, { useState } from 'react';
import { Box } from '../common';
import type { FitWeightLogItem } from '../../types';

interface FitAddWeightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWeightLog: (log: FitWeightLogItem) => void;
}

export const FitAddWeightModal: React.FC<FitAddWeightModalProps> = ({
  isOpen,
  onClose,
  onAddWeightLog
}) => {
  const [newWeightKg, setNewWeightKg] = useState('');
  const [newMuscleMassKg, setNewMuscleMassKg] = useState('');
  const [newFatPct, setNewFatPct] = useState('');
  const [newWaistCm, setNewWaistCm] = useState('');
  const [newWeightNotes, setNewWeightNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeightKg) return;

    onAddWeightLog({
      id: Date.now().toString(),
      log_date: new Date().toISOString().split('T')[0],
      weight_kg: parseFloat(newWeightKg),
      muscle_mass_kg: newMuscleMassKg ? parseFloat(newMuscleMassKg) : undefined,
      fat_percentage: newFatPct ? parseFloat(newFatPct) : undefined,
      waist_cm: newWaistCm ? parseFloat(newWaistCm) : undefined,
      notes: newWeightNotes.trim() || undefined
    });

    onClose();
    setNewWeightKg('');
    setNewMuscleMassKg('');
    setNewFatPct('');
    setNewWaistCm('');
    setNewWeightNotes('');
  };

  return (
    <Box style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <Box style={{ background: '#121826', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '440px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', fontWeight: 800 }}>Registrar Pesaje / Métricas Corporales</h3>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Box>
            <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Peso Corporal (kg) *</label>
            <input
              type="number"
              step="0.1"
              required
              placeholder="Ej. 67.5"
              value={newWeightKg}
              onChange={(e) => setNewWeightKg(e.target.value)}
              style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '10px', borderRadius: '8px' }}
            />
          </Box>

          <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Box>
              <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Masa Muscular (kg)</label>
              <input
                type="number"
                step="0.1"
                placeholder="Ej. 29.0"
                value={newMuscleMassKg}
                onChange={(e) => setNewMuscleMassKg(e.target.value)}
                style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '10px', borderRadius: '8px' }}
              />
            </Box>
            <Box>
              <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Grasa (%)</label>
              <input
                type="number"
                step="0.1"
                placeholder="Ej. 21.5"
                value={newFatPct}
                onChange={(e) => setNewFatPct(e.target.value)}
                style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '10px', borderRadius: '8px' }}
              />
            </Box>
          </Box>

          <Box>
            <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Perímetro Cintura (cm)</label>
            <input
              type="number"
              step="0.5"
              placeholder="Ej. 75.5"
              value={newWaistCm}
              onChange={(e) => setNewWaistCm(e.target.value)}
              style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '10px', borderRadius: '8px' }}
            />
          </Box>

          <Box>
            <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Notas / Sensaciones</label>
            <input
              type="text"
              placeholder="Ej. Ayunas, tras entrenamiento, buena hidratación"
              value={newWeightNotes}
              onChange={(e) => setNewWeightNotes(e.target.value)}
              style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '10px', borderRadius: '8px' }}
            />
          </Box>

          <Box style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button type="button" onClick={onClose} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
              Cancelar
            </button>
            <button type="submit" style={{ background: '#10B981', color: '#FFF', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
              Guardar Pesaje
            </button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};
