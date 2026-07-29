export interface NutritionalInfo {
  calories: number; // per 100g or unit
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  unit: string;
}

const NUTRITION_DATABASE: Record<string, NutritionalInfo> = {
  'pollo': { calories: 165, protein_g: 31.0, carbs_g: 0.0, fat_g: 3.6, unit: '100g' },
  'pechuga': { calories: 165, protein_g: 31.0, carbs_g: 0.0, fat_g: 3.6, unit: '100g' },
  'huevo': { calories: 155, protein_g: 13.0, carbs_g: 1.1, fat_g: 11.0, unit: '2 ud' },
  'claras': { calories: 52, protein_g: 11.0, carbs_g: 0.7, fat_g: 0.2, unit: '100g' },
  'arroz': { calories: 130, protein_g: 2.7, carbs_g: 28.0, fat_g: 1.0, unit: '100g' },
  'avena': { calories: 389, protein_g: 16.9, carbs_g: 66.3, fat_g: 6.9, unit: '100g' },
  'atun': { calories: 85, protein_g: 19.5, carbs_g: 0.0, fat_g: 0.8, unit: '100g' },
  'salmon': { calories: 208, protein_g: 20.0, carbs_g: 0.0, fat_g: 13.0, unit: '100g' },
  'aguacate': { calories: 160, protein_g: 2.0, carbs_g: 8.5, fat_g: 14.7, unit: '100g' },
  'queso': { calories: 80, protein_g: 10.0, carbs_g: 3.5, fat_g: 2.5, unit: '100g' },
  'leche': { calories: 45, protein_g: 3.0, carbs_g: 4.8, fat_g: 1.5, unit: '100ml' },
  'pan': { calories: 240, protein_g: 9.0, carbs_g: 45.0, fat_g: 2.5, unit: '100g' },
  'tomate': { calories: 18, protein_g: 0.9, carbs_g: 3.9, fat_g: 0.2, unit: '100g' },
  'aceite': { calories: 884, protein_g: 0.0, carbs_g: 0.0, fat_g: 100.0, unit: '100ml' },
  'patata': { calories: 77, protein_g: 2.0, carbs_g: 17.0, fat_g: 0.1, unit: '100g' },
  'lentejas': { calories: 116, protein_g: 9.0, carbs_g: 20.0, fat_g: 1.2, unit: '100g' },
  'garbanzos': { calories: 120, protein_g: 8.5, carbs_g: 20.0, fat_g: 2.0, unit: '100g' },
  'pavo': { calories: 110, protein_g: 24.0, carbs_g: 0.0, fat_g: 1.5, unit: '100g' },
  'manzana': { calories: 52, protein_g: 0.3, carbs_g: 13.8, fat_g: 0.2, unit: '100g' },
  'platano': { calories: 89, protein_g: 1.1, carbs_g: 22.8, fat_g: 0.3, unit: '100g' },
  'espinacas': { calories: 23, protein_g: 2.9, carbs_g: 3.6, fat_g: 0.4, unit: '100g' }
};

export const getIngredientNutrition = (ingredientName: string, quantity: number = 1): NutritionalInfo => {
  const normalized = ingredientName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  for (const [key, val] of Object.entries(NUTRITION_DATABASE)) {
    if (normalized.includes(key)) {
      const factor = quantity > 0 ? (quantity > 10 ? quantity / 100 : quantity) : 1;
      return {
        calories: Math.round(val.calories * factor),
        protein_g: parseFloat((val.protein_g * factor).toFixed(1)),
        carbs_g: parseFloat((val.carbs_g * factor).toFixed(1)),
        fat_g: parseFloat((val.fat_g * factor).toFixed(1)),
        unit: val.unit
      };
    }
  }

  // Generic fallback estimation if not found
  const factor = quantity > 0 ? (quantity > 10 ? quantity / 100 : quantity) : 1;
  return {
    calories: Math.round(120 * factor),
    protein_g: parseFloat((8 * factor).toFixed(1)),
    carbs_g: parseFloat((15 * factor).toFixed(1)),
    fat_g: parseFloat((3 * factor).toFixed(1)),
    unit: '100g'
  };
};
