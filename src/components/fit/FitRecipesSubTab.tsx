import React from 'react';
import { Box } from '../common';
import type { Recipe } from '../../types';

interface FitRecipesSubTabProps {
  recipes: Recipe[];
  onAddRecipeToLog: (recipe: Recipe) => void;
}

export const FitRecipesSubTab: React.FC<FitRecipesSubTabProps> = ({
  recipes,
  onAddRecipeToLog
}) => {
  return (
    <Box>
      <h2 style={{ margin: '0 0 16px 0', fontSize: '1.4rem' }}>Recetas Calla y Come Adaptadas a Versión FIT</h2>

      <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {recipes.slice(0, 6).map(r => (
          <Box key={r.id} style={{ background: '#121826', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column' }}>
            <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ background: '#10B981', color: '#FFF', padding: '2px 8px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 800 }}>FIT ⚡</span>
              <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>{r.meal_type}</span>
            </Box>

            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>{r.name}</h3>
            <p style={{ color: '#94A3B8', fontSize: '0.82rem', flex: 1 }}>Adaptación Fit: Alta proteína magra, baja en aceites refinados y sustitución por queso batido 0%.</p>

            <button
              onClick={() => onAddRecipeToLog(r)}
              style={{ background: '#10B981', color: '#FFF', border: 'none', padding: '8px 12px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', marginTop: '12px' }}
            >
              + Añadir a mi Diario Nutricional
            </button>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
