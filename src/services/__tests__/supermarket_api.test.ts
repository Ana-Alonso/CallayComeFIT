import { describe, it, expect, beforeEach } from 'vitest';
import { 
  getProductMacros, 
  formatSupermarketName, 
  calculateRecipeNutritionalMacros,
  saveSupermarketProductMacros
} from '../supermarket_api';

describe('Supermarket API Services', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('formatSupermarketName', () => {
    it('should format supermarket names correctly', () => {
      expect(formatSupermarketName('mercadona')).toBe('Mercadona');
      expect(formatSupermarketName('aldi')).toBe('Aldi');
      expect(formatSupermarketName('carrefour')).toBe('Carrefour');
      expect(formatSupermarketName('dia')).toBe('Dia');
      expect(formatSupermarketName('lidl')).toBe('Lidl');
      expect(formatSupermarketName('eroski')).toBe('Eroski');
      expect(formatSupermarketName('')).toBe('Mercadona');
    });
  });

  describe('getProductMacros', () => {
    it('should return accurate nutritional macros for known foods', () => {
      const pollo = getProductMacros('Pechuga de pollo fresca', 'Mercadona');
      expect(pollo).not.toBeNull();
      expect(pollo?.calories).toBe(165);
      expect(pollo?.protein_g).toBe(31.0);

      const huevo = getProductMacros('Huevos frescos camperos', 'Aldi');
      expect(huevo).not.toBeNull();
      expect(huevo?.protein_g).toBe(13.0);
    });

    it('should return null for unknown foods without default fallbacks', () => {
      const unknownFood = getProductMacros('Producto Desconocido XYZ99', 'Carrefour');
      expect(unknownFood).toBeNull();
    });
  });

  describe('saveSupermarketProductMacros', () => {
    it('should save custom product macros locally for immediate retrieval', async () => {
      const customMacro = {
        nombre: 'Proteína Isolada Vainilla',
        supermercado: 'Mercadona',
        calories: 370,
        protein_g: 85.0,
        carbs_g: 2.0,
        fat_g: 1.5,
        unit: '100g'
      };

      const result = await saveSupermarketProductMacros(customMacro);
      expect(result).toBe(true);

      const fetched = getProductMacros('Proteína Isolada Vainilla', 'Mercadona');
      expect(fetched).not.toBeNull();
      expect(fetched?.calories).toBe(370);
      expect(fetched?.protein_g).toBe(85.0);
    });
  });

  describe('calculateRecipeNutritionalMacros', () => {
    it('should calculate total calories and macros for a recipe', () => {
      const sampleRecipe = {
        id: 1,
        name: 'Arroz con Pechuga de Pollo y Pimiento',
        portions: 2,
        ingredients: [
          { name: 'Arroz', quantity: 200, unit: 'g' },
          { name: 'Pechuga de pollo', quantity: 300, unit: 'g' },
          { name: 'Pimiento verde', quantity: 100, unit: 'g' }
        ],
        steps: ['Cocinar arroz', 'Saltear pollo y pimiento']
      };

      const breakdown = calculateRecipeNutritionalMacros(sampleRecipe);

      expect(breakdown.totalCalories).toBeGreaterThan(0);
      expect(breakdown.totalProtein).toBeGreaterThan(0);
      expect(breakdown.ingredients.length).toBe(3);
    });
  });
});
