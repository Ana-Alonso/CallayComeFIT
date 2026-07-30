export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface Recipe {
  id: number;
  name: string;
  meal_type: 'desayuno' | 'comida' | 'cena';
  price: 'economica' | 'cara';
  difficulty: 'facil' | 'intermedia' | 'dificil';
  health: 'saludable' | 'no saludable';
  diet_type: 'omnivoro' | 'vegetariano' | 'vegano' | 'pescetariano' | 'keto' | 'paleo' | 'sin_gluten' | 'sin_lactosa' | 'mediterranea';
  allergens: string[];
  ingredients: Ingredient[];
  instructions: string[];
  portions?: number;
  servings?: number;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
}

export interface PantryItem {
  id?: number;
  ingredient_name: string;
  quantity: number;
  unit: string;
}

export interface ShoppingItem {
  id?: number;
  ingredient_name: string;
  quantity: number;
  unit: string;
  purchased: boolean;
  manual?: boolean;
}

export interface MealPlanDay {
  day: number;
  desayuno: Array<number | null>;
  comida: Array<number | null>;
  cena: Array<number | null>;
}

export interface FilterState {
  ingredients_count: 'all' | 'few' | 'many';
  allergies: string[];
  diets: string[];
  price: 'all' | 'economica' | 'cara';
  difficulty: 'all' | 'facil' | 'intermedia' | 'dificil';
  health: 'all' | 'saludable' | 'no saludable';
}

export interface ToastMessage {
  id: number;
  title: string;
  body: string;
}

export interface Profile {
  id: string;
  email: string;
  display_name: string;
  active_family_id: string | null;
}

export interface FamilyUnit {
  id: string;
  name: string;
  invite_code: string;
}

export interface FamilyMember {
  family_id: string;
  user_id: string;
  role: 'cocinitas' | 'miembro';
  family_name?: string;
  invite_code?: string;
}

export interface RecipeSuggestion {
  id: number;
  family_id: string;
  day: number;
  meal_type: 'desayuno' | 'comida' | 'cena';
  suggested_recipe_id: number;
  suggested_by: string;
  status: 'pendiente' | 'aprobado' | 'rechazado';
  user_display_name?: string;
  recipe_name?: string;
  likes_count?: number;
  dislikes_count?: number;
  my_vote?: 'like' | 'dislike' | null;
}

export interface CookRecipeConfig {
  recipe_id: number;
  portions: number;
  leftovers: number;
}

export interface IngredientMapping {
  id?: number;
  ingredient_name: string;
  product_name: string;
  price: number;
  package_qty: number;
  package_unit: string;
  supermarket_id: string;
  reference_id?: string;
}

export interface FitUserProfile {
  user_id?: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height_cm: number;
  current_weight_kg: number;
  target_weight_kg: number;
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  fitness_goal: 'fat_loss' | 'maintenance' | 'muscle_gain';
  bmr: number;
  tdee: number;
  daily_calorie_target: number;
  macro_preset: 'high_protein' | 'balanced' | 'low_carb' | 'custom';
  custom_protein_pct: number;
  custom_carb_pct: number;
  custom_fat_pct: number;
  daily_water_target_ml: number;
  water_logged_ml?: number;
  daily_sleep_target_hours?: number;
  sleep_logged_hours?: number;
}

export interface FitFoodLogItem {
  id: string;
  user_id?: string;
  log_date?: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  food_name: string;
  callaycome_recipe_id?: number | null;
  servings: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface FitActivity {
  id: string;
  user_id?: string;
  activity_date?: string;
  source: 'google_fit' | 'health_connect' | 'fitbit' | 'gpx_file' | 'manual';
  external_activity_id?: string;
  activity_type: string;
  title: string;
  duration_minutes: number;
  distance_km?: number;
  calories_burned: number;
  avg_heart_rate?: number;
}

export interface FitWeightLogItem {
  id: string;
  user_id?: string;
  log_date: string;
  weight_kg: number;
  muscle_mass_kg?: number;
  fat_percentage?: number;
  waist_cm?: number;
  notes?: string;
}

