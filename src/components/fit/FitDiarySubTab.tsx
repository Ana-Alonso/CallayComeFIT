import React from 'react';
import { Trash2 } from 'lucide-react';
import { Box } from '../common';
import type { FitFoodLogItem, MealPlanDay } from '../../types';

interface FitDiarySubTabProps {
  foodLogs: FitFoodLogItem[];
  currentDayPlan?: MealPlanDay;
  currentDayNum?: number;
  onImportMealPlan?: () => void;
  onOpenAddFoodModal: (meal: 'breakfast' | 'lunch' | 'dinner' | 'snack') => void;
  onDeleteFood: (id: string) => void;
}

export const FitDiarySubTab: React.FC<FitDiarySubTabProps> = ({
  foodLogs,
  currentDayNum,
  onImportMealPlan,
  onOpenAddFoodModal,
  onDeleteFood
}) => {
  const mealTypes: Array<'breakfast' | 'lunch' | 'dinner' | 'snack'> = ['breakfast', 'lunch', 'dinner', 'snack'];
  const mealLabels: Record<string, string> = {
    breakfast: 'Desayuno',
    lunch: 'Comida / Almuerzo',
    dinner: 'Cena',
    snack: 'Snack / Merienda'
  };

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {onImportMealPlan && (
        <Box style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '14px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <Box>
            <strong style={{ color: '#60A5FA', display: 'block', fontSize: '0.95rem' }}>Planificador Diario Calla y Come</strong>
            <span style={{ fontSize: '0.82rem', color: '#94A3B8' }}>Importa automáticamente las recetas del Día {currentDayNum || 1} a tu diario Fit.</span>
          </Box>
          <button
            onClick={onImportMealPlan}
            style={{ background: '#3B82F6', color: '#FFF', border: 'none', padding: '8px 14px', borderRadius: '10px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
          >
            ⚡ Importar Comidas del Día {currentDayNum || 1}
          </button>
        </Box>
      )}

      <Box style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {mealTypes.map(meal => {
          const items = foodLogs.filter(f => f.meal_type === meal);
          const mealCalories = items.reduce((sum, i) => sum + i.calories, 0);

          return (
            <Box key={meal} style={{ background: '#121826', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '16px' }}>
              <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{mealLabels[meal]}</h3>
                <span style={{ fontSize: '0.85rem', color: '#10B981', fontWeight: 700 }}>{mealCalories} kcal</span>
              </Box>

              <Box style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                {items.length === 0 ? (
                  <p style={{ margin: 0, color: '#64748B', fontSize: '0.82rem', fontStyle: 'italic' }}>No hay alimentos registrados.</p>
                ) : (
                  items.map(item => (
                    <Box key={item.id} style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block' }}>{item.food_name}</span>
                        <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                          {item.calories} kcal | P: {item.protein_g}g | C: {item.carbs_g}g | G: {item.fat_g}g
                        </span>
                      </Box>

                      <button
                        onClick={() => onDeleteFood(item.id)}
                        style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #EF4444', color: '#EF4444', padding: '4px 6px', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </Box>
                  ))
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
