import React from 'react';
import { Calendar, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { Box } from '../common';
import type { FitFoodLogItem, MealPlanDay, Profile } from '../../types';

interface FitDiarySubTabProps {
  foodLogs: FitFoodLogItem[];
  profile?: Profile | null;
  currentDayPlan?: MealPlanDay;
  currentDayNum?: number;
  onImportMealPlan?: () => void;
  onOpenAddFoodModal: (meal: 'breakfast' | 'lunch' | 'dinner' | 'snack') => void;
  onOpenRegisterMacroModal: (name: string) => void;
  onOpenRecipeIngredientsMacroModal?: () => void;
  onDeleteFood: (id: string) => void;
}

export const FitDiarySubTab: React.FC<FitDiarySubTabProps> = ({
  foodLogs,
  profile,
  currentDayNum,
  onImportMealPlan,
  onOpenAddFoodModal,
  onOpenRegisterMacroModal,
  onOpenRecipeIngredientsMacroModal,
  onDeleteFood
}) => {
  const mealTypes: Array<'breakfast' | 'lunch' | 'dinner' | 'snack'> = ['breakfast', 'lunch', 'dinner', 'snack'];
  const mealLabels: Record<string, string> = {
    breakfast: 'Desayuno',
    lunch: 'Almuerzo / Comida',
    dinner: 'Cena',
    snack: 'Snacks & Suplementos'
  };

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {profile?.active_family_id && (
        <Box style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', padding: '12px 16px', borderRadius: '12px', fontSize: '0.82rem', color: '#93C5FD', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>👨‍👩‍👧‍👦 <strong>Modo Familia Activa</strong>: Tu diario Fit registra tus alimentos de forma personal para no modificar el menú compartido del planificador de tu familia.</span>
        </Box>
      )}

      {/* Cabecera y Botones Principales de Acción */}
      <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <Box>
          <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Diario Nutricional y Registro de Alimentos</h2>
          <span style={{ color: '#94A3B8', fontSize: '0.85rem' }}>Organiza tu nutrición diaria y sincroniza con Calla y Come.</span>
        </Box>

        <Box style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {onImportMealPlan && (
            <button
              onClick={onImportMealPlan}
              style={{ background: 'linear-gradient(135deg, #10B981, #059669)', color: '#FFF', border: 'none', padding: '10px 16px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 15px rgba(16,185,129,0.3)' }}
            >
              <Calendar size={16} /> Importar Menú Planificado (Día {currentDayNum || 1})
            </button>
          )}

          <button
            onClick={() => onOpenAddFoodModal('breakfast')}
            style={{ background: 'rgba(255,255,255,0.06)', color: '#FFF', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 16px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} /> Añadir Alimento
          </button>

          {onOpenRecipeIngredientsMacroModal && (
            <button
              onClick={onOpenRecipeIngredientsMacroModal}
              style={{ background: 'rgba(245,158,11,0.15)', color: '#FBBF24', border: '1px solid rgba(245,158,11,0.3)', padding: '10px 16px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              ✍️ Macros de Ingredientes sin Registro
            </button>
          )}

          <button
            onClick={() => onOpenRegisterMacroModal('')}
            style={{ background: 'rgba(59,130,246,0.15)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.3)', padding: '10px 16px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ShoppingCart size={16} /> Registrar Macros en SuperMarketAPI
          </button>
        </Box>
      </Box>

      {/* Grid de Secciones de Comidas */}
      <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {mealTypes.map(meal => {
          const items = foodLogs.filter(f => f.meal_type === meal);
          const mealCalories = items.reduce((sum, i) => sum + i.calories, 0);

          return (
            <Box key={meal} style={{ background: '#121826', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column' }}>
              <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{mealLabels[meal]}</h3>
                <span style={{ fontSize: '0.9rem', color: '#10B981', fontWeight: 800 }}>{mealCalories} kcal</span>
              </Box>

              <Box style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px', flex: 1 }}>
                {items.length === 0 ? (
                  <p style={{ margin: 0, color: '#64748B', fontSize: '0.82rem', fontStyle: 'italic' }}>No hay alimentos registrados.</p>
                ) : (
                  items.map(item => {
                    const hasNoMacros = item.calories === 0 && item.protein_g === 0 && item.carbs_g === 0 && item.fat_g === 0;

                    return (
                      <Box key={item.id} style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <span style={{ fontWeight: 600, fontSize: '0.88rem', display: 'block' }}>{item.food_name}</span>
                          {hasNoMacros ? (
                            <span style={{ fontSize: '0.75rem', color: '#F87171' }}>
                              ⚠️ Sin macros en BD (Registra sus ingredientes)
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                              🥩 {item.protein_g}g P • 🍚 {item.carbs_g}g C • 🥑 {item.fat_g}g G
                            </span>
                          )}
                        </Box>

                        <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.88rem', color: hasNoMacros ? '#94A3B8' : '#FFF' }}>{item.calories} kcal</span>
                          <button
                            onClick={() => onDeleteFood(item.id)}
                            style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </Box>
                      </Box>
                    );
                  })
                )}
              </Box>

              <button
                onClick={() => onOpenAddFoodModal(meal)}
                style={{ background: 'transparent', border: '1px dashed rgba(255,255,255,0.15)', color: '#94A3B8', padding: '8px', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', width: '100%' }}
              >
                + Añadir a {mealLabels[meal]}
              </button>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};
