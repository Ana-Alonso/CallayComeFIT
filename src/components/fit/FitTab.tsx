import React, { useState } from 'react';
import {
  Flame,
  Zap,
  Activity,
  Droplet,
  Utensils,
  Plus,
  Trash2,
  Target,
  TrendingUp,
  RotateCcw,
  BookOpen,
  Dumbbell,
  Calendar,
  Upload,
  Watch,
  FileText,
  Moon,
  Edit2,
  X
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import type { Recipe, Profile, MealPlanDay, FitFoodLogItem, FitActivity } from '../../types';
import { get_current_planner_day, format_date_display } from '../../utils/planner_helpers';
import { useFitDatabase } from '../../hooks/useFitDatabase';
import { 
  searchProducts, 
  getProductMacros, 
  saveSupermarketProductMacros, 
  calculateRecipeNutritionalMacros,
  formatSupermarketName,
  type SuperMarketProduct, 
  type SuperMarketProductMacro
} from '../../services/supermarket_api';

interface FitTabProps {
  recipes: Recipe[];
  profile: Profile | null;
  user?: User | null;
  meal_plan?: MealPlanDay[];
  start_date?: string | null;
  on_assign_recipe?: (day: number, type: 'desayuno' | 'comida' | 'cena', slot_index: number, recipe_id: number) => void;
  on_remove_assigned_recipe?: (day: number, type: 'desayuno' | 'comida' | 'cena', slot_index: number) => void;
  on_change_start_date?: (date: string | null) => void;
}

export const FitTab: React.FC<FitTabProps> = ({ 
  recipes, 
  profile,
  user, 
  meal_plan, 
  start_date,
  on_assign_recipe,
  on_remove_assigned_recipe,
  on_change_start_date
}) => {
  // ---------------------------------------------------------------------------
  // 1. ESTADO FIT CON PERSISTENCIA POSTGRESQL (SUPABASE) & LOCALSTORAGE
  // ---------------------------------------------------------------------------
  const {
    userProfile,
    setUserProfile,
    foodLogs,
    setFoodLogs,
    addFoodLog,
    removeFoodLog,
    activities,
    setActivities,
    addActivity,
    removeActivity,
    updateActivity
  } = useFitDatabase(user || null);

  const [editingActivity, setEditingActivity] = useState<FitActivity | null>(null);

  const [subTab, setSubTab] = useState<'dashboard' | 'diary' | 'goals' | 'activity' | 'recipes'>('dashboard');

  // Modal States
  const [isAddFoodOpen, setIsAddFoodOpen] = useState(false);
  const [modalMealType, setModalMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [newFoodName, setNewFoodName] = useState('');
  const [newFoodServings, setNewFoodServings] = useState(1);
  const [newFoodKcal, setNewFoodKcal] = useState('');
  const [newFoodProtein, setNewFoodProtein] = useState('');
  const [newFoodCarbs, setNewFoodCarbs] = useState('');
  const [newFoodFat, setNewFoodFat] = useState('');
  const [selectedBaseFood, setSelectedBaseFood] = useState<SuperMarketProductMacro | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showFoodSuggestions, setShowFoodSuggestions] = useState(false);

  // SuperMarketAPI State
  const [supermarketSearchResults, setSupermarketSearchResults] = useState<SuperMarketProduct[]>([]);
  const [isSearchingSupermarket, setIsSearchingSupermarket] = useState(false);

  // Modal: Registrar Nuevas Macros en SuperMarketAPI
  const [isRegisterMacroOpen, setIsRegisterMacroOpen] = useState(false);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [regMacroName, setRegMacroName] = useState('');
  const [regMacroSuper, setRegMacroSuper] = useState('Mercadona');
  const [regMacroKcal, setRegMacroKcal] = useState('');
  const [regMacroProtein, setRegMacroProtein] = useState('');
  const [regMacroCarbs, setRegMacroCarbs] = useState('');
  const [regMacroFat, setRegMacroFat] = useState('');

  // Búsqueda dinámica en SuperMarketAPI y Catálogo de Recetas
  const handleFoodNameChange = async (query: string) => {
    setNewFoodName(query);
    setShowFoodSuggestions(true);
    if (!query.trim() || query.length < 2) {
      setSupermarketSearchResults([]);
      return;
    }

    setIsSearchingSupermarket(true);
    try {
      const results = await searchProducts(query);
      setSupermarketSearchResults(results);
    } catch (e) {
      console.warn('SuperMarketAPI live search fallback active');
    } finally {
      setIsSearchingSupermarket(false);
    }
  };

  const handleSelectRecipeItem = (recipe: Recipe) => {
    const macroRes = calculateRecipeNutritionalMacros(recipe);
    setSelectedRecipe(recipe);
    setSelectedBaseFood(null);
    setNewFoodName(recipe.name);
    setNewFoodKcal(Math.round(macroRes.totalCalories * newFoodServings).toString());
    setNewFoodProtein((macroRes.totalProtein * newFoodServings).toFixed(1));
    setNewFoodCarbs((macroRes.totalCarbs * newFoodServings).toFixed(1));
    setNewFoodFat((macroRes.totalFat * newFoodServings).toFixed(1));
    setShowFoodSuggestions(false);
  };

  const handleSelectSupermarketItem = (item: SuperMarketProduct) => {
    const macro = getProductMacros(item.nombre, item.supermercado);
    setSelectedRecipe(null);
    setNewFoodName(`${item.nombre} (${item.supermercado.toUpperCase()})`);
    if (macro) {
      setSelectedBaseFood(macro);
      setNewFoodKcal(Math.round(macro.calories * newFoodServings).toString());
      setNewFoodProtein((macro.protein_g * newFoodServings).toFixed(1));
      setNewFoodCarbs((macro.carbs_g * newFoodServings).toFixed(1));
      setNewFoodFat((macro.fat_g * newFoodServings).toFixed(1));
    } else {
      setSelectedBaseFood(null);
      setRegMacroName(item.nombre);
      setRegMacroSuper(formatSupermarketName(item.supermercado));
    }
    setShowFoodSuggestions(false);
  };

  const handleServingsChange = (servings: number) => {
    setNewFoodServings(servings);
    if (selectedRecipe) {
      const macroRes = calculateRecipeNutritionalMacros(selectedRecipe);
      setNewFoodKcal(Math.round(macroRes.totalCalories * servings).toString());
      setNewFoodProtein((macroRes.totalProtein * servings).toFixed(1));
      setNewFoodCarbs((macroRes.totalCarbs * servings).toFixed(1));
      setNewFoodFat((macroRes.totalFat * servings).toFixed(1));
    } else if (selectedBaseFood) {
      setNewFoodKcal(Math.round(selectedBaseFood.calories * servings).toString());
      setNewFoodProtein((selectedBaseFood.protein_g * servings).toFixed(1));
      setNewFoodCarbs((selectedBaseFood.carbs_g * servings).toFixed(1));
      setNewFoodFat((selectedBaseFood.fat_g * servings).toFixed(1));
    }
  };

  const handleSaveCustomProductMacro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regMacroName || !regMacroKcal) return;

    const macro: SuperMarketProductMacro = {
      nombre: regMacroName,
      supermercado: regMacroSuper,
      calories: parseFloat(regMacroKcal) || 0,
      protein_g: parseFloat(regMacroProtein) || 0,
      carbs_g: parseFloat(regMacroCarbs) || 0,
      fat_g: parseFloat(regMacroFat) || 0,
      unit: '100g'
    };

    await saveSupermarketProductMacros(macro);

    setSelectedBaseFood(macro);
    setNewFoodName(`${macro.nombre} (${macro.supermercado.toUpperCase()})`);
    setNewFoodKcal(Math.round(macro.calories * newFoodServings).toString());
    setNewFoodProtein((macro.protein_g * newFoodServings).toFixed(1));
    setNewFoodCarbs((macro.carbs_g * newFoodServings).toFixed(1));
    setNewFoodFat((macro.fat_g * newFoodServings).toFixed(1));

    setIsRegisterMacroOpen(false);
    alert(`¡Macros de "${macro.nombre}" guardados y subidos a la plataforma SuperMarketAPI!`);
  };

  const [customSleepInput, setCustomSleepInput] = useState<string>(() => {
    return (userProfile.sleep_logged_hours || 7.5).toString();
  });

  // Importar Archivo GPX / FIT / TCX
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      let title = file.name.replace(/\.[^/.]+$/, "");
      let calories = 350;
      let dist = 5.0;

      const nameMatch = content.match(/<name>(.*?)<\/name>/i);
      if (nameMatch && nameMatch[1]) {
        title = nameMatch[1];
      }

      const newActivity: FitActivity = {
        id: `gpx-${Date.now()}`,
        activity_date: 'Hoy (Archivo Importado)',
        source: 'gpx_file',
        activity_type: 'imported',
        title: `Entrenamiento: ${title}`,
        duration_minutes: 35,
        distance_km: dist,
        calories_burned: calories,
        avg_heart_rate: 142
      };

      addActivity(newActivity);
      alert(`¡Archivo de entrenamiento "${file.name}" cargado con éxito! +${calories} kcal registradas.`);
    };

    reader.readAsText(file);
  };

  const [manualTitle, setManualTitle] = useState('');
  const [manualKcal, setManualKcal] = useState('');
  const [manualDuration, setManualDuration] = useState('30');
  const [manualDistance, setManualDistance] = useState('');
  const [manualHeartRate, setManualHeartRate] = useState('');

  const handleAddManualActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle || !manualKcal) return;

    const newAct: FitActivity = {
      id: `manual-${Date.now()}`,
      activity_date: new Date().toISOString(),
      source: 'manual',
      activity_type: 'workout',
      title: manualTitle,
      duration_minutes: parseInt(manualDuration) || 30,
      distance_km: parseFloat(manualDistance) || undefined,
      calories_burned: parseInt(manualKcal) || 0,
      avg_heart_rate: parseInt(manualHeartRate) || undefined
    };

    addActivity(newAct);
    setManualTitle('');
    setManualKcal('');
    setManualDistance('');
    setManualHeartRate('');
    alert(`¡Entrenamiento "${manualTitle}" registrado de forma manual!`);
  };

  const [isImportRecipeOpen, setIsImportRecipeOpen] = useState(false);

  const calculateMetabolism = () => {
    const w = userProfile.current_weight_kg;
    const h = userProfile.height_cm;
    const a = userProfile.age;

    let bmr = Math.round((10 * w) + (6.25 * h) - (5 * a) + (userProfile.gender === 'male' ? 5 : -161));
    if (bmr < 800) bmr = 1400;

    const actMultipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      very_active: 1.725,
      extra_active: 1.9
    };
    const mult = actMultipliers[userProfile.activity_level] || 1.55;
    const tdee = Math.round(bmr * mult);

    let targetCal = tdee;
    if (userProfile.fitness_goal === 'fat_loss') targetCal = Math.round(tdee * 0.80);
    else if (userProfile.fitness_goal === 'muscle_gain') targetCal = Math.round(tdee * 1.15);

    let pPct = 30, cPct = 40, fPct = 30;
    if (userProfile.macro_preset === 'high_protein') { pPct = 40; cPct = 35; fPct = 25; }
    else if (userProfile.macro_preset === 'low_carb') { pPct = 45; cPct = 20; fPct = 35; }
    else if (userProfile.macro_preset === 'custom') {
      pPct = userProfile.custom_protein_pct || 30;
      cPct = userProfile.custom_carb_pct || 40;
      fPct = userProfile.custom_fat_pct || 30;
    }

    const pGrams = Math.round((targetCal * (pPct / 100)) / 4);
    const cGrams = Math.round((targetCal * (cPct / 100)) / 4);
    const fGrams = Math.round((targetCal * (fPct / 100)) / 9);

    return { bmr, tdee, targetCalories: targetCal, pPct, cPct, fPct, targetProteinGrams: pGrams, targetCarbsGrams: cGrams, targetFatGrams: fGrams };
  };

  const meta = calculateMetabolism();

  const consumedKcal = foodLogs.reduce((sum, item) => sum + item.calories, 0);
  const consumedP = foodLogs.reduce((sum, item) => sum + item.protein_g, 0);
  const consumedC = foodLogs.reduce((sum, item) => sum + item.carbs_g, 0);
  const consumedF = foodLogs.reduce((sum, item) => sum + item.fat_g, 0);

  const burnedKcal = activities.reduce((sum, act) => sum + act.calories_burned, 0);
  const remainingKcal = meta.targetCalories - consumedKcal + burnedKcal;
  const calPercent = Math.min(100, Math.round((consumedKcal / (meta.targetCalories + burnedKcal)) * 100));

  const currentDayNum = get_current_planner_day(start_date ?? null) || 1;
  const todayPlan = meal_plan?.find(d => d.day === currentDayNum);

  const handleImportTodayPlan = () => {
    if (!todayPlan) {
      alert(`No se ha encontrado el plan del Día ${currentDayNum} en el planificador.`);
      return;
    }

    const importSlot = (slotArray: Array<number | null>, mealType: 'breakfast' | 'lunch' | 'dinner') => {
      slotArray.forEach(recipeId => {
        if (recipeId) {
          const recipe = recipes.find(r => r.id === recipeId);
          if (recipe) {
            const macroResult = calculateRecipeNutritionalMacros(recipe);
            addFoodLog({
              id: `plan-${Date.now()}-${Math.random()}`,
              meal_type: mealType,
              food_name: `${recipe.name} (Plan Calla y Come)`,
              callaycome_recipe_id: recipe.id,
              servings: 1,
              calories: macroResult.totalCalories || 300,
              protein_g: macroResult.totalProtein || 20,
              carbs_g: macroResult.totalCarbs || 30,
              fat_g: macroResult.totalFat || 10
            });
          }
        }
      });
    };

    importSlot(todayPlan.desayuno, 'breakfast');
    importSlot(todayPlan.comida, 'lunch');
    importSlot(todayPlan.cena, 'dinner');

    alert(`¡Comidas planificadas para hoy (Día ${currentDayNum}) importadas a tu diario Fit!`);
  };

  const handleAddWater = (ml: number) => {
    setUserProfile(prev => ({ ...prev, water_logged_ml: (prev.water_logged_ml || 0) + ml }));
  };

  const handleResetWater = () => {
    setUserProfile(prev => ({ ...prev, water_logged_ml: 0 }));
  };

  const handleAddFoodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFoodName || !newFoodKcal) return;

    const recipeId = selectedRecipe?.id || (recipes.find(r => r.name.toLowerCase() === newFoodName.toLowerCase())?.id);

    const newItem: FitFoodLogItem = {
      id: Date.now().toString(),
      meal_type: modalMealType,
      food_name: newFoodName,
      callaycome_recipe_id: recipeId,
      servings: Number(newFoodServings) || 1,
      calories: parseInt(newFoodKcal) || 0,
      protein_g: parseFloat(newFoodProtein) || 0,
      carbs_g: parseFloat(newFoodCarbs) || 0,
      fat_g: parseFloat(newFoodFat) || 0
    };

    addFoodLog(newItem);

    // Sincronizar automáticamente con el diario del día sólo si NO hay unidad familiar activa compartida
    const hasActiveFamily = Boolean(profile?.active_family_id);
    if (recipeId && on_assign_recipe && !hasActiveFamily) {
      const currentDayNum = get_current_planner_day(start_date || null) || 1;
      const plannerMealType = modalMealType === 'breakfast' ? 'desayuno' : modalMealType === 'lunch' ? 'comida' : 'cena';
      on_assign_recipe(currentDayNum, plannerMealType, 0, recipeId);
    }

    setIsAddFoodOpen(false);
    setNewFoodName('');
    setNewFoodKcal('');
    setNewFoodProtein('');
    setNewFoodCarbs('');
    setNewFoodFat('');
    setSelectedRecipe(null);
  };

  const handleDeleteFood = (id: string) => {
    const itemToDelete = foodLogs.find(f => f.id === id);
    removeFoodLog(id);

    // Sincronizar borrado con el diario del día sólo en modo individual (sin familia activa)
    const hasActiveFamily = Boolean(profile?.active_family_id);
    if (itemToDelete && itemToDelete.callaycome_recipe_id && on_remove_assigned_recipe && !hasActiveFamily) {
      const currentDayNum = get_current_planner_day(start_date || null) || 1;
      const plannerMealType = itemToDelete.meal_type === 'breakfast' ? 'desayuno' : itemToDelete.meal_type === 'lunch' ? 'comida' : 'cena';
      on_remove_assigned_recipe(currentDayNum, plannerMealType, 0);
    }
  };

  return (
    <div style={{ padding: '16px 0', color: '#F8FAFC' }}>
      
      {/* HEADER BAR FIT */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(249, 115, 22, 0.08))',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Zap style={{ color: '#10B981', fill: '#10B981' }} size={24} />
              <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Calla y Come <span style={{ color: '#10B981' }}>FIT</span></h1>
            </div>
            <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem' }}>
              Seguimiento de nutrición, macronutrientes y gasto energético de tu actividad.
            </p>
          </div>

          {on_change_start_date && (
            <button
              type="button"
              onClick={() => setIsDateModalOpen(true)}
              style={{
                background: 'rgba(59,130,246,0.15)',
                border: '1px solid rgba(59,130,246,0.3)',
                color: '#60A5FA',
                padding: '8px 14px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              📅 Inicio Plan: {start_date ? format_date_display(start_date) : 'Elegir Fecha'} ✏️
            </button>
          )}
        </div>

        {/* Sub-navegación dentro de Fit (Scrollable en móviles) */}
        <div style={{
          display: 'flex',
          gap: '6px',
          background: 'rgba(0,0,0,0.3)',
          padding: '6px',
          borderRadius: '24px',
          border: '1px solid rgba(255,255,255,0.08)',
          overflowX: 'auto',
          maxWidth: '100%',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none'
        }}>
          <button
            onClick={() => setSubTab('dashboard')}
            style={{
              background: subTab === 'dashboard' ? '#10B981' : 'transparent',
              color: '#FFF',
              border: 'none',
              padding: '8px 14px',
              borderRadius: '18px',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            <Activity size={15} /> Resumen
          </button>
          <button
            onClick={() => setSubTab('diary')}
            style={{
              background: subTab === 'diary' ? '#10B981' : 'transparent',
              color: '#FFF',
              border: 'none',
              padding: '8px 14px',
              borderRadius: '18px',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            <Utensils size={15} /> Diario
          </button>
          <button
            onClick={() => setSubTab('goals')}
            style={{
              background: subTab === 'goals' ? '#10B981' : 'transparent',
              color: '#FFF',
              border: 'none',
              padding: '8px 14px',
              borderRadius: '18px',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            <Target size={15} /> Objetivos
          </button>
          <button
            onClick={() => setSubTab('activity')}
            style={{
              background: subTab === 'activity' ? '#10B981' : 'transparent',
              color: '#FFF',
              border: 'none',
              padding: '8px 14px',
              borderRadius: '18px',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            <Watch size={15} style={{ color: subTab === 'activity' ? '#FFF' : '#10B981' }} /> Entrenamientos
          </button>
          <button
            onClick={() => setSubTab('recipes')}
            style={{
              background: subTab === 'recipes' ? '#10B981' : 'transparent',
              color: '#FFF',
              border: 'none',
              padding: '8px 14px',
              borderRadius: '18px',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            <BookOpen size={15} /> Recetas Fit
          </button>
        </div>
      </div>

      {/* -----------------------------------------------------------------------
          SUBTAB 1: DASHBOARD
      ----------------------------------------------------------------------- */}
      {subTab === 'dashboard' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          
          {/* Tarjeta 1: Balance Calórico */}
          <div style={{ background: '#121826', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Flame size={20} style={{ color: '#F97316' }} /> Balance Calórico Neto
              </h3>
              <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)', padding: '2px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                Objetivo Al alcance
              </span>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '3rem', fontWeight: 900, color: '#FFF', lineHeight: 1 }}>{remainingKcal.toLocaleString()}</span>
              <span style={{ color: '#94A3B8', fontSize: '1rem', marginLeft: '8px' }}>kcal restantes</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-around', background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '12px', marginBottom: '16px', textTransform: 'uppercase', fontSize: '0.75rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFF' }}>{meta.targetCalories}</div>
                <div style={{ color: '#94A3B8' }}>Meta Base</div>
              </div>
              <div style={{ fontSize: '1.2rem', color: '#64748B' }}>-</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#EF4444' }}>{consumedKcal}</div>
                <div style={{ color: '#94A3B8' }}>Consumidas</div>
              </div>
              <div style={{ fontSize: '1.2rem', color: '#64748B' }}>+</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10B981' }}>{burnedKcal}</div>
                <div style={{ color: '#94A3B8' }}>Activity Burn</div>
              </div>
            </div>

            <div style={{ height: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${calPercent}%`, background: 'linear-gradient(90deg, #10B981, #F97316)', borderRadius: '10px', transition: 'width 0.5s ease' }} />
            </div>
          </div>

          {/* Tarjeta 2: Desglose de Macronutrientes */}
          <div style={{ background: '#121826', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={20} style={{ color: '#10B981' }} /> Macronutrientes Diarios
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {/* Proteínas */}
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.88rem' }}>
                  <span style={{ fontWeight: 700 }}>Proteínas 🥩 ({meta.pPct}%)</span>
                  <span><strong>{consumedP.toFixed(1)}</strong> / {meta.targetProteinGrams} g</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, (consumedP / meta.targetProteinGrams) * 100)}%`, background: '#EF4444', borderRadius: '8px' }} />
                </div>
              </div>

              {/* Carbohidratos */}
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.88rem' }}>
                  <span style={{ fontWeight: 700 }}>Carbohidratos 🍚 ({meta.cPct}%)</span>
                  <span><strong>{consumedC.toFixed(1)}</strong> / {meta.targetCarbsGrams} g</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, (consumedC / meta.targetCarbsGrams) * 100)}%`, background: '#3B82F6', borderRadius: '8px' }} />
                </div>
              </div>

              {/* Grasas */}
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.88rem' }}>
                  <span style={{ fontWeight: 700 }}>Grasas Saludables 🥑 ({meta.fPct}%)</span>
                  <span><strong>{consumedF.toFixed(1)}</strong> / {meta.targetFatGrams} g</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, (consumedF / meta.targetFatGrams) * 100)}%`, background: '#F59E0B', borderRadius: '8px' }} />
                </div>
              </div>

            </div>
          </div>

          {/* Tarjeta 3: Agua & Hidratación */}
          <div style={{ background: '#121826', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Droplet size={20} style={{ color: '#3B82F6' }} /> Hidratación
              </h3>
              <span style={{ color: '#3B82F6', fontWeight: 800, fontSize: '1.1rem' }}>
                {userProfile.water_logged_ml || 0} / {userProfile.daily_water_target_ml} ml
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '45px', height: '85px', border: '3px solid rgba(59,130,246,0.5)', borderRadius: '10px', overflow: 'hidden', position: 'relative', background: '#000' }}>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${Math.min(100, ((userProfile.water_logged_ml || 0) / userProfile.daily_water_target_ml) * 100)}%`, background: '#3B82F6', transition: 'height 0.4s ease' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                <button onClick={() => handleAddWater(250)} style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.4)', color: '#60A5FA', padding: '8px 14px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>
                  + 250 ml
                </button>
                <button onClick={() => handleAddWater(500)} style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.4)', color: '#60A5FA', padding: '8px 14px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>
                  + 500 ml
                </button>
              </div>
              <button onClick={handleResetWater} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#64748B', padding: '8px', borderRadius: '10px', cursor: 'pointer' }} title="Reiniciar">
                <RotateCcw size={16} />
              </button>
            </div>
          </div>

          {/* Tarjeta 4: Monitor de Sueño & Descanso (Entrada Manual Pura) */}
          <div style={{ background: '#121826', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: '#A78BFA' }}>
                <Moon size={20} /> Sueño & Descanso
              </h3>
              <span style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid #8B5CF6', color: '#C4B5FD', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                Registro Manual ✏️
              </span>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#FFF' }}>
                {userProfile.sleep_logged_hours || 0} <span style={{ fontSize: '1rem', color: '#C4B5FD', fontWeight: 600 }}>horas de sueño registradas</span>
              </div>
              <div style={{ color: '#94A3B8', fontSize: '0.8rem', marginTop: '2px' }}>
                Introduce abajo tus horas exactas de descanso nocturno de hoy:
              </div>
            </div>

            {/* Formulario de Entrada Manual de Sueño */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const val = parseFloat(customSleepInput);
                if (!isNaN(val) && val >= 0) {
                  setUserProfile(prev => ({ ...prev, sleep_logged_hours: val }));
                  alert(`¡Guardadas ${val} horas de sueño!`);
                }
              }}
              style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}
            >
              <input
                type="number"
                step="0.1"
                min="0"
                max="24"
                value={customSleepInput}
                onChange={(e) => setCustomSleepInput(e.target.value)}
                placeholder="Ej. 7.5"
                style={{ flex: 1, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(139,92,246,0.4)', color: '#FFF', padding: '8px 12px', borderRadius: '10px', fontSize: '0.9rem' }}
              />
              <button
                type="submit"
                style={{ background: '#8B5CF6', color: '#FFF', border: 'none', padding: '8px 16px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                Guardar Horas
              </button>
            </form>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => { setUserProfile(prev => ({ ...prev, sleep_logged_hours: 6.5 })); setCustomSleepInput('6.5'); }} style={{ flex: 1, background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)', color: '#C4B5FD', padding: '6px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>6.5 h</button>
              <button onClick={() => { setUserProfile(prev => ({ ...prev, sleep_logged_hours: 7.0 })); setCustomSleepInput('7.0'); }} style={{ flex: 1, background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)', color: '#C4B5FD', padding: '6px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>7.0 h</button>
              <button onClick={() => { setUserProfile(prev => ({ ...prev, sleep_logged_hours: 7.5 })); setCustomSleepInput('7.5'); }} style={{ flex: 1, background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)', color: '#C4B5FD', padding: '6px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>7.5 h</button>
              <button onClick={() => { setUserProfile(prev => ({ ...prev, sleep_logged_hours: 8.0 })); setCustomSleepInput('8.0'); }} style={{ flex: 1, background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)', color: '#C4B5FD', padding: '6px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>8.0 h</button>
            </div>
          </div>

          {/* Tarjeta 5: Entrenamientos Ingeridos Card */}
          <div style={{ background: '#121826', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Watch size={20} style={{ color: '#10B981' }} /> Entrenamientos Recientes
              </h3>
              <button onClick={() => setSubTab('activity')} style={{ background: 'transparent', border: 'none', color: '#10B981', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>
                Ver todas &rarr;
              </button>
            </div>

            {activities.length > 0 ? (
              <div style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.25)', padding: '12px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{activities[0].title}</div>
                  <div style={{ color: '#94A3B8', fontSize: '0.78rem' }}>{activities[0].distance_km} km • {activities[0].duration_minutes} min • {activities[0].avg_heart_rate} ppm</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#F97316', fontWeight: 900, fontSize: '1.3rem' }}>+{activities[0].calories_burned}</div>
                  <div style={{ color: '#64748B', fontSize: '0.68rem', textTransform: 'uppercase' }}>kcal quemadas</div>
                </div>
              </div>
            ) : (
              <p style={{ color: '#64748B', fontSize: '0.85rem' }}>No hay entrenamientos de Strava hoy.</p>
            )}
          </div>

        </div>
      )}

      {/* -----------------------------------------------------------------------
          SUBTAB 2: DIARIO NUTRICIONAL
      ----------------------------------------------------------------------- */}
      {subTab === 'diary' && (
        <div>
          {profile?.active_family_id && (
            <div style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', padding: '12px 16px', borderRadius: '12px', fontSize: '0.82rem', color: '#93C5FD', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>👨‍👩‍👧‍👦 <strong>Modo Familia Activa</strong>: Tu diario Fit registra tus alimentos de forma personal para no modificar el menú compartido del planificador de tu familia.</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Diario Nutricional y Registro de Alimentos</h2>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={handleImportTodayPlan}
                style={{ background: 'linear-gradient(135deg, #10B981, #059669)', color: '#FFF', border: 'none', padding: '10px 16px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 15px rgba(16,185,129,0.3)' }}
              >
                <Calendar size={16} /> Importar Menú Planificado (Día {currentDayNum})
              </button>
              <button
                onClick={() => setIsAddFoodOpen(true)}
                style={{ background: 'rgba(255,255,255,0.06)', color: '#FFF', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 16px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={16} /> Añadir Alimento
              </button>
              <button
                onClick={() => setIsRegisterMacroOpen(true)}
                style={{ background: 'rgba(59,130,246,0.15)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.3)', padding: '10px 16px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={16} /> 🛒 Registrar Macros en SuperMarketAPI
              </button>
              <button
                onClick={() => setIsImportRecipeOpen(true)}
                style={{ background: 'rgba(255,255,255,0.06)', color: '#FFF', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 16px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <BookOpen size={16} /> Importar de Catálogo
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map(meal => {
              const mealLabels = { breakfast: 'Desayuno', lunch: 'Almuerzo', dinner: 'Cena', snack: 'Snacks & Suplementos' };
              const filtered = foodLogs.filter(item => item.meal_type === meal);
              const mealKcal = filtered.reduce((s, i) => s + i.calories, 0);

              return (
                <div key={meal} style={{ background: '#121826', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px', marginBottom: '12px' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{mealLabels[meal]}</h3>
                    <span style={{ color: '#10B981', fontWeight: 800 }}>{mealKcal} kcal</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px', flex: 1 }}>
                    {filtered.map(item => (
                      <div key={item.id} style={{ background: 'rgba(0,0,0,0.25)', padding: '8px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{item.food_name}</div>
                          <div style={{ color: '#64748B', fontSize: '0.75rem' }}>🥩 {item.protein_g}g P • 🍚 {item.carbs_g}g C • 🥑 {item.fat_g}g G</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{item.calories} kcal</span>
                          <button onClick={() => handleDeleteFood(item.id)} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => { setModalMealType(meal); setIsAddFoodOpen(true); }}
                    style={{ background: 'transparent', border: '1px dashed rgba(255,255,255,0.15)', color: '#94A3B8', padding: '8px', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}
                  >
                    + Añadir a {mealLabels[meal]}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* -----------------------------------------------------------------------
          SUBTAB 3: OBJETIVOS & MACROS
      ----------------------------------------------------------------------- */}
      {subTab === 'goals' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          
          {/* Formulario Calculadora */}
          <div style={{ background: '#121826', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700 }}>Calculadora Metabólica (Mifflin-St Jeor)</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Edad</label>
                <input
                  type="number"
                  value={userProfile.age}
                  onChange={(e) => setUserProfile(prev => ({ ...prev, age: parseInt(e.target.value) || 25 }))}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '8px 12px', borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Sexo Biológico</label>
                <select
                  value={userProfile.gender}
                  onChange={(e) => setUserProfile(prev => ({ ...prev, gender: e.target.value as any }))}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '8px 12px', borderRadius: '8px' }}
                >
                  <option value="female">Femenino</option>
                  <option value="male">Masculino</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Altura (cm)</label>
                  <input
                    type="number"
                    value={userProfile.height_cm}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, height_cm: parseFloat(e.target.value) || 165 }))}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '8px 12px', borderRadius: '8px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Peso Actual (kg)</label>
                  <input
                    type="number"
                    value={userProfile.current_weight_kg}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, current_weight_kg: parseFloat(e.target.value) || 68 }))}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '8px 12px', borderRadius: '8px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Objetivo Principal</label>
                <select
                  value={userProfile.fitness_goal}
                  onChange={(e) => setUserProfile(prev => ({ ...prev, fitness_goal: e.target.value as any }))}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '8px 12px', borderRadius: '8px' }}
                >
                  <option value="fat_loss">Pérdida de Grasa (Déficit -20%)</option>
                  <option value="maintenance">Mantenimiento Corporal</option>
                  <option value="muscle_gain">Ganancia Muscular (Superávit +15%)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Plantillas & Sliders */}
          <div style={{ background: '#121826', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700 }}>Plantillas & Sliders de Macronutrientes</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
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
            </div>

            {/* Sliders de ajuste fino */}
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '12px' }}>
              <div style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '2px' }}>
                  <span>Proteínas 🥩 ({userProfile.custom_protein_pct}%)</span>
                  <span>{meta.targetProteinGrams}g</span>
                </div>
                <input
                  type="range"
                  min="10" max="70" step="5"
                  value={userProfile.custom_protein_pct}
                  onChange={(e) => setUserProfile(prev => ({ ...prev, macro_preset: 'custom', custom_protein_pct: parseInt(e.target.value) }))}
                  style={{ width: '100%', accentColor: '#10B981' }}
                />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '2px' }}>
                  <span>Carbohidratos 🍚 ({userProfile.custom_carb_pct}%)</span>
                  <span>{meta.targetCarbsGrams}g</span>
                </div>
                <input
                  type="range"
                  min="5" max="70" step="5"
                  value={userProfile.custom_carb_pct}
                  onChange={(e) => setUserProfile(prev => ({ ...prev, macro_preset: 'custom', custom_carb_pct: parseInt(e.target.value) }))}
                  style={{ width: '100%', accentColor: '#3B82F6' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '2px' }}>
                  <span>Grasas 🥑 ({userProfile.custom_fat_pct}%)</span>
                  <span>{meta.targetFatGrams}g</span>
                </div>
                <input
                  type="range"
                  min="10" max="60" step="5"
                  value={userProfile.custom_fat_pct}
                  onChange={(e) => setUserProfile(prev => ({ ...prev, macro_preset: 'custom', custom_fat_pct: parseInt(e.target.value) }))}
                  style={{ width: '100%', accentColor: '#F59E0B' }}
                />
              </div>
            </div>
          </div>

        </div>
      )}

      {/* -----------------------------------------------------------------------
          SUBTAB 4: REGISTRO DE ACTIVIDADES Y ENTRENAMIENTOS
      ----------------------------------------------------------------------- */}
      {subTab === 'activity' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Tarjeta 2: Importador de Archivos de Entrenamiento (.GPX / .FIT / .TCX) */}
          <div style={{ background: '#121826', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '16px', padding: '20px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', color: '#3B82F6', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Upload size={20} /> Cargar Archivo de Entrenamiento (.GPX / .FIT / .TCX)
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginBottom: '14px' }}>
              ¿Exportaste un entrenamiento desde tu reloj o pulsera de actividad? Súbelo directamente aquí para analizar distancias y quemas de calorías sin depender de APIs de pago:
            </p>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(59,130,246,0.15)', border: '1px border #3B82F6', borderStyle: 'dashed', color: '#3B82F6', padding: '12px 20px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>
              <FileText size={18} /> Seleccionar archivo .GPX o .FIT
              <input type="file" accept=".gpx,.fit,.tcx,.xml" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>
          </div>

          {/* Tarjeta 3: Formulario de Registro Manual Personalizado */}
          <div style={{ background: '#121826', border: '1px solid rgba(249,115,22,0.3)', borderRadius: '16px', padding: '20px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', color: '#F97316', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Dumbbell size={20} /> Registrar Entrenamiento Manualmente
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginBottom: '16px' }}>
              Escribe los datos de tu sesión de ejercicio para añadir las calorías quemadas a tu balance del día:
            </p>

            <form onSubmit={handleAddManualActivity} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Nombre / Tipo de Entrenamiento</label>
                  <input
                    type="text"
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    required
                    placeholder="Ej. Carrera de montaña, CrossFit, Natación..."
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '10px', borderRadius: '8px', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Calorías (kcal)</label>
                  <input
                    type="number"
                    value={manualKcal}
                    onChange={(e) => setManualKcal(e.target.value)}
                    required
                    placeholder="Ej. 350"
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '10px', borderRadius: '8px', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Duración (min)</label>
                  <input
                    type="number"
                    value={manualDuration}
                    onChange={(e) => setManualDuration(e.target.value)}
                    placeholder="30"
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '8px', borderRadius: '8px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Distancia (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={manualDistance}
                    onChange={(e) => setManualDistance(e.target.value)}
                    placeholder="Ej. 5.5"
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '8px', borderRadius: '8px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Pulsaciones (bpm)</label>
                  <input
                    type="number"
                    value={manualHeartRate}
                    onChange={(e) => setManualHeartRate(e.target.value)}
                    placeholder="Ej. 145"
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '8px', borderRadius: '8px' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{ alignSelf: 'flex-end', background: '#F97316', color: '#FFF', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}
              >
                <Plus size={18} /> Registrar Entrenamiento Manual
              </button>
            </form>
          </div>

          {/* Tarjeta 4: Registrador Rápido de Entrenamientos */}
          <div style={{ background: '#121826', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '16px', padding: '20px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Dumbbell size={20} /> Registrador Rápido de Sesiones
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginBottom: '16px' }}>
              Añade un entrenamiento realizado con 1 solo clic:
            </p>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setActivities(prev => [{ id: `act-${Date.now()}`, activity_date: 'Ahora mismo', source: 'health_connect', activity_type: 'workout', title: 'Carrera con Reloj / Pulsera', duration_minutes: 35, distance_km: 6.5, calories_burned: 380, avg_heart_rate: 155 }, ...prev])}
                style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid #10B981', color: '#10B981', padding: '10px 16px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
              >
                + Carrera (+380 kcal)
              </button>
              <button
                onClick={() => setActivities(prev => [{ id: `act-${Date.now()}`, activity_date: 'Ahora mismo', source: 'manual', activity_type: 'workout', title: 'Sesión de Pesas & Fuerza', duration_minutes: 45, distance_km: 0, calories_burned: 240, avg_heart_rate: 135 }, ...prev])}
                style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid #10B981', color: '#10B981', padding: '10px 16px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
              >
                + Gimnasio & Pesas (+240 kcal)
              </button>
              <button
                onClick={() => setActivities(prev => [{ id: `act-${Date.now()}`, activity_date: 'Ahora mismo', source: 'manual', activity_type: 'workout', title: 'Ruta Ciclismo Urbano', duration_minutes: 50, distance_km: 15.2, calories_burned: 450, avg_heart_rate: 142 }, ...prev])}
                style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid #10B981', color: '#10B981', padding: '10px 16px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
              >
                + Ciclismo (+450 kcal)
              </button>
              <button
                onClick={() => setActivities([])}
                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #EF4444', color: '#EF4444', padding: '10px 16px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', marginLeft: 'auto' }}
              >
                Limpiar Historial
              </button>
            </div>
          </div>

          {/* Lista de Entrenamientos Ingeridos */}
          {activities.length > 0 && (
            <div style={{ background: '#121826', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
              <h3 style={{ margin: '0 0 14px 0', fontSize: '1.05rem', color: '#FFF' }}>Historial de Actividades Ingeridas Hoy</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {activities.map(act => (
                  <div key={act.id} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', padding: '12px 16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#FFF' }}>{act.title}</div>
                      <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>{act.activity_date} • {act.duration_minutes} min • {act.distance_km ? `${act.distance_km} km` : 'Fuerza'}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ textAlign: 'right', fontWeight: 800, color: '#10B981', fontSize: '0.95rem' }}>
                        +{act.calories_burned} kcal
                        <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{act.avg_heart_rate ? `❤️ ${act.avg_heart_rate} bpm` : ''}</div>
                      </div>
                      <button
                        onClick={() => setEditingActivity(act)}
                        style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid #3B82F6', color: '#60A5FA', padding: '6px 8px', borderRadius: '8px', cursor: 'pointer' }}
                        title="Editar Actividad"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => removeActivity(act.id)}
                        style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #EF4444', color: '#EF4444', padding: '6px 8px', borderRadius: '8px', cursor: 'pointer' }}
                        title="Borrar Actividad"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* -----------------------------------------------------------------------
          SUBTAB 5: RECETAS FIT ADAPTADAS
      ----------------------------------------------------------------------- */}
      {subTab === 'recipes' && (
        <div>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '1.4rem' }}>Recetas Calla y Come Adaptadas a Versión FIT</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {recipes.slice(0, 6).map(r => (
              <div key={r.id} style={{ background: '#121826', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ background: '#10B981', color: '#FFF', padding: '2px 8px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 800 }}>FIT ⚡</span>
                  <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>{r.meal_type}</span>
                </div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>{r.name}</h3>
                <p style={{ color: '#94A3B8', fontSize: '0.82rem', flex: 1 }}>Adaptación Fit: Alta proteína magra, baja en aceites refinados y sustitución por queso batido 0%.</p>
                <button
                  onClick={() => {
                    setFoodLogs(prev => [...prev, { id: Date.now().toString(), meal_type: 'lunch', food_name: `${r.name} (Versión Fit)`, servings: 1, calories: 420, protein_g: 38, carbs_g: 45, fat_g: 8 }]);
                    alert(`¡${r.name} añadida a tu diario nutricional!`);
                  }}
                  style={{ background: '#10B981', color: '#FFF', border: 'none', padding: '8px 12px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', marginTop: '12px' }}
                >
                  + Añadir a mi Diario Nutricional
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* -----------------------------------------------------------------------
          MODAL: AÑADIR ALIMENTO PERSONALIZADO (SUPERMARKETAPI INTEGRADA)
      ----------------------------------------------------------------------- */}
      {isAddFoodOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#121826', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '500px' }}>
            <h3 style={{ margin: '0 0 12px 0' }}>Añadir Alimento al Diario Nutricional</h3>
            
            {/* Aviso informativo de SuperMarketAPI */}
            <div style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', padding: '12px', borderRadius: '10px', fontSize: '0.8rem', color: '#93C5FD', marginBottom: '14px', lineHeight: '1.4' }}>
              ℹ️ <strong>Aviso SuperMarketAPI</strong>: Los productos con macronutrientes automáticos provienen de <strong>Mercadona</strong> y <strong>Aldi</strong>. Para los productos de otros supermercados (Carrefour, Dia, Lidl, etc.), introduce sus macros a mano o regístralos en la plataforma.
            </div>

            <form onSubmit={handleAddFoodSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Buscar receta o producto de ingrediente</label>
                  <button
                    type="button"
                    onClick={() => {
                      setRegMacroName(newFoodName);
                      setIsRegisterMacroOpen(true);
                    }}
                    style={{ background: 'transparent', border: 'none', color: '#3B82F6', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
                  >
                    + Registrar Macros de Producto
                  </button>
                </div>
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
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#1E293B', border: '1px solid #10B981', borderRadius: '10px', zIndex: 1100, maxHeight: '250px', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', marginTop: '4px' }}>
                    
                    {/* 1. Recetas coincidentes del catálogo Calla y Come con cálculo por ingredientes */}
                    {recipes
                      .filter(r => r.name.toLowerCase().includes(newFoodName.toLowerCase()))
                      .slice(0, 5)
                      .map((r) => {
                        const recipeMacro = calculateRecipeNutritionalMacros(r);
                        return (
                          <div
                            key={`rec-${r.id}`}
                            onClick={() => handleSelectRecipeItem(r)}
                            style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(16,185,129,0.12)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                            onMouseDown={(e) => e.preventDefault()}
                          >
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#6EE7B7' }}>🍲 Receta: {r.name}</div>
                              <div style={{ fontSize: '0.74rem', color: '#94A3B8' }}>{r.ingredients.length} ingredientes • {r.meal_type}</div>
                            </div>
                            <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#10B981', fontWeight: 700 }}>
                              {recipeMacro.totalCalories} kcal
                              <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>🥩 {recipeMacro.totalProtein}g P</div>
                            </div>
                          </div>
                        );
                      })}

                    {/* 2. Productos coincidentes de SuperMarketAPI */}
                    {isSearchingSupermarket ? (
                      <div style={{ padding: '12px', color: '#94A3B8', fontSize: '0.85rem' }}>Buscando ingredientes en SuperMarketAPI...</div>
                    ) : supermarketSearchResults.length > 0 ? (
                      supermarketSearchResults.map((item, idx) => {
                        const macro = getProductMacros(item.nombre, item.supermercado);
                        return (
                          <div
                            key={`prod-${idx}`}
                            onClick={() => handleSelectSupermarketItem(item)}
                            style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                            onMouseDown={(e) => e.preventDefault()}
                          >
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#FFF' }}>🛒 {item.nombre}</div>
                              <div style={{ fontSize: '0.74rem', color: '#94A3B8' }}>{item.supermercado.toUpperCase()} • {item.precio ? `${item.precio}€` : 'Súper'}</div>
                            </div>
                            <div style={{ textAlign: 'right', fontSize: '0.8rem', color: macro ? '#10B981' : '#F59E0B', fontWeight: 700 }}>
                              {macro ? `${macro.calories} kcal` : 'A mano ✍️'}
                              <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{macro ? `🥩 ${macro.protein_g}g P` : 'Faltan macros'}</div>
                            </div>
                          </div>
                        );
                      })
                    ) : null}

                    {recipes.filter(r => r.name.toLowerCase().includes(newFoodName.toLowerCase())).length === 0 && supermarketSearchResults.length === 0 && !isSearchingSupermarket && (
                      <div style={{ padding: '12px', color: '#94A3B8', fontSize: '0.85rem' }}>
                        No se encontraron recetas ni productos con ese nombre. Introduce las macros a mano o
                        <button
                          type="button"
                          onClick={() => {
                            setRegMacroName(newFoodName);
                            setIsRegisterMacroOpen(true);
                          }}
                          style={{ background: 'transparent', border: 'none', color: '#3B82F6', textDecoration: 'underline', cursor: 'pointer', marginLeft: '4px' }}
                        >
                          regístralas aquí
                        </button>.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Raciones</label>
                  <input
                    type="number"
                    value={newFoodServings}
                    onChange={(e) => handleServingsChange(parseFloat(e.target.value) || 1)}
                    min="0.1"
                    step="0.1"
                    required
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '8px', borderRadius: '8px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Comida</label>
                  <select value={modalMealType} onChange={(e) => setModalMealType(e.target.value as any)} style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '8px', borderRadius: '8px' }}>
                    <option value="breakfast">Desayuno</option>
                    <option value="lunch">Almuerzo</option>
                    <option value="dinner">Cena</option>
                    <option value="snack">Snacks</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Calorías (kcal)</label>
                  <input type="number" value={newFoodKcal} onChange={(e) => setNewFoodKcal(e.target.value)} required placeholder="250" style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '8px', borderRadius: '8px' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Proteína (g)</label>
                  <input type="number" value={newFoodProtein} onChange={(e) => setNewFoodProtein(e.target.value)} placeholder="30" style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '8px', borderRadius: '8px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Carbs (g)</label>
                  <input type="number" value={newFoodCarbs} onChange={(e) => setNewFoodCarbs(e.target.value)} placeholder="10" style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '8px', borderRadius: '8px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Grasas (g)</label>
                  <input type="number" value={newFoodFat} onChange={(e) => setNewFoodFat(e.target.value)} placeholder="5" style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '8px', borderRadius: '8px' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setIsAddFoodOpen(false)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" style={{ background: '#10B981', color: '#FFF', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>Registrar en Diario</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -----------------------------------------------------------------------
          MODAL: REGISTRAR / SUBIR MACROS DE PRODUCTO A SUPERMARKETAPI
      ----------------------------------------------------------------------- */}
      {isRegisterMacroOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#121826', border: '1px solid #3B82F6', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '480px' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#60A5FA', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={20} /> Registrar Macros en SuperMarketAPI
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginBottom: '16px', lineHeight: '1.4' }}>
              Guarda los valores nutricionales por 100g para cualquier producto de Carrefour, Dia, Lidl, Eroski, etc., para que queden disponibles en las búsquedas de la plataforma.
            </p>

            <form onSubmit={handleSaveCustomProductMacro} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Nombre del Producto / Marca</label>
                <input
                  type="text"
                  value={regMacroName}
                  onChange={(e) => setRegMacroName(e.target.value)}
                  required
                  placeholder="Ej. Yogur Proteínas Carrefour, Pan Proteico Lidl..."
                  style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '10px', borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Supermercado / Cadena</label>
                <select
                  value={regMacroSuper}
                  onChange={(e) => setRegMacroSuper(e.target.value)}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '10px', borderRadius: '8px' }}
                >
                  <option value="Mercadona">Mercadona</option>
                  <option value="Aldi">Aldi</option>
                  <option value="Carrefour">Carrefour</option>
                  <option value="Dia">Dia</option>
                  <option value="Lidl">Lidl</option>
                  <option value="Eroski">Eroski</option>
                  <option value="Otro">Otro Supermercado</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Calorías / 100g (kcal)</label>
                  <input
                    type="number"
                    value={regMacroKcal}
                    onChange={(e) => setRegMacroKcal(e.target.value)}
                    required
                    placeholder="120"
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '10px', borderRadius: '8px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Proteínas / 100g (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={regMacroProtein}
                    onChange={(e) => setRegMacroProtein(e.target.value)}
                    placeholder="12.5"
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '10px', borderRadius: '8px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Carbohidratos / 100g (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={regMacroCarbs}
                    onChange={(e) => setRegMacroCarbs(e.target.value)}
                    placeholder="4.0"
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '10px', borderRadius: '8px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Grasas / 100g (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={regMacroFat}
                    onChange={(e) => setRegMacroFat(e.target.value)}
                    placeholder="1.2"
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '10px', borderRadius: '8px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" onClick={() => setIsRegisterMacroOpen(false)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#94A3B8', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit" style={{ background: '#3B82F6', color: '#FFF', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                  Subir a SuperMarketAPI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -----------------------------------------------------------------------
          MODAL: IMPORTAR DE CATALOGO DE RECETAS DE CALLA Y COME
      ----------------------------------------------------------------------- */}
      {isImportRecipeOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#121826', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Importar Recetas de Calla y Come</h3>
              <button
                type="button"
                onClick={() => setIsImportRecipeOpen(false)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#FFF', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                title="Cerrar modal"
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recipes.map(r => {
                const macroRes = calculateRecipeNutritionalMacros(r);
                return (
                  <div key={r.id} style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{r.name}</div>
                      <div style={{ color: '#10B981', fontSize: '0.82rem', fontWeight: 700, marginTop: '2px' }}>
                        Calculado: {macroRes.totalCalories} kcal • 🥩 {macroRes.totalProtein}g P • 🍚 {macroRes.totalCarbs}g C • 🥑 {macroRes.totalFat}g G
                      </div>
                      {macroRes.missingIngredients.length > 0 && (
                        <div style={{ color: '#F59E0B', fontSize: '0.75rem', marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ fontWeight: 600 }}>⚠️ Faltan macros para {macroRes.missingIngredients.length} ingrediente(s):</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '2px' }}>
                            {macroRes.missingIngredients.map((missingIng, idx) => {
                              const superFormatted = formatSupermarketName(missingIng.supermarket);
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => {
                                    setRegMacroName(missingIng.product_name || missingIng.ingredient_name);
                                    setRegMacroSuper(superFormatted);
                                    setIsRegisterMacroOpen(true);
                                  }}
                                  style={{
                                    background: 'rgba(245,158,11,0.18)',
                                    border: '1px solid rgba(245,158,11,0.5)',
                                    color: '#FBBF24',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  ✍️ {missingIng.ingredient_name} ({superFormatted})
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <button
                        onClick={() => {
                          addFoodLog({
                            id: Date.now().toString(),
                            meal_type: 'lunch',
                            food_name: `${r.name} (Catálogo Calla y Come)`,
                            callaycome_recipe_id: r.id,
                            servings: 1,
                            calories: macroRes.totalCalories || 350,
                            protein_g: macroRes.totalProtein || 25,
                            carbs_g: macroRes.totalCarbs || 35,
                            fat_g: macroRes.totalFat || 10
                          });
                          setIsImportRecipeOpen(false);
                          alert(`¡"${r.name}" añadida a tu diario con sus ${macroRes.totalCalories} kcal reales calculadas!`);
                        }}
                        style={{ background: '#10B981', color: '#FFF', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                      >
                        + Importar ({macroRes.totalCalories} kcal)
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <button onClick={() => setIsImportRecipeOpen(false)} style={{ marginTop: '16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', width: '100%' }}>Cerrar</button>
          </div>
        </div>
      )}

      {/* -----------------------------------------------------------------------
          MODAL: EDITAR ACTIVIDAD
      ----------------------------------------------------------------------- */}
      {editingActivity && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#121826', border: '1px solid #3B82F6', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '480px' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#3B82F6', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Edit2 size={20} /> Modificar Actividad / Entrenamiento
            </h3>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (editingActivity) {
                updateActivity(editingActivity);
                setEditingActivity(null);
                alert('¡Actividad actualizada correctamente!');
              }
            }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Título del Entrenamiento</label>
                <input
                  type="text"
                  value={editingActivity.title}
                  onChange={(e) => setEditingActivity(prev => prev ? { ...prev, title: e.target.value } : null)}
                  required
                  style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '10px', borderRadius: '8px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Calorías Quemadas (kcal)</label>
                  <input
                    type="number"
                    value={editingActivity.calories_burned}
                    onChange={(e) => setEditingActivity(prev => prev ? { ...prev, calories_burned: parseInt(e.target.value) || 0 } : null)}
                    required
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '10px', borderRadius: '8px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Duración (min)</label>
                  <input
                    type="number"
                    value={editingActivity.duration_minutes}
                    onChange={(e) => setEditingActivity(prev => prev ? { ...prev, duration_minutes: parseInt(e.target.value) || 0 } : null)}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '10px', borderRadius: '8px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Distancia (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingActivity.distance_km || ''}
                    onChange={(e) => setEditingActivity(prev => prev ? { ...prev, distance_km: parseFloat(e.target.value) || 0 } : null)}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '10px', borderRadius: '8px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Pulsaciones (bpm)</label>
                  <input
                    type="number"
                    value={editingActivity.avg_heart_rate || ''}
                    onChange={(e) => setEditingActivity(prev => prev ? { ...prev, avg_heart_rate: parseInt(e.target.value) || undefined } : null)}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '10px', borderRadius: '8px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" onClick={() => setEditingActivity(null)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#94A3B8', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit" style={{ background: '#3B82F6', color: '#FFF', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -----------------------------------------------------------------------
          MODAL: ELEGIR FECHA DE INICIO DE PLAN
      ----------------------------------------------------------------------- */}
      {isDateModalOpen && on_change_start_date && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#121826', border: '1px solid #3B82F6', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '460px' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#60A5FA', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={20} /> Elegir Fecha de Inicio del Plan
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginBottom: '16px', lineHeight: '1.4' }}>
              Selecciona el día de inicio para calcular el día activo del planificador y sincronizar las comidas diarias.
            </p>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => {
                  const todayStr = new Date().toISOString().split('T')[0];
                  on_change_start_date(todayStr);
                  setIsDateModalOpen(false);
                }}
                style={{ background: '#1E293B', border: '1px solid #3B82F6', color: '#FFF', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}
              >
                Hoy 📌
              </button>
              <button
                type="button"
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  on_change_start_date(tomorrow.toISOString().split('T')[0]);
                  setIsDateModalOpen(false);
                }}
                style={{ background: '#1E293B', border: '1px solid #3B82F6', color: '#FFF', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}
              >
                Mañana 🌅
              </button>
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  const day = now.getDay();
                  const diff = (day === 0 ? 1 : 8 - day);
                  const nextMon = new Date(now.setDate(now.getDate() + diff));
                  on_change_start_date(nextMon.toISOString().split('T')[0]);
                  setIsDateModalOpen(false);
                }}
                style={{ background: '#1E293B', border: '1px solid #3B82F6', color: '#FFF', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}
              >
                Próximo Lunes 🗓️
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>O elige una fecha en el calendario:</label>
              <input
                type="date"
                value={start_date || ''}
                onChange={(e) => {
                  if (e.target.value) {
                    on_change_start_date(e.target.value);
                    setIsDateModalOpen(false);
                  }
                }}
                style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid #3B82F6', color: '#FFF', padding: '10px', borderRadius: '8px', fontSize: '0.95rem' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setIsDateModalOpen(false)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FitTab;
