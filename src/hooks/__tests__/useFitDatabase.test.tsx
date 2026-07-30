import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useFitDatabase } from '../useFitDatabase';
import type { FitFoodLogItem, FitActivity, FitWeightLogItem } from '../../types';

describe('useFitDatabase Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should initialize with default user profile and food logs when unauthenticated', () => {
    const { result } = renderHook(() => useFitDatabase(null));

    expect(result.current.userProfile.gender).toBe('female');
    expect(result.current.userProfile.daily_calorie_target).toBeGreaterThan(0);
    expect(result.current.foodLogs.length).toBeGreaterThan(0);
    expect(result.current.activities.length).toBeGreaterThan(0);
    expect(result.current.weightLogs.length).toBeGreaterThan(0);
  });

  it('should allow adding a new food log item', async () => {
    const { result } = renderHook(() => useFitDatabase(null));

    const newFood: FitFoodLogItem = {
      id: 'test-food-1',
      meal_type: 'lunch',
      food_name: 'Pechuga de Pavo a la Plancha',
      servings: 1,
      calories: 180,
      protein_g: 35,
      carbs_g: 0,
      fat_g: 3
    };

    await act(async () => {
      await result.current.addFoodLog(newFood);
    });

    expect(result.current.foodLogs).toContainEqual(newFood);
  });

  it('should allow removing a food log item by ID', async () => {
    const { result } = renderHook(() => useFitDatabase(null));
    const targetId = result.current.foodLogs[0].id;

    await act(async () => {
      await result.current.removeFoodLog(targetId);
    });

    const exists = result.current.foodLogs.some(item => item.id === targetId);
    expect(exists).toBe(false);
  });

  it('should allow adding and updating fitness activities', async () => {
    const { result } = renderHook(() => useFitDatabase(null));

    const newActivity: FitActivity = {
      id: 'act-test-1',
      activity_date: 'Hoy, 18:00',
      source: 'manual',
      activity_type: 'workout',
      title: 'Entrenamiento de Fuerza Fit',
      duration_minutes: 45,
      calories_burned: 320
    };

    await act(async () => {
      await result.current.addActivity(newActivity);
    });

    expect(result.current.activities).toContainEqual(newActivity);

    const updatedActivity = { ...newActivity, duration_minutes: 60, calories_burned: 400 };

    await act(async () => {
      await result.current.updateActivity(updatedActivity);
    });

    const found = result.current.activities.find(a => a.id === 'act-test-1');
    expect(found?.duration_minutes).toBe(60);
    expect(found?.calories_burned).toBe(400);
  });

  it('should allow adding and removing weight progression logs', async () => {
    const { result } = renderHook(() => useFitDatabase(null));

    const newLog: FitWeightLogItem = {
      id: 'weight-test-1',
      log_date: '2026-07-30',
      weight_kg: 66.5,
      muscle_mass_kg: 29.2,
      fat_percentage: 20.5,
      waist_cm: 74.5,
      notes: 'Test pesaje'
    };

    await act(async () => {
      await result.current.addWeightLog(newLog);
    });

    expect(result.current.weightLogs).toContainEqual(newLog);

    await act(async () => {
      await result.current.removeWeightLog('weight-test-1');
    });

    const exists = result.current.weightLogs.some(w => w.id === 'weight-test-1');
    expect(exists).toBe(false);
  });
});
