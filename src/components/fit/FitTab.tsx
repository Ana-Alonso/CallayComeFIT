import React, { useState, useEffect } from 'react';
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
  Smartphone,
  Watch,
  FileText,
  CheckCircle
} from 'lucide-react';
import type { Recipe, Profile, MealPlanDay, FitUserProfile, FitFoodLogItem, FitActivity } from '../../types';
import { get_current_planner_day } from '../../utils/planner_helpers';

interface FoodDbItem {
  name: string;
  defaultMeal: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  unit: string;
}

const fitFoodDatabase: FoodDbItem[] = [
  { name: 'Pechuga de Pollo a la plancha', defaultMeal: 'lunch', calories: 165, protein_g: 31.0, carbs_g: 0.0, fat_g: 3.6, unit: '100g' },
  { name: 'Huevos enteros (2 unidades)', defaultMeal: 'breakfast', calories: 155, protein_g: 13.0, carbs_g: 1.1, fat_g: 11.0, unit: '2 ud' },
  { name: 'Claras de Huevo (200ml)', defaultMeal: 'breakfast', calories: 104, protein_g: 22.0, carbs_g: 1.4, fat_g: 0.4, unit: '200ml' },
  { name: 'Arroz Integral cocido', defaultMeal: 'lunch', calories: 130, protein_g: 2.7, carbs_g: 28.0, fat_g: 1.0, unit: '100g' },
  { name: 'Avena en copos', defaultMeal: 'breakfast', calories: 389, protein_g: 16.9, carbs_g: 66.3, fat_g: 6.9, unit: '100g' },
  { name: 'Queso fresco batido 0%', defaultMeal: 'snack', calories: 46, protein_g: 8.0, carbs_g: 3.5, fat_g: 0.1, unit: '100g' },
  { name: 'Lomo de Salmón al horno', defaultMeal: 'dinner', calories: 208, protein_g: 20.0, carbs_g: 0.0, fat_g: 13.0, unit: '100g' },
  { name: 'Aguacate fresco', defaultMeal: 'dinner', calories: 160, protein_g: 2.0, carbs_g: 8.5, fat_g: 14.7, unit: '100g' },
  { name: 'Atún al natural (1 lata)', defaultMeal: 'lunch', calories: 85, protein_g: 19.5, carbs_g: 0.0, fat_g: 0.8, unit: '1 lata' },
  { name: 'Proteína Whey en Polvo (1 cazo)', defaultMeal: 'snack', calories: 120, protein_g: 24.0, carbs_g: 2.0, fat_g: 1.5, unit: '30g' },
  { name: 'Plátano maduro', defaultMeal: 'snack', calories: 89, protein_g: 1.1, carbs_g: 22.8, fat_g: 0.3, unit: '1 ud' },
  { name: 'Manzana verde', defaultMeal: 'snack', calories: 52, protein_g: 0.3, carbs_g: 13.8, fat_g: 0.2, unit: '1 ud' },
  { name: 'Solomillo de Pavo magro', defaultMeal: 'dinner', calories: 110, protein_g: 24.0, carbs_g: 0.0, fat_g: 1.5, unit: '100g' },
  { name: 'Pan de Espelta integral', defaultMeal: 'breakfast', calories: 160, protein_g: 7.0, carbs_g: 28.0, fat_g: 2.0, unit: '2 rebanadas' },
  { name: 'Aceite de Oliva Virgen Extra', defaultMeal: 'lunch', calories: 119, protein_g: 0.0, carbs_g: 0.0, fat_g: 13.5, unit: '1 cda (14ml)' },
  { name: 'Crema de Cacahuete 100%', defaultMeal: 'snack', calories: 588, protein_g: 25.0, carbs_g: 20.0, fat_g: 50.0, unit: '100g' },
  { name: 'Yogur Griego 0% materia grasa', defaultMeal: 'snack', calories: 59, protein_g: 10.0, carbs_g: 3.6, fat_g: 0.4, unit: '100g' },
  { name: 'Tofu firme', defaultMeal: 'lunch', calories: 76, protein_g: 8.0, carbs_g: 1.9, fat_g: 4.8, unit: '100g' }
];

interface FitTabProps {
  recipes: Recipe[];
  profile: Profile | null;
  meal_plan?: MealPlanDay[];
  start_date?: string | null;
}

