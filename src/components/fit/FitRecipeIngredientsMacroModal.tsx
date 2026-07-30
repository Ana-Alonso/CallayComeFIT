import React, { useState, useEffect } from 'react';
import { Box } from '../common';
import type { Recipe } from '../../types';
import { getProductMacros, saveSupermarketProductMacros, type SuperMarketProductMacro } from '../../services/supermarket_api';

interface FitRecipeIngredientsMacroModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipes: Recipe[];
}

export const FitRecipeIngredientsMacroModal: React.FC<FitRecipeIngredientsMacroModalProps> = ({
  isOpen,
  onClose,
  recipes
}) => {
  const [selectedRecipeId, setSelectedRecipeId] = useState<number>(recipes[0]?.id || 1);
  const [selectedIngredient, setSelectedIngredient] = useState<string>('');
  const [kcal, setKcal] = useState<string>('120');
  const [protein, setProtein] = useState<string>('10');
  const [carbs, setCarbs] = useState<string>('15');
  const [fat, setFat] = useState<string>('4');
  const [supermarket, setSupermarket] = useState<string>('Mercadona');

  const currentRecipe = recipes.find(r => r.id === Number(selectedRecipeId)) || recipes[0];
  const missingIngredients = currentRecipe?.ingredients?.filter(ing => !getProductMacros(ing.name)) || [];

  const handleSelectIngredient = (ingName: string) => {
    setSelectedIngredient(ingName);

    const supers = ['Mercadona', 'Aldi', 'Carrefour', 'Lidl', 'Dia', 'Eroski'];
    let existing: SuperMarketProductMacro | null = null;

    for (const s of supers) {
      const match = getProductMacros(ingName, s);
      if (match) {
        existing = match;
        break;
      }
    }

    if (existing) {
      setKcal(existing.calories.toString());
      setProtein(existing.protein_g.toString());
      setCarbs(existing.carbs_g.toString());
      setFat(existing.fat_g.toString());
      setSupermarket(existing.supermercado || 'Mercadona');
    } else {
      setKcal('120');
      setProtein('10');
      setCarbs('15');
      setFat('4');
      setSupermarket(prev => prev || 'Mercadona');
    }
  };

  useEffect(() => {
    if (missingIngredients.length > 0) {
      handleSelectIngredient(missingIngredients[0].name);
    } else {
      setSelectedIngredient('');
    }
  }, [selectedRecipeId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIngredient) {
      alert('Selecciona un ingrediente sin macros para registrar.');
      return;
    }

    const macroObj: SuperMarketProductMacro = {
      nombre: selectedIngredient,
      supermercado: supermarket || 'Mercadona',
      calories: parseInt(kcal) || 0,
      protein_g: parseFloat(protein) || 0,
      carbs_g: parseFloat(carbs) || 0,
      fat_g: parseFloat(fat) || 0,
      unit: '100g'
    };

    await saveSupermarketProductMacros(macroObj);
    alert(`¡Macros de "${selectedIngredient}" (${supermarket}) guardados correctamente en la base de datos!`);

    const remainingMissing = currentRecipe?.ingredients?.filter(ing => !getProductMacros(ing.name) && ing.name.toLowerCase() !== selectedIngredient.toLowerCase()) || [];
    if (remainingMissing.length > 0) {
      handleSelectIngredient(remainingMissing[0].name);
    } else {
      onClose();
    }
  };

  return (
    <Box style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <Box style={{ background: '#121826', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', fontWeight: 800 }}>✍️ Registrar Macros de Ingredientes de Recetas</h3>
        <p style={{ margin: '0 0 16px 0', color: '#94A3B8', fontSize: '0.82rem' }}>
          Selecciona un ingrediente sin macronutrientes para autocompletar su nombre y supermercado.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Box>
            <label style={{ fontSize: '0.8rem', color: '#60A5FA', fontWeight: 700, display: 'block', marginBottom: '4px' }}>1. Seleccionar Receta</label>
            <select
              value={selectedRecipeId}
              onChange={(e) => setSelectedRecipeId(Number(e.target.value))}
              style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '10px 12px', borderRadius: '8px' }}
            >
              {recipes.map(r => {
                const missingCount = r.ingredients?.filter(ing => !getProductMacros(ing.name)).length || 0;
                return (
                  <option key={r.id} value={r.id}>
                    📖 {r.name} {missingCount > 0 ? `(⚠️ ${missingCount} sin macro)` : '(✅ Completa)'}
                  </option>
                );
              })}
            </select>
          </Box>

          {currentRecipe && (
            <Box>
              <label style={{ fontSize: '0.8rem', color: '#FCD34D', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                2. Ingredientes Pendientes de Registro ({missingIngredients.length})
              </label>

              {missingIngredients.length === 0 ? (
                <Box style={{ padding: '12px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', color: '#A7F3D0', fontSize: '0.85rem' }}>
                  ✅ ¡Excelente! Todos los ingredientes de esta receta tienen sus macronutrientes registrados.
                </Box>
              ) : (
                <Box style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '120px', overflowY: 'auto', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px' }}>
                  {missingIngredients.map((ing, idx) => {
                    const isSelected = selectedIngredient.toLowerCase() === ing.name.toLowerCase();

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectIngredient(ing.name)}
                        style={{
                          background: isSelected ? '#10B981' : 'rgba(239,68,68,0.18)',
                          border: `1px solid ${isSelected ? '#10B981' : 'rgba(239,68,68,0.4)'}`,
                          color: isSelected ? '#FFF' : '#FCA5A5',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        ⚠️ {ing.name}
                      </button>
                    );
                  })}
                </Box>
              )}
            </Box>
          )}

          {selectedIngredient && (
            <>
              <Box>
                <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Nombre del Ingrediente a Registrar</label>
                <input
                  type="text"
                  required
                  value={selectedIngredient}
                  onChange={(e) => setSelectedIngredient(e.target.value)}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '8px 12px', borderRadius: '8px' }}
                />
              </Box>

              <Box>
                <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Supermercado / Marca</label>
                <select
                  value={supermarket}
                  onChange={(e) => setSupermarket(e.target.value)}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '8px 12px', borderRadius: '8px' }}
                >
                  <option value="Mercadona">Mercadona</option>
                  <option value="Aldi">Aldi</option>
                  <option value="Carrefour">Carrefour</option>
                  <option value="Lidl">Lidl</option>
                  <option value="Dia">Dia</option>
                  <option value="Eroski">Eroski</option>
                </select>
              </Box>

              <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
                <Box>
                  <label style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Kcal / 100g</label>
                  <input
                    type="number"
                    required
                    value={kcal}
                    onChange={(e) => setKcal(e.target.value)}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '6px 8px', borderRadius: '6px' }}
                  />
                </Box>
                <Box>
                  <label style={{ fontSize: '0.72rem', color: '#60A5FA', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Proteína (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '6px 8px', borderRadius: '6px' }}
                  />
                </Box>
                <Box>
                  <label style={{ fontSize: '0.72rem', color: '#FCD34D', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Carbos (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '6px 8px', borderRadius: '6px' }}
                  />
                </Box>
                <Box>
                  <label style={{ fontSize: '0.72rem', color: '#FBCFE8', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Grasa (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={fat}
                    onChange={(e) => setFat(e.target.value)}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '6px 8px', borderRadius: '6px' }}
                  />
                </Box>
              </Box>
            </>
          )}

          <Box style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button type="button" onClick={onClose} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
              Cancelar
            </button>

            {selectedIngredient && (
              <button type="submit" style={{ background: '#10B981', color: '#FFF', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                Guardar Macros del Ingrediente
              </button>
            )}
          </Box>
        </form>
      </Box>
    </Box>
  );
};
