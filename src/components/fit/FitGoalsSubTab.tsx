import React from 'react';
import { Save } from 'lucide-react';
import { Box } from '../common';
import type { FitUserProfile } from '../../types';
import { FitFemaleHealthCard } from './FitFemaleHealthCard';

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
  const targetKcal = userProfile.daily_calorie_target || metabolicStats.target;

  const proteinPct = userProfile.custom_protein_pct || 30;
  const carbPct = userProfile.custom_carb_pct || 40;
  const fatPct = userProfile.custom_fat_pct || 30;

  const targetProteinGrams = Math.round((targetKcal * (proteinPct / 100)) / 4);
  const targetCarbsGrams = Math.round((targetKcal * (carbPct / 100)) / 4);
  const targetFatGrams = Math.round((targetKcal * (fatPct / 100)) / 9);

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

      {/* Metabolismo y Plantillas / Sliders */}
      <Box style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Box style={{ background: '#121826', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700 }}>Metabolismo y Distribución Objetivo</h3>

          <Box style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
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

        {/* Plantillas & Sliders de Macronutrientes */}
        <Box style={{ background: '#121826', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700 }}>Plantillas & Sliders de Macronutrientes</h3>

          <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
            <button
              onClick={() => setUserProfile(prev => ({ ...prev, macro_preset: 'high_protein', custom_protein_pct: 40, custom_carb_pct: 35, custom_fat_pct: 25 }))}
              style={{ background: userProfile.macro_preset === 'high_protein' ? 'rgba(16,185,129,0.15)' : 'rgba(0,0,0,0.25)', border: `1px solid ${userProfile.macro_preset === 'high_protein' ? '#10B981' : 'rgba(255,255,255,0.1)'}`, color: '#FFF', padding: '10px', borderRadius: '10px', textAlign: 'left', cursor: 'pointer' }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Alta en Proteína 🥩</div>
              <div style={{ color: '#94A3B8', fontSize: '0.72rem' }}>40P / 35C / 25F</div>
            </button>

            <button
              onClick={() => setUserProfile(prev => ({ ...prev, macro_preset: 'balanced', custom_protein_pct: 30, custom_carb_pct: 40, custom_fat_pct: 30 }))}
              style={{ background: userProfile.macro_preset === 'balanced' ? 'rgba(16,185,129,0.15)' : 'rgba(0,0,0,0.25)', border: `1px solid ${userProfile.macro_preset === 'balanced' ? '#10B981' : 'rgba(255,255,255,0.1)'}`, color: '#FFF', padding: '10px', borderRadius: '10px', textAlign: 'left', cursor: 'pointer' }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Equilibrada ⚖️</div>
              <div style={{ color: '#94A3B8', fontSize: '0.72rem' }}>30P / 40C / 30F</div>
            </button>

            <button
              onClick={() => setUserProfile(prev => ({ ...prev, macro_preset: 'low_carb', custom_protein_pct: 45, custom_carb_pct: 20, custom_fat_pct: 35 }))}
              style={{ background: userProfile.macro_preset === 'low_carb' ? 'rgba(16,185,129,0.15)' : 'rgba(0,0,0,0.25)', border: `1px solid ${userProfile.macro_preset === 'low_carb' ? '#10B981' : 'rgba(255,255,255,0.1)'}`, color: '#FFF', padding: '10px', borderRadius: '10px', textAlign: 'left', cursor: 'pointer' }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Baja en Carb 🥑</div>
              <div style={{ color: '#94A3B8', fontSize: '0.72rem' }}>45P / 20C / 35F</div>
            </button>

            <button
              onClick={() => setUserProfile(prev => ({ ...prev, macro_preset: 'custom' }))}
              style={{ background: userProfile.macro_preset === 'custom' ? 'rgba(16,185,129,0.15)' : 'rgba(0,0,0,0.25)', border: `1px solid ${userProfile.macro_preset === 'custom' ? '#10B981' : 'rgba(255,255,255,0.1)'}`, color: '#FFF', padding: '10px', borderRadius: '10px', textAlign: 'left', cursor: 'pointer' }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Personalizada ⚙️</div>
              <div style={{ color: '#94A3B8', fontSize: '0.72rem' }}>Sliders Libres</div>
            </button>
          </Box>

          <Box style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Box>
              <Box style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '2px' }}>
                <span>Proteínas 🥩 ({proteinPct}%)</span>
                <span>{targetProteinGrams}g</span>
              </Box>
              <input
                type="range"
                min="10" max="70" step="5"
                value={proteinPct}
                onChange={(e) => setUserProfile(prev => ({ ...prev, macro_preset: 'custom', custom_protein_pct: parseInt(e.target.value) }))}
                style={{ width: '100%', accentColor: '#10B981' }}
              />
            </Box>

            <Box>
              <Box style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '2px' }}>
                <span>Carbohidratos 🍚 ({carbPct}%)</span>
                <span>{targetCarbsGrams}g</span>
              </Box>
              <input
                type="range"
                min="5" max="70" step="5"
                value={carbPct}
                onChange={(e) => setUserProfile(prev => ({ ...prev, macro_preset: 'custom', custom_carb_pct: parseInt(e.target.value) }))}
                style={{ width: '100%', accentColor: '#3B82F6' }}
              />
            </Box>

            <Box>
              <Box style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '2px' }}>
                <span>Grasas 🥑 ({fatPct}%)</span>
                <span>{targetFatGrams}g</span>
              </Box>
              <input
                type="range"
                min="10" max="60" step="5"
                value={fatPct}
                onChange={(e) => setUserProfile(prev => ({ ...prev, macro_preset: 'custom', custom_fat_pct: parseInt(e.target.value) }))}
                style={{ width: '100%', accentColor: '#F59E0B' }}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      {userProfile.gender !== 'male' && (
        <Box style={{ gridColumn: '1 / -1' }}>
          <FitFemaleHealthCard
            userProfile={userProfile}
            setUserProfile={setUserProfile}
          />
        </Box>
      )}
    </Box>
  );
};
