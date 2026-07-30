import React from 'react';
import { Box } from '../common';
import type { FitUserProfile, MenstrualCyclePhase } from '../../types';
import { Heart, Activity, Sparkles, AlertCircle } from 'lucide-react';

interface FitFemaleHealthCardProps {
  userProfile: FitUserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<FitUserProfile>>;
}

export const FitFemaleHealthCard: React.FC<FitFemaleHealthCardProps> = ({
  userProfile,
  setUserProfile
}) => {
  if (userProfile.gender === 'male') return null;

  const currentPhase: MenstrualCyclePhase = userProfile.cycle_phase || 'follicular';
  const hasPCOS = Boolean(userProfile.has_pcos);

  const phaseDetails: Record<MenstrualCyclePhase, {
    name: string;
    icon: string;
    color: string;
    bgColor: string;
    borderColor: string;
    description: string;
    nutritionTip: string;
    workoutTip: string;
  }> = {
    menstrual: {
      name: 'Fase Menstrual (Días 1-5)',
      icon: '🩸',
      color: '#F87171',
      bgColor: 'rgba(239,68,68,0.1)',
      borderColor: 'rgba(239,68,68,0.3)',
      description: 'Niveles de estrógenos y progesterona en su punto más bajo. El cuerpo necesita restauración.',
      nutritionTip: 'Incrementa el consumo de Hierro (espinacas, legumbres) y Magnesio. Mantén una hidratación alta e infusiones antiinflamatorias.',
      workoutTip: 'Prioriza paseos, yoga, estiramientos y descanso activo sin forzar articulaciones.'
    },
    follicular: {
      name: 'Fase Folicular (Días 6-13)',
      icon: '🌱',
      color: '#34D399',
      bgColor: 'rgba(16,185,129,0.1)',
      borderColor: 'rgba(16,185,129,0.3)',
      description: 'Los estrógenos comienzan a subir. Mayor sensibilidad a la insulina y pico de energía ascendente.',
      nutritionTip: 'Momento ideal para carbohidratos complejos de absorción lenta. Excelente asimilación de glucógeno.',
      workoutTip: 'Fase idónea para entrenamientos intensos de fuerza, hipertrofia y cargas progresivas.'
    },
    ovulatory: {
      name: 'Fase Ovulatoria (Días 14-16)',
      icon: '🥚',
      color: '#FBBF24',
      bgColor: 'rgba(245,158,11,0.1)',
      borderColor: 'rgba(245,158,11,0.3)',
      description: 'Pico de estrógenos y testosterona. Máximo nivel de rendimiento y fuerza física.',
      nutritionTip: 'Aumenta el consumo de antioxidantes (frutos rojos) y mantén un aporte elevado de proteína de calidad.',
      workoutTip: 'Momento clave para buscar récords personales (PR) en fuerza y alta intensidad (HIIT).'
    },
    luteal: {
      name: 'Fase Lútea (Días 17-28)',
      icon: '🌙',
      color: '#C4B5FD',
      bgColor: 'rgba(139,92,246,0.1)',
      borderColor: 'rgba(139,92,246,0.3)',
      description: 'Progesterona dominante. Aumento del gasto calórico basal (aprox. +100 a 300 kcal/día).',
      nutritionTip: 'Prioriza grasas saludables (aguacate, frutos secos), fibra y magnesio para mitigar antojos.',
      workoutTip: 'Modera la intensidad si notas fatiga. Enfócate en fuerza sostenida y ejercicios de movilidad.'
    }
  };

  const activeInfo = phaseDetails[currentPhase];

  const handlePhaseChange = (phase: MenstrualCyclePhase) => {
    setUserProfile(prev => ({ ...prev, cycle_phase: phase }));
  };

  const handlePCOSChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setUserProfile(prev => ({ ...prev, has_pcos: checked }));
  };

  return (
    <Box style={{ background: '#121826', border: '1px solid rgba(236,72,153,0.25)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <Box style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Box style={{ background: 'rgba(236,72,153,0.15)', padding: '8px', borderRadius: '12px', color: '#F472B6', display: 'flex' }}>
            <Heart size={22} />
          </Box>
          <Box>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#FFF' }}>Salud Femenina, Ciclo Hormonal & SOP</h3>
            <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Adaptación nutricional y de entrenamiento según tu fisiología.</span>
          </Box>
        </Box>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: hasPCOS ? 'rgba(236,72,153,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${hasPCOS ? '#F472B6' : 'rgba(255,255,255,0.1)'}`, padding: '6px 12px', borderRadius: '10px', transition: 'all 0.2s' }}>
          <input
            type="checkbox"
            checked={hasPCOS}
            onChange={handlePCOSChange}
            style={{ accentColor: '#EC4899', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: hasPCOS ? '#F472B6' : '#94A3B8' }}>
            🌸 Adaptar para SOP / SOMP
          </span>
        </label>
      </Box>

      <Box>
        <label style={{ fontSize: '0.8rem', color: '#CBD5E1', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
          Selecciona tu Fase Actual del Ciclo Menstrual:
        </label>

        <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
          {(['menstrual', 'follicular', 'ovulatory', 'luteal'] as MenstrualCyclePhase[]).map((phaseKey) => {
            const p = phaseDetails[phaseKey];
            const isSelected = currentPhase === phaseKey;

            return (
              <button
                key={phaseKey}
                type="button"
                onClick={() => handlePhaseChange(phaseKey)}
                style={{
                  background: isSelected ? p.color : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isSelected ? p.color : 'rgba(255,255,255,0.08)'}`,
                  color: isSelected ? '#121826' : '#E2E8F0',
                  padding: '10px 8px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: isSelected ? `0 4px 15px ${p.color}40` : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <span>{p.icon}</span> {p.name.split(' ')[1]}
              </button>
            );
          })}
        </Box>
      </Box>

      <Box style={{ background: activeInfo.bgColor, border: `1px solid ${activeInfo.borderColor}`, borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.2rem' }}>{activeInfo.icon}</span>
          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: activeInfo.color }}>
            {activeInfo.name}
          </h4>
        </Box>

        <p style={{ margin: 0, fontSize: '0.82rem', color: '#E2E8F0', lineHeight: 1.4 }}>
          {activeInfo.description}
        </p>

        <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginTop: '4px' }}>
          <Box style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 12px', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: activeInfo.color, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
              <Sparkles size={13} /> Nutrición Recomendada
            </span>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#CBD5E1', lineHeight: 1.35 }}>
              {activeInfo.nutritionTip}
            </p>
          </Box>

          <Box style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 12px', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: activeInfo.color, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
              <Activity size={13} /> Entrenamiento Sugerido
            </span>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#CBD5E1', lineHeight: 1.35 }}>
              {activeInfo.workoutTip}
            </p>
          </Box>
        </Box>
      </Box>

      {hasPCOS && (
        <Box style={{ background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.3)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} style={{ color: '#F472B6' }} />
            <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#F472B6' }}>
              Pauta Nutricional y Estilo de Vida Adaptado para SOP / SOMP
            </h4>
          </Box>

          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
            <Box style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 10px', borderRadius: '8px' }}>
              <strong style={{ fontSize: '0.75rem', color: '#F472B6', display: 'block' }}>🥖 Control de Insulina</strong>
              <span style={{ fontSize: '0.74rem', color: '#94A3B8' }}>Prioriza carbohidratos de bajo índice glucémico (legumbres, avena integral, vegetales).</span>
            </Box>

            <Box style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 10px', borderRadius: '8px' }}>
              <strong style={{ fontSize: '0.75rem', color: '#F472B6', display: 'block' }}>🧪 Suplementación Clave</strong>
              <span style={{ fontSize: '0.74rem', color: '#94A3B8' }}>Considerar Mio-Inositol (40:1), Berberina, Magnesio Bisglicinato y Omega-3 bajo supervisión.</span>
            </Box>

            <Box style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 10px', borderRadius: '8px' }}>
              <strong style={{ fontSize: '0.75rem', color: '#F472B6', display: 'block' }}>🧘 Control del Cortisol</strong>
              <span style={{ fontSize: '0.74rem', color: '#94A3B8' }}>Evita sesiones exhaustivas de cardio sin descanso. Da prioridad a la fuerza y paseos.</span>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};
