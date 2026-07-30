import React from 'react';
import { Save } from 'lucide-react';
import { Box } from '../common';
import type { FitUserProfile } from '../../types';

interface FitGoalsSubTabProps {
  userProfile: FitUserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<FitUserProfile>>;
}

export const FitGoalsSubTab: React.FC<FitGoalsSubTabProps> = ({
  userProfile,
  setUserProfile
}) => {
  const calculateMetabolicRates = () => {
    const { current_weight_kg, height_cm, age, gender, activity_level, fitness_goal } = userProfile;
    let bmr = (10 * current_weight_kg) + (6.25 * height_cm) - (5 * age);
    bmr += gender === 'male' ? 5 : -161;

    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };

    const tdee = Math.round(bmr * (activityMultipliers[activity_level] || 1.375));
    let target = tdee;
    if (fitness_goal === 'fat_loss') target = Math.round(tdee * 0.82);
    if (fitness_goal === 'muscle_gain') target = Math.round(tdee * 1.12);

    return { bmr: Math.round(bmr), tdee, target };
  };

  const metabolicStats = calculateMetabolicRates();

  return (
    <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
      <Box style={{ background: '#121826', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700 }}>Calculadora Metabólica (Mifflin-St Jeor)</h3>

        <Box style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Box>
            <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Edad</label>
            <input
              type="number"
              value={userProfile.age}
              onChange={(e) => setUserProfile(prev => ({ ...prev, age: parseInt(e.target.value) || 25 }))}
              style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '8px 12px', borderRadius: '8px' }}
            />
          </Box>

          <Box>
            <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Sexo Biológico</label>
            <select
              value={userProfile.gender}
              onChange={(e) => setUserProfile(prev => ({ ...prev, gender: e.target.value as any }))}
              style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '8px 12px', borderRadius: '8px' }}
            >
              <option value="female">Femenino</option>
              <option value="male">Masculino</option>
            </select>
          </Box>

          <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Box>
              <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Altura (cm)</label>
              <input
                type="number"
                value={userProfile.height_cm}
                onChange={(e) => setUserProfile(prev => ({ ...prev, height_cm: parseFloat(e.target.value) || 165 }))}
                style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '8px 12px', borderRadius: '8px' }}
              />
            </Box>
            <Box>
              <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Peso Actual (kg)</label>
              <input
                type="number"
                value={userProfile.current_weight_kg}
                onChange={(e) => setUserProfile(prev => ({ ...prev, current_weight_kg: parseFloat(e.target.value) || 68 }))}
                style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '8px 12px', borderRadius: '8px' }}
              />
            </Box>
          </Box>

          <Box>
            <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Nivel de Actividad Diaria</label>
            <select
              value={userProfile.activity_level}
              onChange={(e) => setUserProfile(prev => ({ ...prev, activity_level: e.target.value as any }))}
              style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '8px 12px', borderRadius: '8px' }}
            >
              <option value="sedentary">Sedentario (Oficina, poco movimiento)</option>
              <option value="light">Ligero (1-3 días de ejercicio/semana)</option>
              <option value="moderate">Moderado (3-5 días de ejercicio/semana)</option>
              <option value="active">Activo (6-7 días de entrenamiento intenso)</option>
              <option value="very_active">Atleta / Trabajo físico pesado</option>
            </select>
          </Box>

          <Box>
            <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Objetivo Fit Principal</label>
            <select
              value={userProfile.fitness_goal}
              onChange={(e) => setUserProfile(prev => ({ ...prev, fitness_goal: e.target.value as any }))}
              style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '8px 12px', borderRadius: '8px' }}
            >
              <option value="fat_loss">Perder Grasa (Déficit Calórico Moderado)</option>
              <option value="maintenance">Mantenimiento y Recomposición Corporal</option>
              <option value="muscle_gain">Ganar Masa Muscular (Superávit Calórico)</option>
            </select>
          </Box>
        </Box>
      </Box>

      <Box style={{ background: '#121826', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Box>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700 }}>Metabolismo y Distribución Objetivo</h3>

          <Box style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            <Box style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Tasa Metabólica Basal (BMR):</span>
              <strong style={{ color: '#FFF' }}>{metabolicStats.bmr} kcal/día</strong>
            </Box>
            <Box style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Gasto Calórico Total (TDEE):</span>
              <strong style={{ color: '#FFF' }}>{metabolicStats.tdee} kcal/día</strong>
            </Box>
            <Box style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '14px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', color: '#10B981', fontWeight: 700 }}>Meta Diaria Recomendada:</span>
              <strong style={{ fontSize: '1.3rem', color: '#10B981' }}>{metabolicStats.target} kcal</strong>
            </Box>
          </Box>

          <button
            onClick={() => setUserProfile(prev => ({ ...prev, daily_calorie_target: metabolicStats.target }))}
            style={{ width: '100%', background: '#10B981', color: '#FFF', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <Save size={18} /> Aplicar Meta Metabólica ({metabolicStats.target} kcal)
          </button>
        </Box>
      </Box>
    </Box>
  );
};
