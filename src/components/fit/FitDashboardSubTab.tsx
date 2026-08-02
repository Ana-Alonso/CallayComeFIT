import React from 'react';
import { Droplet, Moon, Edit2, Trash2, TrendingUp, Award, Flame, CheckCircle2 } from 'lucide-react';
import { Box } from '../common';
import type { FitUserProfile, FitFoodLogItem, FitActivity } from '../../types';
import { FitFemaleHealthCard } from './FitFemaleHealthCard';

interface FitDashboardSubTabProps {
  userProfile: FitUserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<FitUserProfile>>;
  foodLogs: FitFoodLogItem[];
  activities: FitActivity[];
  onOpenAddActivityModal: (act?: FitActivity) => void;
  onRemoveActivity: (id: string) => void;
  onSelectSubTab: (tab: 'dashboard' | 'diary' | 'goals' | 'activity' | 'recipes' | 'progress') => void;
}

export const FitDashboardSubTab: React.FC<FitDashboardSubTabProps> = ({
  userProfile,
  setUserProfile,
  foodLogs,
  activities,
  onOpenAddActivityModal,
  onRemoveActivity,
  onSelectSubTab
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayActivities = activities.filter(act => {
    if (!act.activity_date) return false;
    const actDateStr = act.activity_date.split('T')[0];
    return actDateStr === todayStr;
  });

  const totalCaloriesConsumed = foodLogs.reduce((sum, item) => sum + item.calories, 0);
  const totalProteinConsumed = foodLogs.reduce((sum, item) => sum + item.protein_g, 0);
  const totalCarbsConsumed = foodLogs.reduce((sum, item) => sum + item.carbs_g, 0);
  const totalFatConsumed = foodLogs.reduce((sum, item) => sum + item.fat_g, 0);

  const totalCaloriesBurned = todayActivities.reduce((sum, item) => sum + item.calories_burned, 0);
  const netCalories = totalCaloriesConsumed - totalCaloriesBurned;
  const targetCalories = userProfile.daily_calorie_target || 2000;
  const remainingCalories = targetCalories - netCalories;

  const targetProtein = Math.round((targetCalories * 0.3) / 4);
  const targetCarbs = Math.round((targetCalories * 0.45) / 4);
  const targetFat = Math.round((targetCalories * 0.25) / 9);

  const isProteinMet = totalProteinConsumed >= targetProtein * 0.8;
  const isWaterMet = (userProfile.water_logged_ml || 0) >= 2000;

  const handleAddWater = (ml: number) => {
    setUserProfile(prev => ({ ...prev, water_logged_ml: (prev.water_logged_ml || 0) + ml }));
  };

  const handleResetWater = () => {
    setUserProfile(prev => ({ ...prev, water_logged_ml: 0 }));
  };

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 🏆 Widget de Racha y Medallas de Hábitos Fit */}
      <Box style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(249,115,22,0.1) 100%)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '16px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <Box style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(16,185,129,0.4)' }}>
            <Award size={22} color="#fff" />
          </div>
          <Box>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Racha Fit Activa <Flame size={16} color="#F97316" />
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Logros nutricionales de hoy</div>
          </Box>
        </Box>

        <Box style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, padding: '6px 12px', borderRadius: '999px', background: isProteinMet ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)', color: isProteinMet ? '#10B981' : '#64748b', border: isProteinMet ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={13} /> Proteína {isProteinMet ? '100%' : 'en curso'}
          </span>
          <span style={{ fontSize: '12px', fontWeight: 600, padding: '6px 12px', borderRadius: '999px', background: isWaterMet ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)', color: isWaterMet ? '#60A5FA' : '#64748b', border: isWaterMet ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Droplet size={13} /> Agua {isWaterMet ? '2L Logrados' : `${userProfile.water_logged_ml || 0} ml`}
          </span>
        </Box>
      </Box>
      <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <Box style={{ background: '#121826', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Resumen Calórico Hoy</h3>
              <p style={{ margin: '4px 0 0 0', color: '#94A3B8', fontSize: '0.8rem' }}>Meta diaria calculada</p>
            </Box>
            <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
              {targetCalories} kcal Meta
            </span>
          </Box>

          <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
            <Box>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Ingeridas</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10B981' }}>{totalCaloriesConsumed}</div>
            </Box>
            <Box style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Quemadas</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#F97316' }}>{totalCaloriesBurned}</div>
            </Box>
            <Box>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Restantes</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: remainingCalories >= 0 ? '#3B82F6' : '#EF4444' }}>
                {remainingCalories}
              </div>
            </Box>
          </Box>

          <Box style={{ background: 'rgba(0,0,0,0.2)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
            <Box
              style={{
                width: `${Math.min(100, Math.max(0, (netCalories / targetCalories) * 100))}%`,
                height: '100%',
                background: netCalories > targetCalories ? '#EF4444' : 'linear-gradient(90deg, #10B981, #3B82F6)',
                borderRadius: '5px'
              }}
            />
          </Box>
        </Box>

        <Box style={{ background: '#121826', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={20} style={{ color: '#10B981' }} /> Macronutrientes Diarios
          </h3>

          <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <Box style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', padding: '10px', borderRadius: '12px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#93C5FD', fontWeight: 700, display: 'block' }}>PROTEÍNAS</span>
              <strong style={{ fontSize: '1.2rem', color: '#FFF' }}>{totalProteinConsumed.toFixed(1)}g</strong>
              <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Meta: {targetProtein}g</div>
            </Box>

            <Box style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', padding: '10px', borderRadius: '12px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#FCD34D', fontWeight: 700, display: 'block' }}>CARBOS</span>
              <strong style={{ fontSize: '1.2rem', color: '#FFF' }}>{totalCarbsConsumed.toFixed(1)}g</strong>
              <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Meta: {targetCarbs}g</div>
            </Box>

            <Box style={{ background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.2)', padding: '10px', borderRadius: '12px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#FBCFE8', fontWeight: 700, display: 'block' }}>GRASAS</span>
              <strong style={{ fontSize: '1.2rem', color: '#FFF' }}>{totalFatConsumed.toFixed(1)}g</strong>
              <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Meta: {targetFat}g</div>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <Box style={{ background: '#121826', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
          <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Droplet size={20} style={{ color: '#3B82F6' }} />
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Registro de Agua</h3>
            </Box>

            <button
              onClick={handleResetWater}
              style={{ background: 'transparent', border: 'none', color: '#64748B', fontSize: '0.75rem', cursor: 'pointer' }}
            >
              Reiniciar
            </button>
          </Box>

          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#60A5FA' }}>
              {((userProfile.water_logged_ml || 0) / 1000).toFixed(1)} L
            </span>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
              Meta: {((userProfile.daily_water_target_ml || 2500) / 1000).toFixed(1)} L
            </span>
          </Box>

          <Box style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => handleAddWater(250)}
              style={{ flex: 1, background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', color: '#60A5FA', padding: '8px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
            >
              + 250 ml
            </button>
            <button
              onClick={() => handleAddWater(500)}
              style={{ flex: 1, background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', color: '#60A5FA', padding: '8px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
            >
              + 500 ml
            </button>
          </Box>
        </Box>

        <Box style={{ background: '#121826', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
          <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Moon size={20} style={{ color: '#8B5CF6' }} />
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Sueño Nocturno y Siesta</h3>
            </Box>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Meta: 8.0 h</span>
          </Box>

          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <Box>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#C4B5FD', display: 'block' }}>
                {((userProfile.sleep_logged_hours || 0) + (userProfile.nap_logged_hours || 0)).toFixed(1)} h
              </span>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Descanso Total Logrado</span>
            </Box>
          </Box>

          <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <Box>
              <label style={{ fontSize: '0.72rem', color: '#C4B5FD', display: 'block', marginBottom: '4px' }}>Sueño Nocturno (h)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="24"
                placeholder="Ej. 8.0"
                value={userProfile.sleep_logged_hours ?? ''}
                onChange={(e) => setUserProfile(prev => ({ ...prev, sleep_logged_hours: parseFloat(e.target.value) || 0 }))}
                style={{ width: '100%', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)', color: '#FFF', padding: '6px 8px', borderRadius: '8px', fontSize: '0.85rem' }}
              />
            </Box>

            <Box>
              <label style={{ fontSize: '0.72rem', color: '#FCD34D', display: 'block', marginBottom: '4px' }}>Siesta (h)</label>
              <input
                type="number"
                step="0.25"
                min="0"
                max="12"
                placeholder="Ej. 0.5"
                value={userProfile.nap_logged_hours ?? ''}
                onChange={(e) => setUserProfile(prev => ({ ...prev, nap_logged_hours: parseFloat(e.target.value) || 0 }))}
                style={{ width: '100%', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', color: '#FFF', padding: '6px 8px', borderRadius: '8px', fontSize: '0.85rem' }}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      <FitFemaleHealthCard
        userProfile={userProfile}
        setUserProfile={setUserProfile}
      />

      <Box style={{ background: '#121826', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Actividades del Día</h3>
          <button
            onClick={() => onSelectSubTab('activity')}
            style={{ background: 'transparent', border: 'none', color: '#10B981', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}
          >
            Ver todas →
          </button>
        </Box>

        {todayActivities.length === 0 ? (
          <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>No hay entrenamientos registrados hoy.</p>
        ) : (
          <Box style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {todayActivities.map((act) => (
              <Box key={act.id} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <strong style={{ display: 'block', fontSize: '0.95rem' }}>{act.title}</strong>
                  <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{act.duration_minutes} min | {act.calories_burned} kcal quemadas</span>
                </Box>

                <Box style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => onOpenAddActivityModal(act)}
                    style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#FFF', padding: '6px 8px', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => onRemoveActivity(act.id)}
                    style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #EF4444', color: '#EF4444', padding: '6px 8px', borderRadius: '8px', cursor: 'pointer' }}
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
