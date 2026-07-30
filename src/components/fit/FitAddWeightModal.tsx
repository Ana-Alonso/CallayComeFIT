import React, { useState } from 'react';
import { Box } from '../common';
import type { FitWeightLogItem, FitUserProfile } from '../../types';

interface FitAddWeightModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: FitUserProfile;
  onAddWeightLog: (log: FitWeightLogItem) => void;
}

export const FitAddWeightModal: React.FC<FitAddWeightModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onAddWeightLog
}) => {
  const [logDate, setLogDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [weightKg, setWeightKg] = useState('');
  const [fatPct, setFatPct] = useState('');
  const [fatMassKg, setFatMassKg] = useState('');
  const [visceralFat, setVisceralFat] = useState('');
  const [bmi, setBmi] = useState('');
  const [fatFreeMassKg, setFatFreeMassKg] = useState('');
  const [musclePct, setMusclePct] = useState('');
  const [muscleMassKg, setMuscleMassKg] = useState('');
  const [bonePct, setBonePct] = useState('');
  const [boneKg, setBoneKg] = useState('');
  const [bodyWaterPct, setBodyWaterPct] = useState('');
  const [waistCm, setWaistCm] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleWeightChange = (val: string) => {
    setWeightKg(val);
    const weightNum = parseFloat(val);
    if (!weightNum) return;

    const fatNum = parseFloat(fatPct);
    if (fatNum) {
      const computedFatKg = (weightNum * (fatNum / 100)).toFixed(1);
      const computedFfm = (weightNum - parseFloat(computedFatKg)).toFixed(1);
      setFatMassKg(computedFatKg);
      setFatFreeMassKg(computedFfm);
    }

    if (userProfile?.height_cm) {
      const heightM = userProfile.height_cm / 100;
      const computedBmi = (weightNum / (heightM * heightM)).toFixed(1);
      setBmi(computedBmi);
    }
  };

  const handleFatPctChange = (val: string) => {
    setFatPct(val);
    const fatNum = parseFloat(val);
    const weightNum = parseFloat(weightKg);
    if (fatNum && weightNum) {
      const computedFatKg = (weightNum * (fatNum / 100)).toFixed(1);
      const computedFfm = (weightNum - parseFloat(computedFatKg)).toFixed(1);
      setFatMassKg(computedFatKg);
      setFatFreeMassKg(computedFfm);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weightKg) return;

    onAddWeightLog({
      id: Date.now().toString(),
      log_date: logDate || new Date().toISOString().split('T')[0],
      weight_kg: parseFloat(weightKg),
      fat_percentage: fatPct ? parseFloat(fatPct) : undefined,
      fat_mass_kg: fatMassKg ? parseFloat(fatMassKg) : undefined,
      visceral_fat: visceralFat ? parseFloat(visceralFat) : undefined,
      bmi: bmi ? parseFloat(bmi) : undefined,
      fat_free_mass_kg: fatFreeMassKg ? parseFloat(fatFreeMassKg) : undefined,
      muscle_percentage: musclePct ? parseFloat(musclePct) : undefined,
      muscle_mass_kg: muscleMassKg ? parseFloat(muscleMassKg) : undefined,
      bone_mineral_percentage: bonePct ? parseFloat(bonePct) : undefined,
      bone_mineral_kg: boneKg ? parseFloat(boneKg) : undefined,
      body_water_percentage: bodyWaterPct ? parseFloat(bodyWaterPct) : undefined,
      waist_cm: waistCm ? parseFloat(waistCm) : undefined,
      notes: notes.trim() || undefined
    });

    onClose();
    setLogDate(new Date().toISOString().split('T')[0]);
    setWeightKg('');
    setFatPct('');
    setFatMassKg('');
    setVisceralFat('');
    setBmi('');
    setFatFreeMassKg('');
    setMusclePct('');
    setMuscleMassKg('');
    setBonePct('');
    setBoneKg('');
    setBodyWaterPct('');
    setWaistCm('');
    setNotes('');
  };

  return (
    <Box style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <Box style={{ background: '#121826', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 style={{ margin: '0 0 6px 0', fontSize: '1.25rem', fontWeight: 800 }}>Registrar Composición Corporal Completa</h3>
        <p style={{ margin: '0 0 16px 0', color: '#94A3B8', fontSize: '0.82rem' }}>
          Introduce tus parámetros biométricos por fecha diaria (Báscula de bioimpedancia / inteligente).
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Box style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', padding: '12px', borderRadius: '10px', marginBottom: '4px' }}>
            <label style={{ fontSize: '0.8rem', color: '#10B981', fontWeight: 700, display: 'block', marginBottom: '6px' }}>📅 Fecha del Pesaje / Medición</label>
            <input
              type="date"
              required
              value={logDate}
              onChange={(e) => setLogDate(e.target.value)}
              style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(16,185,129,0.4)', color: '#FFF', padding: '10px 12px', borderRadius: '8px', fontSize: '0.9rem' }}
            />
          </Box>
          <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <Box>
              <label style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Peso (kg) *</label>
              <input
                type="number"
                step="0.1"
                required
                placeholder="Ej. 68.5"
                value={weightKg}
                onChange={(e) => handleWeightChange(e.target.value)}
                style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(16,185,129,0.3)', color: '#FFF', padding: '8px 10px', borderRadius: '8px' }}
              />
            </Box>
            <Box>
              <label style={{ fontSize: '0.78rem', color: '#F59E0B', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Grasa (%)</label>
              <input
                type="number"
                step="0.1"
                placeholder="Ej. 21.5"
                value={fatPct}
                onChange={(e) => handleFatPctChange(e.target.value)}
                style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '8px 10px', borderRadius: '8px' }}
              />
            </Box>
            <Box>
              <label style={{ fontSize: '0.78rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Grasa (kg)</label>
              <input
                type="number"
                step="0.1"
                placeholder="Ej. 14.7"
                value={fatMassKg}
                onChange={(e) => setFatMassKg(e.target.value)}
                style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '8px 10px', borderRadius: '8px' }}
              />
            </Box>
          </Box>

          <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <Box>
              <label style={{ fontSize: '0.78rem', color: '#EF4444', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Grasa Visceral</label>
              <input
                type="number"
                step="1"
                placeholder="Ej. 4"
                value={visceralFat}
                onChange={(e) => setVisceralFat(e.target.value)}
                style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '8px 10px', borderRadius: '8px' }}
              />
            </Box>
            <Box>
              <label style={{ fontSize: '0.78rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>IMC (kg/m²)</label>
              <input
                type="number"
                step="0.1"
                placeholder="Ej. 23.2"
                value={bmi}
                onChange={(e) => setBmi(e.target.value)}
                style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '8px 10px', borderRadius: '8px' }}
              />
            </Box>
            <Box>
              <label style={{ fontSize: '0.78rem', color: '#3B82F6', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Masa Libre Grasa (kg)</label>
              <input
                type="number"
                step="0.1"
                placeholder="Ej. 53.8"
                value={fatFreeMassKg}
                onChange={(e) => setFatFreeMassKg(e.target.value)}
                style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '8px 10px', borderRadius: '8px' }}
              />
            </Box>
          </Box>

          <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <Box>
              <label style={{ fontSize: '0.78rem', color: '#3B82F6', fontWeight: 700, display: 'block', marginBottom: '4px' }}>% Músculo (%)</label>
              <input
                type="number"
                step="0.1"
                placeholder="Ej. 42.5"
                value={musclePct}
                onChange={(e) => setMusclePct(e.target.value)}
                style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '8px 10px', borderRadius: '8px' }}
              />
            </Box>
            <Box>
              <label style={{ fontSize: '0.78rem', color: '#3B82F6', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Masa Muscular (kg)</label>
              <input
                type="number"
                step="0.1"
                placeholder="Ej. 29.1"
                value={muscleMassKg}
                onChange={(e) => setMuscleMassKg(e.target.value)}
                style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '8px 10px', borderRadius: '8px' }}
              />
            </Box>
            <Box>
              <label style={{ fontSize: '0.78rem', color: '#60A5FA', display: 'block', marginBottom: '4px' }}>Agua Corporal (%)</label>
              <input
                type="number"
                step="0.1"
                placeholder="Ej. 58.0"
                value={bodyWaterPct}
                onChange={(e) => setBodyWaterPct(e.target.value)}
                style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '8px 10px', borderRadius: '8px' }}
              />
            </Box>
          </Box>

          <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <Box>
              <label style={{ fontSize: '0.78rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>% Mineral Óseo (%)</label>
              <input
                type="number"
                step="0.1"
                placeholder="Ej. 4.2"
                value={bonePct}
                onChange={(e) => setBonePct(e.target.value)}
                style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '8px 10px', borderRadius: '8px' }}
              />
            </Box>
            <Box>
              <label style={{ fontSize: '0.78rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Mineral Óseo (kg)</label>
              <input
                type="number"
                step="0.1"
                placeholder="Ej. 2.9"
                value={boneKg}
                onChange={(e) => setBoneKg(e.target.value)}
                style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '8px 10px', borderRadius: '8px' }}
              />
            </Box>
            <Box>
              <label style={{ fontSize: '0.78rem', color: '#CBD5E1', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Cintura (cm)</label>
              <input
                type="number"
                step="0.5"
                placeholder="Ej. 75.0"
                value={waistCm}
                onChange={(e) => setWaistCm(e.target.value)}
                style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '8px 10px', borderRadius: '8px' }}
              />
            </Box>
          </Box>

          <Box>
            <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Notas / Sensaciones</label>
            <input
              type="text"
              placeholder="Ej. Ayunas, buena hidratación, pos-entreno..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '8px 10px', borderRadius: '8px' }}
            />
          </Box>

          <Box style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button type="button" onClick={onClose} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
              Cancelar
            </button>
            <button type="submit" style={{ background: '#10B981', color: '#FFF', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
              Guardar Métricas
            </button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};
