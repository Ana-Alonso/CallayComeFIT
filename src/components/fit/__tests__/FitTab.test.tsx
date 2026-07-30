import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FitTab from '../FitTab';
import type { User } from '@supabase/supabase-js';
import type { Recipe, Profile, MealPlanDay } from '../../../types';

const mockUser: User = {
  id: 'user-test-123',
  email: 'testfit@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString()
};

const mockProfile: Profile = {
  id: 'user-test-123',
  email: 'testfit@example.com',
  display_name: 'Usuario Fit',
  active_family_id: null
};

const mockMealPlanDay: MealPlanDay = {
  day: 1,
  desayuno: [1],
  comida: [2],
  cena: [3]
};

const mockRecipes: Recipe[] = [
  {
    id: 1,
    name: 'Pollo al Horno con Patatas Fit',
    meal_type: 'comida',
    price: 'economica',
    difficulty: 'facil',
    health: 'saludable',
    diet_type: 'omnivoro',
    allergens: [],
    ingredients: [{ name: 'Pechuga de pollo', quantity: 200, unit: 'g' }],
    instructions: ['Hornear']
  }
];

describe('FitTab Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders Fit navigation sub-tabs correctly', () => {
    render(
      <FitTab
        user={mockUser}
        profile={mockProfile}
        recipes={mockRecipes}
        meal_plan={[mockMealPlanDay]}
      />
    );

    expect(screen.getAllByText(/Resumen/i)[0]).toBeDefined();
    expect(screen.getAllByText(/Diario/i)[0]).toBeDefined();
    expect(screen.getAllByText(/Objetivos/i)[0]).toBeDefined();
    expect(screen.getAllByText(/Actividad/i)[0]).toBeDefined();
    expect(screen.getAllByText(/Recetas/i)[0]).toBeDefined();
    expect(screen.getByText(/Progresión/i)).toBeDefined();
  });

  it('allows switching between sub-tabs including Progresión', () => {
    render(
      <FitTab
        user={mockUser}
        profile={mockProfile}
        recipes={mockRecipes}
        meal_plan={[mockMealPlanDay]}
      />
    );

    const diaryTabBtn = screen.getAllByText(/Diario/i)[0];
    fireEvent.click(diaryTabBtn);

    expect(screen.getAllByText(/Desayuno/i).length).toBeGreaterThan(0);

    const goalsTabBtn = screen.getAllByText(/Objetivos/i)[0];
    fireEvent.click(goalsTabBtn);

    expect(screen.getByText(/Calculadora Metabólica/i)).toBeDefined();

    const progressTabBtn = screen.getByText(/Progresión/i);
    fireEvent.click(progressTabBtn);

    expect(screen.getByText(/Evolución Corporal y Rendimiento/i)).toBeDefined();
    expect(screen.getByText(/\+ Registrar Pesaje \/ Composición/i)).toBeDefined();
  });
});
