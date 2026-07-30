import { useState, useEffect, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { get_supabase_client } from '../services/supabase_client';
import type { FitUserProfile, FitFoodLogItem, FitActivity } from '../types';

export const useFitDatabase = (user: User | null) => {
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<FitUserProfile>(() => {
    const saved = localStorage.getItem('fit_user_profile');
    return saved ? JSON.parse(saved) : {
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
      water_logged_ml: 1750,
      daily_sleep_target_hours: 8,
      sleep_logged_hours: 7.5
    };
  });

  const [foodLogs, setFoodLogs] = useState<FitFoodLogItem[]>(() => {
    const saved = localStorage.getItem('fit_food_logs');
    return saved ? JSON.parse(saved) : [
      { id: '1', meal_type: 'breakfast', food_name: 'Tortilla Fit de Clara y Pavo', servings: 1, calories: 260, protein_g: 32, carbs_g: 4, fat_g: 12 },
      { id: '2', meal_type: 'breakfast', food_name: 'Café solo con Bebida de Almendra', servings: 1, calories: 25, protein_g: 1, carbs_g: 2, fat_g: 1 },
      { id: '3', meal_type: 'lunch', food_name: 'Pechuga de Pollo Calla y Come Fit + Arroz Integral', servings: 1, calories: 520, protein_g: 55, carbs_g: 58, fat_g: 8 },
      { id: '4', meal_type: 'dinner', food_name: 'Ensalada de Atún al Natural y Aguacate', servings: 1, calories: 335, protein_g: 35, carbs_g: 8, fat_g: 18 }
    ];
  });

  const [activities, setActivities] = useState<FitActivity[]>(() => {
    const saved = localStorage.getItem('fit_activities');
    return saved ? JSON.parse(saved) : [
      { id: 'act-1', activity_date: 'Hoy, 10:30 AM', source: 'health_connect', activity_type: 'workout', title: 'Carrera con Reloj / Pulsera de Actividad', duration_minutes: 32, distance_km: 6.4, calories_burned: 380, avg_heart_rate: 152 }
    ];
  });

  // 1. Cargar datos de Supabase si el usuario ha iniciado sesión
  useEffect(() => {
    if (!user) return;
    const client = get_supabase_client();
    if (!client) return;

    setLoading(true);

    const loadFitData = async () => {
      try {
        // Cargar perfil Fit
        const { data: profileData, error: profileErr } = await client
          .from('fit_user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileData && !profileErr) {
          const loadedProfile: FitUserProfile = {
            age: profileData.age,
            gender: profileData.gender,
            height_cm: Number(profileData.height_cm),
            current_weight_kg: Number(profileData.current_weight_kg),
            target_weight_kg: Number(profileData.target_weight_kg),
            activity_level: profileData.activity_level,
            fitness_goal: profileData.fitness_goal,
            bmr: profileData.bmr,
            tdee: profileData.tdee,
            daily_calorie_target: profileData.daily_calorie_target,
            macro_preset: profileData.macro_preset,
            custom_protein_pct: profileData.custom_protein_pct,
            custom_carb_pct: profileData.custom_carb_pct,
            custom_fat_pct: profileData.custom_fat_pct,
            daily_water_target_ml: profileData.daily_water_target_ml || 2500,
            water_logged_ml: userProfile.water_logged_ml
          };
          setUserProfile(loadedProfile);
          localStorage.setItem('fit_user_profile', JSON.stringify(loadedProfile));
        } else if (profileErr && profileErr.code === 'PGRST116') {
          // No existe perfil aún en Supabase: Guardar el perfil inicial
          await client.from('fit_user_profiles').upsert({
            user_id: user.id,
            age: userProfile.age,
            gender: userProfile.gender,
            height_cm: userProfile.height_cm,
            current_weight_kg: userProfile.current_weight_kg,
            target_weight_kg: userProfile.target_weight_kg,
            activity_level: userProfile.activity_level,
            fitness_goal: userProfile.fitness_goal,
            bmr: userProfile.bmr,
            tdee: userProfile.tdee,
            daily_calorie_target: userProfile.daily_calorie_target,
            macro_preset: userProfile.macro_preset,
            custom_protein_pct: userProfile.custom_protein_pct,
            custom_carb_pct: userProfile.custom_carb_pct,
            custom_fat_pct: userProfile.custom_fat_pct,
            daily_water_target_ml: userProfile.daily_water_target_ml
          });
        }

        // Cargar registros de alimentos del día
        const todayStr = new Date().toISOString().split('T')[0];
        const { data: logsData } = await client
          .from('fit_daily_food_logs')
          .select('*')
          .eq('user_id', user.id)
          .eq('log_date', todayStr);

        if (logsData && logsData.length > 0) {
          const loadedLogs: FitFoodLogItem[] = logsData.map(item => ({
            id: item.id,
            user_id: item.user_id,
            meal_type: item.meal_type,
            food_name: item.food_name,
            servings: Number(item.servings),
            calories: item.calories,
            protein_g: Number(item.protein_g),
            carbs_g: Number(item.carbs_g),
            fat_g: Number(item.fat_g)
          }));
          setFoodLogs(loadedLogs);
          localStorage.setItem('fit_food_logs', JSON.stringify(loadedLogs));
        }

        // Cargar actividades de hoy
        const { data: actData } = await client
          .from('fit_activities')
          .select('*')
          .eq('user_id', user.id);

        if (actData && actData.length > 0) {
          const loadedActs: FitActivity[] = actData.map(item => ({
            id: item.id,
            user_id: item.user_id,
            activity_date: new Date(item.activity_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            source: item.source || 'manual',
            activity_type: item.activity_type || 'workout',
            title: item.title,
            duration_minutes: item.duration_minutes,
            distance_km: item.distance_km ? Number(item.distance_km) : undefined,
            calories_burned: item.calories_burned,
            avg_heart_rate: item.avg_heart_rate || undefined
          }));
          setActivities(loadedActs);
          localStorage.setItem('fit_activities', JSON.stringify(loadedActs));
        }
      } catch (err) {
        console.error('Error cargando datos Fit desde Supabase:', err);
      } finally {
        setLoading(false);
      }
    };

    loadFitData();
  }, [user]);

  // 2. Persistir perfil Fit en Supabase cuando cambie
  const updateProfile = useCallback(async (newProfile: FitUserProfile | ((prev: FitUserProfile) => FitUserProfile)) => {
    setUserProfile(prev => {
      const updated = typeof newProfile === 'function' ? newProfile(prev) : newProfile;
      localStorage.setItem('fit_user_profile', JSON.stringify(updated));

      if (user) {
        const client = get_supabase_client();
        if (client) {
          client.from('fit_user_profiles').upsert({
            user_id: user.id,
            age: updated.age,
            gender: updated.gender,
            height_cm: updated.height_cm,
            current_weight_kg: updated.current_weight_kg,
            target_weight_kg: updated.target_weight_kg,
            activity_level: updated.activity_level,
            fitness_goal: updated.fitness_goal,
            bmr: updated.bmr,
            tdee: updated.tdee,
            daily_calorie_target: updated.daily_calorie_target,
            macro_preset: updated.macro_preset,
            custom_protein_pct: updated.custom_protein_pct,
            custom_carb_pct: updated.custom_carb_pct,
            custom_fat_pct: updated.custom_fat_pct,
            daily_water_target_ml: updated.daily_water_target_ml,
            updated_at: new Date().toISOString()
          }).then(({ error }) => {
            if (error) console.error('Error guardando perfil Fit en Supabase:', error.message);
          });
        }
      }
      return updated;
    });
  }, [user]);

  // 3. Añadir alimento y guardar en Supabase
  const addFoodLog = useCallback(async (item: FitFoodLogItem) => {
    setFoodLogs(prev => {
      const updated = [...prev, item];
      localStorage.setItem('fit_food_logs', JSON.stringify(updated));
      return updated;
    });

    if (user) {
      const client = get_supabase_client();
      if (client) {
        const { error } = await client.from('fit_daily_food_logs').insert({
          user_id: user.id,
          log_date: new Date().toISOString().split('T')[0],
          meal_type: item.meal_type,
          food_name: item.food_name,
          servings: item.servings,
          calories: item.calories,
          protein_g: item.protein_g,
          carbs_g: item.carbs_g,
          fat_g: item.fat_g
        });
        if (error) console.error('Error guardando alimento en Supabase:', error.message);
      }
    }
  }, [user]);

  // 4. Eliminar alimento de Supabase
  const removeFoodLog = useCallback(async (id: string) => {
    setFoodLogs(prev => {
      const updated = prev.filter(item => item.id !== id);
      localStorage.setItem('fit_food_logs', JSON.stringify(updated));
      return updated;
    });

    if (user) {
      const client = get_supabase_client();
      if (client) {
        await client.from('fit_daily_food_logs').delete().eq('id', id).eq('user_id', user.id);
      }
    }
  }, [user]);

  // 5. Añadir actividad y guardar en Supabase
  const addActivity = useCallback(async (act: FitActivity) => {
    setActivities(prev => {
      const updated = [act, ...prev];
      localStorage.setItem('fit_activities', JSON.stringify(updated));
      return updated;
    });

    if (user) {
      const client = get_supabase_client();
      if (client) {
        const { error } = await client.from('fit_activities').insert({
          user_id: user.id,
          source: act.source,
          activity_type: act.activity_type || 'workout',
          title: act.title,
          duration_minutes: act.duration_minutes,
          distance_km: act.distance_km || 0,
          calories_burned: act.calories_burned,
          avg_heart_rate: act.avg_heart_rate || null
        });
        if (error) console.error('Error guardando actividad en Supabase:', error.message);
      }
    }
  }, [user]);

  // 6. Eliminar actividad de Supabase
  const removeActivity = useCallback(async (id: string) => {
    setActivities(prev => {
      const updated = prev.filter(act => act.id !== id);
      localStorage.setItem('fit_activities', JSON.stringify(updated));
      return updated;
    });

    if (user) {
      const client = get_supabase_client();
      if (client) {
        await client.from('fit_activities').delete().eq('id', id).eq('user_id', user.id);
      }
    }
  }, [user]);

  // 7. Editar actividad en Supabase
  const updateActivity = useCallback(async (updatedAct: FitActivity) => {
    setActivities(prev => {
      const updated = prev.map(act => act.id === updatedAct.id ? updatedAct : act);
      localStorage.setItem('fit_activities', JSON.stringify(updated));
      return updated;
    });

    if (user) {
      const client = get_supabase_client();
      if (client) {
        await client.from('fit_activities').update({
          title: updatedAct.title,
          duration_minutes: updatedAct.duration_minutes,
          distance_km: updatedAct.distance_km || 0,
          calories_burned: updatedAct.calories_burned,
          avg_heart_rate: updatedAct.avg_heart_rate || null
        }).eq('id', updatedAct.id).eq('user_id', user.id);
      }
    }
  }, [user]);

  return {
    loading,
    userProfile,
    setUserProfile: updateProfile,
    foodLogs,
    setFoodLogs,
    addFoodLog,
    removeFoodLog,
    activities,
    setActivities,
    addActivity,
    removeActivity,
    updateActivity
  };
};