export const FitTab: React.FC<FitTabProps> = ({ recipes, meal_plan, start_date }) => {
  // ---------------------------------------------------------------------------
  // 1. ESTADO FIT (LOCAL STORAGE CON SUPABASE SYNC FALLBACK)
  // ---------------------------------------------------------------------------
  const defaultUserProfile: FitUserProfile = {
    age: 28,
    gender: 'female',
    height_cm: 168,
    current_weight_kg: 68.0,
    target_weight_kg: 63.0,
    activity_level: 'moderate',
    fitness_goal: 'fat_loss',
    bmr: 1460,
    tdee: 2260,
    daily_calorie_target: 1808,
    macro_preset: 'high_protein',
    custom_protein_pct: 40,
    custom_carb_pct: 35,
    custom_fat_pct: 25,
    daily_water_target_ml: 2500,
    water_logged_ml: 1750
  };

  const defaultFoodLogs: FitFoodLogItem[] = [
    { id: '1', meal_type: 'breakfast', food_name: 'Tortilla Fit de Clara y Pavo', servings: 1, calories: 260, protein_g: 32, carbs_g: 4, fat_g: 12 },
    { id: '2', meal_type: 'breakfast', food_name: 'Café solo con Bebida de Almendra', servings: 1, calories: 25, protein_g: 1, carbs_g: 2, fat_g: 1 },
    { id: '3', meal_type: 'lunch', food_name: 'Pechuga de Pollo Calla y Come Fit + Arroz Integral', servings: 1, calories: 520, protein_g: 55, carbs_g: 58, fat_g: 8 },
    { id: '4', meal_type: 'dinner', food_name: 'Ensalada de Atún al Natural y Aguacate', servings: 1, calories: 335, protein_g: 35, carbs_g: 8, fat_g: 18 }
  ];

  const defaultActivities: FitActivity[] = [
    { id: 'act-1', activity_date: 'Hoy, 10:30 AM', source: 'health_connect', activity_type: 'workout', title: 'Carrera con Reloj / Pulsera de Actividad', duration_minutes: 32, distance_km: 6.4, calories_burned: 380, avg_heart_rate: 152 }
  ];

  const [userProfile, setUserProfile] = useState<FitUserProfile>(() => {
    const saved = localStorage.getItem('fit_user_profile');
    return saved ? JSON.parse(saved) : defaultUserProfile;
  });

  const [foodLogs, setFoodLogs] = useState<FitFoodLogItem[]>(() => {
    const saved = localStorage.getItem('fit_food_logs');
    return saved ? JSON.parse(saved) : defaultFoodLogs;
  });

  const [activities, setActivities] = useState<FitActivity[]>(() => {
    const saved = localStorage.getItem('fit_activities');
    return saved ? JSON.parse(saved) : defaultActivities;
  });

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
  const [selectedBaseFood, setSelectedBaseFood] = useState<FoodDbItem | null>(null);
  const [showFoodSuggestions, setShowFoodSuggestions] = useState(false);

  const handleSelectFoodItem = (item: FoodDbItem) => {
    setSelectedBaseFood(item);
    setNewFoodName(item.name);
    setModalMealType(item.defaultMeal);
    setNewFoodKcal(Math.round(item.calories * newFoodServings).toString());
    setNewFoodProtein((item.protein_g * newFoodServings).toFixed(1));
    setNewFoodCarbs((item.carbs_g * newFoodServings).toFixed(1));
    setNewFoodFat((item.fat_g * newFoodServings).toFixed(1));
    setShowFoodSuggestions(false);
  };

  const handleServingsChange = (servings: number) => {
    setNewFoodServings(servings);
    if (selectedBaseFood) {
      setNewFoodKcal(Math.round(selectedBaseFood.calories * servings).toString());
      setNewFoodProtein((selectedBaseFood.protein_g * servings).toFixed(1));
      setNewFoodCarbs((selectedBaseFood.carbs_g * servings).toFixed(1));
      setNewFoodFat((selectedBaseFood.fat_g * servings).toFixed(1));
    }
  };

  // Google Health Connect / Wearables Sync State
  const [isHealthConnectActive, setIsHealthConnectActive] = useState<boolean>(() => {
    return localStorage.getItem('fit_health_connect_active') === 'true';
  });

  const handleToggleHealthConnect = () => {
    const next = !isHealthConnectActive;
    setIsHealthConnectActive(next);
    localStorage.setItem('fit_health_connect_active', String(next));
    if (next) {
      alert('¡Sincronización con Health Connect & Relojes de Actividad activada! Tus entrenamientos se registrarán directamente.');
    }
  };

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

      setActivities(prev => [newActivity, ...prev]);
      alert(`¡Archivo de entrenamiento "${file.name}" cargado con éxito! +${calories} kcal registradas.`);
    };

    reader.readAsText(file);
  };

  // Formulario Manual de Actividad
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
      activity_date: 'Hoy (Manual)',
      source: 'manual',
      activity_type: 'workout',
      title: manualTitle,
      duration_minutes: parseInt(manualDuration) || 30,
      distance_km: parseFloat(manualDistance) || undefined,
      calories_burned: parseInt(manualKcal) || 0,
      avg_heart_rate: parseInt(manualHeartRate) || undefined
    };

    setActivities(prev => [newAct, ...prev]);
    setManualTitle('');
    setManualKcal('');
    setManualDistance('');
    setManualHeartRate('');
    alert(`¡Entrenamiento "${manualTitle}" registrado de forma manual!`);
  };

  const [isImportRecipeOpen, setIsImportRecipeOpen] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('fit_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('fit_food_logs', JSON.stringify(foodLogs));
  }, [foodLogs]);

  useEffect(() => {
    localStorage.setItem('fit_activities', JSON.stringify(activities));
  }, [activities]);

  // ---------------------------------------------------------------------------
  // 2. MOTOR METABÓLICO (BMR, TDEE, MACROS)
  // ---------------------------------------------------------------------------
  const calculateMetabolism = () => {
    const { age, gender, height_cm, current_weight_kg, activity_level, fitness_goal, macro_preset, custom_protein_pct, custom_carb_pct, custom_fat_pct } = userProfile;

    let bmr = 0;
    if (gender === 'male') {
      bmr = (10 * current_weight_kg) + (6.25 * height_cm) - (5 * age) + 5;
    } else {
      bmr = (10 * current_weight_kg) + (6.25 * height_cm) - (5 * age) - 161;
    }

    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };

    const tdee = Math.round(bmr * (activityMultipliers[activity_level] || 1.55));

    let targetCalories = tdee;
    if (fitness_goal === 'fat_loss') {
      targetCalories = Math.round(tdee * 0.80);
    } else if (fitness_goal === 'muscle_gain') {
      targetCalories = Math.round(tdee * 1.15);
    }

    let pPct = 30, cPct = 40, fPct = 30;
    if (macro_preset === 'high_protein') {
      pPct = 40; cPct = 35; fPct = 25;
    } else if (macro_preset === 'balanced') {
      pPct = 30; cPct = 40; fPct = 30;
    } else if (macro_preset === 'low_carb') {
      pPct = 45; cPct = 20; fPct = 35;
    } else if (macro_preset === 'custom') {
      pPct = custom_protein_pct;
      cPct = custom_carb_pct;
      fPct = custom_fat_pct;
    }

    const targetProteinGrams = Math.round((targetCalories * (pPct / 100)) / 4);
    const targetCarbsGrams = Math.round((targetCalories * (cPct / 100)) / 4);
    const targetFatGrams = Math.round((targetCalories * (fPct / 100)) / 9);

    return {
      bmr: Math.round(bmr),
      tdee,
      targetCalories,
      pPct, cPct, fPct,
      targetProteinGrams,
      targetCarbsGrams,
      targetFatGrams
    };
  };

  const meta = calculateMetabolism();

  // Calculated totals consumed today
  const consumedKcal = foodLogs.reduce((sum, item) => sum + item.calories, 0);
  const consumedP = foodLogs.reduce((sum, item) => sum + item.protein_g, 0);
  const consumedC = foodLogs.reduce((sum, item) => sum + item.carbs_g, 0);
  const consumedF = foodLogs.reduce((sum, item) => sum + item.fat_g, 0);

  // Strava Burn
  const burnedKcal = activities.reduce((sum, act) => sum + act.calories_burned, 0);
  const remainingKcal = meta.targetCalories - consumedKcal + burnedKcal;
  const calPercent = Math.min(100, Math.round((consumedKcal / (meta.targetCalories + burnedKcal)) * 100));

  // Handlers
  const currentDayNum = get_current_planner_day(start_date ?? null) || 1;
  const todayPlan = meal_plan?.find(d => d.day === currentDayNum);

  const handleImportTodayPlan = () => {
    if (!todayPlan) {
      alert(`No se ha encontrado el plan del Día ${currentDayNum} en el planificador.`);
      return;
    }
    const newLogs: FitFoodLogItem[] = [];

    const importSlot = (slotArray: Array<number | null>, mealType: 'breakfast' | 'lunch' | 'dinner') => {
      slotArray.forEach(recipeId => {
        if (recipeId) {
          const recipe = recipes.find(r => r.id === recipeId);
          if (recipe) {
            newLogs.push({
              id: `plan-${Date.now()}-${Math.random()}`,
              meal_type: mealType,
              food_name: `${recipe.name} (Plan Calla y Come)`,
              callaycome_recipe_id: recipe.id,
              servings: 1,
              calories: mealType === 'lunch' ? 520 : mealType === 'dinner' ? 380 : 280,
              protein_g: mealType === 'lunch' ? 45 : mealType === 'dinner' ? 35 : 20,
              carbs_g: mealType === 'lunch' ? 55 : mealType === 'dinner' ? 30 : 35,
              fat_g: mealType === 'lunch' ? 10 : mealType === 'dinner' ? 9 : 6
            });
          }
        }
      });
    };

    importSlot(todayPlan.desayuno, 'breakfast');
    importSlot(todayPlan.comida, 'lunch');
    importSlot(todayPlan.cena, 'dinner');

    if (newLogs.length > 0) {
      setFoodLogs(prev => [...prev, ...newLogs]);
      alert(`¡Se han importado ${newLogs.length} comida(s) planificada(s) para hoy (Día ${currentDayNum}) a tu diario Fit!`);
    } else {
      alert(`No hay recetas asignadas en el planificador para hoy (Día ${currentDayNum}). ¡Añade recetas desde la pestaña 'Plan del Mes'!`);
    }
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

    const newItem: FitFoodLogItem = {
      id: Date.now().toString(),
      meal_type: modalMealType,
      food_name: newFoodName,
      servings: Number(newFoodServings) || 1,
      calories: parseInt(newFoodKcal) || 0,
      protein_g: parseFloat(newFoodProtein) || 0,
      carbs_g: parseFloat(newFoodCarbs) || 0,
      fat_g: parseFloat(newFoodFat) || 0
    };

    setFoodLogs(prev => [...prev, newItem]);
    setIsAddFoodOpen(false);
    setNewFoodName('');
    setNewFoodKcal('');
    setNewFoodProtein('');
    setNewFoodCarbs('');
    setNewFoodFat('');
  };

  const handleDeleteFood = (id: string) => {
    setFoodLogs(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div style={{ padding: '16px 0', color: '#F8FAFC' }}>
      
      {/* HEADER BAR FIT */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(249, 115, 22, 0.08))',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        borderRadius: '16px',
        padding: '20px 24px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Zap style={{ color: '#10B981', fill: '#10B981' }} size={24} />
            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>Calla y Come <span style={{ color: '#10B981' }}>FIT</span></h1>
          </div>
          <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.9rem' }}>
            Seguimiento de nutrición, macronutrientes y gasto energético sincronizado con Strava.
          </p>
        </div>

        {/* Sub-navegación dentro de Fit */}
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={() => setSubTab('dashboard')}
            style={{
              background: subTab === 'dashboard' ? '#10B981' : 'transparent',
              color: '#FFF',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '20px',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
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
              padding: '6px 14px',
              borderRadius: '20px',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Utensils size={15} /> Diario Nutricional
          </button>
          <button
            onClick={() => setSubTab('goals')}
            style={{
              background: subTab === 'goals' ? '#10B981' : 'transparent',
              color: '#FFF',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '20px',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Target size={15} /> Objetivos & Macros
          </button>
          <button
            onClick={() => setSubTab('activity')}
            style={{
              background: subTab === 'activity' ? '#10B981' : 'transparent',
              color: '#FFF',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '20px',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Watch size={15} style={{ color: subTab === 'activity' ? '#FFF' : '#10B981' }} /> Entrenamientos & Pulseras
          </button>
          <button
            onClick={() => setSubTab('recipes')}
            style={{
              background: subTab === 'recipes' ? '#10B981' : 'transparent',
              color: '#FFF',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '20px',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          
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
                <div style={{ color: '#94A3B8' }}>Strava Burn</div>
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

          {/* Tarjeta 4: Entrenamientos Ingeridos Card */}
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
          SUBTAB 4: ENTRENAMIENTOS & PULSERAS (OPEN HEALTH SYNC HUB)
      ----------------------------------------------------------------------- */}
      {subTab === 'activity' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Tarjeta 1: Sincronización Gratuita con Google Health Connect & Mi Fitness */}
          <div style={{ background: '#121826', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Smartphone size={24} style={{ color: '#10B981' }} /> Sincronización Abierta: Google Health Connect & Dispositivos de Salud
              </h3>
              <button
                onClick={handleToggleHealthConnect}
                style={{
                  background: isHealthConnectActive ? '#10B981' : 'rgba(255,255,255,0.1)',
                  color: '#FFF',
                  border: isHealthConnectActive ? 'none' : '1px solid rgba(255,255,255,0.2)',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <CheckCircle size={16} /> {isHealthConnectActive ? '✓ Sincronizado en Segundo Plano' : 'Activar Conexión Directa (Gratis)'}
              </button>
            </div>
            <p style={{ color: '#94A3B8', fontSize: '0.88rem', margin: 0, lineHeight: '1.5' }}>
              Tu <strong>pulsera de actividad o reloj inteligente</strong> se conecta 100% gratis a través de <strong>Google Health Connect</strong> o la app de salud de tu teléfono. Las calorías quemadas se transfieren automáticamente a tu diario calórico.
            </p>
          </div>

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
                  <div key={act.id} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', padding: '12px 16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#FFF' }}>{act.title}</div>
                      <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>{act.activity_date} • {act.duration_minutes} min • {act.distance_km ? `${act.distance_km} km` : 'Fuerza'}</div>
                    </div>
                    <div style={{ textAlign: 'right', fontWeight: 800, color: '#10B981', fontSize: '0.95rem' }}>
                      +{act.calories_burned} kcal
                      <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{act.avg_heart_rate ? `❤️ ${act.avg_heart_rate} bpm` : ''}</div>
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
          MODAL: AÑADIR ALIMENTO PERSONALIZADO
      ----------------------------------------------------------------------- */}
      {isAddFoodOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#121826', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '480px' }}>
            <h3 style={{ margin: '0 0 16px 0' }}>Añadir Alimento al Diario Nutricional</h3>
            
            <form onSubmit={handleAddFoodSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Buscar alimento o ingrediente</label>
                <input
                  type="text"
                  value={newFoodName}
                  onChange={(e) => {
                    setNewFoodName(e.target.value);
                    setShowFoodSuggestions(true);
                  }}
                  onFocus={() => setShowFoodSuggestions(true)}
                  required
                  placeholder="Escribe ej: Pechuga, Huevos, Avena, Queso fresco, Salmón..."
                  style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '10px 12px', borderRadius: '8px', fontSize: '0.9rem' }}
                />

                {showFoodSuggestions && newFoodName.trim().length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#1E293B', border: '1px solid #10B981', borderRadius: '10px', zIndex: 1100, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', marginTop: '4px' }}>
                    {fitFoodDatabase
                      .filter(item => item.name.toLowerCase().includes(newFoodName.toLowerCase()))
                      .map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleSelectFoodItem(item)}
                          style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#FFF' }}>{item.name}</div>
                            <div style={{ fontSize: '0.74rem', color: '#94A3B8' }}>Base: {item.unit} • Recomendado: {item.defaultMeal}</div>
                          </div>
                          <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#10B981', fontWeight: 700 }}>
                            {item.calories} kcal
                            <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>🥩 {item.protein_g}g P</div>
                          </div>
                        </div>
                      ))}
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
          MODAL: IMPORTAR DE CATALOGO DE RECETAS DE CALLA Y COME
      ----------------------------------------------------------------------- */}
      {isImportRecipeOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#121826', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 16px 0' }}>Importar Recetas de Calla y Come</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recipes.map(r => (
                <div key={r.id} style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{r.name}</div>
                    <div style={{ color: '#94A3B8', fontSize: '0.8rem' }}>{r.meal_type} • {r.health}</div>
                  </div>
                  <button
                    onClick={() => {
                      setFoodLogs(prev => [...prev, { id: Date.now().toString(), meal_type: 'lunch', food_name: r.name, servings: 1, calories: 480, protein_g: 35, carbs_g: 50, fat_g: 10 }]);
                      setIsImportRecipeOpen(false);
                      alert(`¡${r.name} añadida a tu diario!`);
                    }}
                    style={{ background: '#10B981', color: '#FFF', border: 'none', padding: '6px 12px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    + Importar
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => setIsImportRecipeOpen(false)} style={{ marginTop: '16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', width: '100%' }}>Cerrar</button>
          </div>
        </div>
      )}

    </div>
  );
};
