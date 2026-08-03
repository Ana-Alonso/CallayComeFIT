import React, { useState } from 'react';
import { Box } from '../common';
import type { Recipe, FitFoodLogItem } from '../../types';
import { searchProducts, getProductMacros, getRecipeSuperMarketMacros, type SuperMarketProduct, type SuperMarketProductMacro } from '../../services/supermarket_api';
import { get_current_planner_day } from '../../utils/planner_helpers';
import type { Profile } from '../../types';

interface FitAddFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recipes: Recipe[];
  profile?: Profile | null;
  startDate?: string | null;
  onAddFoodLog: (item: FitFoodLogItem) => void;
  onAssignRecipe?: (dayNum: number, mealType: 'desayuno' | 'comida' | 'cena', index: number, recipeId: number) => void;
  onOpenRegisterMacroModal: (name: string) => void;
}

export const FitAddFoodModal: React.FC<FitAddFoodModalProps> = ({
  isOpen,
  onClose,
  mealType,
  recipes,
  profile,
  startDate,
  onAddFoodLog,
  onAssignRecipe,
  onOpenRegisterMacroModal
}) => {
  const [newFoodName, setNewFoodName] = useState('');
  const [newFoodServings, setNewFoodServings] = useState(1);
  const [newFoodKcal, setNewFoodKcal] = useState('');
  const [newFoodProtein, setNewFoodProtein] = useState('');
  const [newFoodCarbs, setNewFoodCarbs] = useState('');
  const [newFoodFat, setNewFoodFat] = useState('');

  const [selectedBaseFood, setSelectedBaseFood] = useState<SuperMarketProductMacro | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showFoodSuggestions, setShowFoodSuggestions] = useState(false);
  const [supermarketSearchResults, setSupermarketSearchResults] = useState<SuperMarketProduct[]>([]);

  if (!isOpen) return null;

  const handleFoodNameChange = async (query: string) => {
    setNewFoodName(query);
    setShowFoodSuggestions(true);

    if (!query.trim() || query.length < 2) {
      setSupermarketSearchResults([]);
      return;
    }

    const macroMatch = getProductMacros(query, 'Mercadona');
    if (macroMatch) {
      setSelectedBaseFood(macroMatch);
      const servings = Number(newFoodServings) || 1;
      setNewFoodKcal(Math.round(macroMatch.calories * servings).toString());
      setNewFoodProtein((macroMatch.protein_g * servings).toFixed(1));
      setNewFoodCarbs((macroMatch.carbs_g * servings).toFixed(1));
      setNewFoodFat((macroMatch.fat_g * servings).toFixed(1));
    }

    try {
      const apiResults = await searchProducts(query);
      setSupermarketSearchResults(apiResults.slice(0, 5));
    } catch {
      setSupermarketSearchResults([]);
    }
  };

  const selectRecipeSuggestion = (r: Recipe) => {
    setSelectedRecipe(r);
    setNewFoodName(r.name);

    const apiMacros = getRecipeSuperMarketMacros(r);
    const baseKcalPerPortion = r.calories ?? apiMacros.caloriesPerServing;
    const baseProtein = r.protein_g ?? apiMacros.proteinPerServing;
    const baseCarbs = r.carbs_g ?? apiMacros.carbsPerServing;
    const baseFat = r.fat_g ?? apiMacros.fatPerServing;

    const servings = Number(newFoodServings) || r.servings || r.portions || apiMacros.portions;
    setNewFoodServings(servings);
    setNewFoodKcal(Math.round(baseKcalPerPortion * servings).toString());
    setNewFoodProtein((baseProtein * servings).toFixed(1));
    setNewFoodCarbs((baseCarbs * servings).toFixed(1));
    setNewFoodFat((baseFat * servings).toFixed(1));

    setShowFoodSuggestions(false);
  };

  const selectSupermarketSuggestion = (prod: SuperMarketProduct) => {
    setNewFoodName(`${prod.nombre} (${prod.supermercado})`);

    const macro = getProductMacros(prod.nombre, prod.supermercado);
    if (macro) {
      setSelectedBaseFood(macro);
      const servings = Number(newFoodServings) || 1;
      setNewFoodKcal(Math.round(macro.calories * servings).toString());
      setNewFoodProtein((macro.protein_g * servings).toFixed(1));
      setNewFoodCarbs((macro.carbs_g * servings).toFixed(1));
      setNewFoodFat((macro.fat_g * servings).toFixed(1));
    } else {
      setNewFoodKcal('140');
      setNewFoodProtein('10');
      setNewFoodCarbs('15');
      setNewFoodFat('4');
    }

    setShowFoodSuggestions(false);
  };

  const handleServingsChange = (s: number) => {
    setNewFoodServings(s);

    if (selectedBaseFood) {
      setNewFoodKcal(Math.round(selectedBaseFood.calories * s).toString());
      setNewFoodProtein((selectedBaseFood.protein_g * s).toFixed(1));
      setNewFoodCarbs((selectedBaseFood.carbs_g * s).toFixed(1));
      setNewFoodFat((selectedBaseFood.fat_g * s).toFixed(1));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFoodName || !newFoodKcal) return;

    const recipeId = selectedRecipe?.id || (recipes.find(r => r.name.toLowerCase() === newFoodName.toLowerCase())?.id);

    const newItem: FitFoodLogItem = {
      id: Date.now().toString(),
      meal_type: mealType,
      food_name: newFoodName,
      callaycome_recipe_id: recipeId,
      servings: Number(newFoodServings) || 1,
      calories: parseInt(newFoodKcal) || 0,
      protein_g: parseFloat(newFoodProtein) || 0,
      carbs_g: parseFloat(newFoodCarbs) || 0,
      fat_g: parseFloat(newFoodFat) || 0
    };

    onAddFoodLog(newItem);

    const hasActiveFamily = Boolean(profile?.active_family_id);
    if (recipeId && onAssignRecipe && !hasActiveFamily) {
      const currentDayNum = get_current_planner_day(startDate || null) || 1;
      const plannerMealType = mealType === 'breakfast' ? 'desayuno' : mealType === 'lunch' ? 'comida' : 'cena';
      onAssignRecipe(currentDayNum, plannerMealType, 0, recipeId);
    }

    onClose();
    setNewFoodName('');
    setNewFoodKcal('');
    setNewFoodProtein('');
    setNewFoodCarbs('');
    setNewFoodFat('');
    setSelectedRecipe(null);
  };

  return (
    <Box style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px' }}>
      <Box style={{ background: '#121826', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '16px', padding: '16px 18px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 style={{ margin: '0 0 12px 0' }}>Añadir Alimento al Diario Nutricional</h3>

        <Box style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', padding: '12px', borderRadius: '10px', fontSize: '0.8rem', color: '#93C5FD', marginBottom: '14px', lineHeight: '1.4' }}>
          ℹ️ <strong>Aviso SuperMarketAPI</strong>: Los productos con macronutrientes automáticos provienen de <strong>Mercadona</strong> y <strong>Aldi</strong>. Para los productos de otros supermercados (Carrefour, Dia, Lidl, etc.), introduce sus macros a mano o regístralos en la plataforma.
        </Box>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Box style={{ position: 'relative' }}>
            <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Buscar receta o producto de ingrediente</label>
              <button
                type="button"
                onClick={() => onOpenRegisterMacroModal(newFoodName)}
                style={{ background: 'transparent', border: 'none', color: '#3B82F6', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
              >
                + Registrar Macros de Producto
              </button>
            </Box>
            <input
              type="text"
              value={newFoodName}
              onChange={(e) => handleFoodNameChange(e.target.value)}
              onFocus={() => setShowFoodSuggestions(true)}
              required
              placeholder="Escribe ej. Tostadas de pan de centeno, Pollo, Huevos, Avena..."
              style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '10px 12px', borderRadius: '8px', fontSize: '0.9rem' }}
            />

            {showFoodSuggestions && newFoodName.trim().length > 0 && (
              <Box style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#1E293B', border: '1px solid #10B981', borderRadius: '10px', zIndex: 1100, maxHeight: '250px', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', marginTop: '4px' }}>
                {recipes.filter(r => r.name.toLowerCase().includes(newFoodName.toLowerCase())).map(r => (
                  <Box
                    key={`rec-${r.id}`}
                    onClick={() => selectRecipeSuggestion(r)}
                    style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#60A5FA' }}>📖 {r.name}</span>
                    <span style={{ fontSize: '0.72rem', background: '#3B82F6', color: '#FFF', padding: '2px 6px', borderRadius: '6px' }}>Receta Fit</span>
                  </Box>
                ))}

                {supermarketSearchResults.map((prod, idx) => (
                  <Box
                    key={`sup-${prod.referencia_id || idx}`}
                    onClick={() => selectSupermarketSuggestion(prod)}
                    style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Box style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#F1F5F9' }}>🛒 {prod.nombre}</span>
                      <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{prod.supermercado} - {prod.precio}€</span>
                    </Box>
                    <span style={{ fontSize: '0.72rem', background: '#10B981', color: '#FFF', padding: '2px 6px', borderRadius: '6px' }}>SuperMarketAPI</span>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Box>
              <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Raciones / Cantidad (100g)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={newFoodServings}
                onChange={(e) => handleServingsChange(parseFloat(e.target.value) || 1)}
                style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '8px 12px', borderRadius: '8px' }}
              />
            </Box>

            <Box>
              <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Calorías (kcal)</label>
              <input
                type="number"
                value={newFoodKcal}
                onChange={(e) => setNewFoodKcal(e.target.value)}
                required
                style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '8px 12px', borderRadius: '8px' }}
              />
            </Box>
          </Box>

          <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            <Box>
              <label style={{ fontSize: '0.75rem', color: '#60A5FA', display: 'block', marginBottom: '4px' }}>Proteínas (g)</label>
              <input
                type="number"
                step="0.1"
                value={newFoodProtein}
                onChange={(e) => setNewFoodProtein(e.target.value)}
                style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '8px 10px', borderRadius: '8px', fontSize: '0.85rem' }}
              />
            </Box>

            <Box>
              <label style={{ fontSize: '0.75rem', color: '#FCD34D', display: 'block', marginBottom: '4px' }}>Carbos (g)</label>
              <input
                type="number"
                step="0.1"
                value={newFoodCarbs}
                onChange={(e) => setNewFoodCarbs(e.target.value)}
                style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '8px 10px', borderRadius: '8px', fontSize: '0.85rem' }}
              />
            </Box>

            <Box>
              <label style={{ fontSize: '0.75rem', color: '#FBCFE8', display: 'block', marginBottom: '4px' }}>Grasas (g)</label>
              <input
                type="number"
                step="0.1"
                value={newFoodFat}
                onChange={(e) => setNewFoodFat(e.target.value)}
                style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '8px 10px', borderRadius: '8px', fontSize: '0.85rem' }}
              />
            </Box>
          </Box>

          <Box style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button type="button" onClick={onClose} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
              Cancelar
            </button>
            <button type="submit" style={{ background: '#10B981', color: '#FFF', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
              Añadir Alimento
            </button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};
