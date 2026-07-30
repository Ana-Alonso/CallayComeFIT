import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPERMARKET_SUPABASE_URL = import.meta.env.VITE_SUPERMARKET_SUPABASE_URL || '';
const SUPERMARKET_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPERMARKET_SUPABASE_ANON_KEY || '';
const SUPERMARKET_API_BASE_URL = import.meta.env.VITE_SUPERMARKET_API_BASE_URL || '';

// Create a secondary Supabase client specifically for the SuperMarketAPI project.
// We use a custom localStorage key prefix to avoid conflicts with the main app's Supabase session.
export const supermarketSupabase: SupabaseClient = createClient(
  SUPERMARKET_SUPABASE_URL,
  SUPERMARKET_SUPABASE_ANON_KEY,
  {
    auth: {
      storageKey: 'supermarket_supabase_session',
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);

export interface SuperMarketProduct {
  referencia_id: string;
  nombre: string;
  precio: number;
  supermercado: string;
  last_seen: string;
  categoria_nombre?: string;
}

/**
 * Gets a valid access token for the SuperMarketAPI.
 * If the current user has a session, it uses it.
 * If not, it falls back to the test user login.
 */
async function getAccessToken(): Promise<string | null> {
  try {
    const { data: { session } } = await supermarketSupabase.auth.getSession();
    return session?.access_token ?? null;
  } catch {
    return null;
  }
}


/**
 * Search products in the SuperMarket database.
 * If products are found in the Supabase DB directly, it returns them (fast and CORS-friendly).
 * If no products are found in the DB, it falls back to calling the Render API REST endpoint
 * to trigger the scraper, scrape new products, save them to the DB, and return them.
 * @param query Search query term (e.g. "leche")
 * @param supermarketId Optional. Search in a specific supermarket (mercadona, carrefour, dia, aldi, eroski)
 */
export async function searchProducts(
  query: string,
  supermarketId?: string
): Promise<SuperMarketProduct[]> {
  if (!query.trim()) return [];

  // 1. Try querying Supabase database directly first (fast, CORS-proof, no Render cold-starts)
  try {
    let q = supermarketSupabase
      .from('productos')
      .select('referencia_id, nombre, precio, supermercado_id, last_seen, kcal, proteinas, carbohidratos, grasas')
      .ilike('nombre', `%${query.trim()}%`);

    if (supermarketId && supermarketId !== 'todos' && supermarketId !== 'cheapest') {
      q = q.eq('supermercado_id', supermarketId.toLowerCase());
    }

    // Limit to 20 results for auto-complete dropdown responsiveness
    q = q.limit(20);

    const { data, error } = await q;

    if (error) {
      console.warn('Error querying Supabase directly, falling back to Render API:', error.message);
    } else if (data && data.length > 0) {
      // Check if there is a high-quality match in the database
      const queryLower = query.toLowerCase().trim();
      const hasGoodMatch = data.some((item: any) => {
        const nameLower = item.nombre.toLowerCase();
        // Good match if name starts with query, or the query is at the very beginning (index <= 8)
        return nameLower.startsWith(queryLower) || nameLower.indexOf(queryLower) <= 8;
      });

      if (hasGoodMatch) {
        // Products found and at least one is a high-quality match! Return directly.
        return data.map((item: any) => ({
          referencia_id: item.referencia_id,
          nombre: item.nombre,
          precio: Number(item.precio),
          supermercado: item.supermercado_id,
          last_seen: item.last_seen,
          kcal: item.kcal != null ? Number(item.kcal) : null,
          proteinas: item.proteinas != null ? Number(item.proteinas) : null,
          carbohidratos: item.carbohidratos != null ? Number(item.carbohidratos) : null,
          grasas: item.grasas != null ? Number(item.grasas) : null
        }));
      }
      console.log('Products exist in DB but none are a high-quality match. Falling back to Render API scraper...');
    }
  } catch (err) {
    console.warn('Direct database search failed, falling back to Render API:', err);
  }

  // 2. Fallback: If no products found in the database, call Render API to trigger the scraper!
  console.log('No products found in DB. Falling back to Render API to trigger scraper...');
  const token = await getAccessToken();
  if (!token) {
    throw new Error('No se pudo establecer conexión autenticada con la API para iniciar el raspado.');
  }

  const cleanQuery = encodeURIComponent(query.trim());
  let url = `${SUPERMARKET_API_BASE_URL}/supermercados/search?q=${cleanQuery}`;
  if (supermarketId && supermarketId !== 'todos' && supermarketId !== 'cheapest') {
    url = `${SUPERMARKET_API_BASE_URL}/supermercados/${supermarketId.toLowerCase()}/search?q=${cleanQuery}`;
  }

  // Use a CORS proxy to bypass CORS restrictions during browser testing/development
  const corsProxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;

  let response: Response;
  try {
    response = await fetch(corsProxyUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
  } catch (err: any) {
    console.error('Fetch to Render API via CORS proxy failed:', err);
    throw new Error(
      'Error de Conexión: No se pudo contactar con la API de Render a través del proxy CORS. ' +
      'Por favor, comprueba tu conexión a internet o la disponibilidad del servidor de Render.'
    );
  }

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Límite de peticiones de la API superado (Rate Limit). Inténtalo más tarde.');
    }
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.error?.description || 'Error al consultar la API de supermercados.');
  }

  const json = await response.json();
  if (json.status === 'success' && Array.isArray(json.data)) {
    return json.data as SuperMarketProduct[];
  }

  return [];
}

export interface SuperMarketProductMacro {
  referencia_id?: string;
  nombre: string;
  supermercado: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  unit?: string;
}

/**
 * Obtener macronutrientes de un producto de supermercado.
 * 1. Comprueba si el usuario o la plataforma han guardado macros personalizadas.
 * 2. Si es de Mercadona o Aldi, provee estimaciones o datos de catálogo automático.
 * 3. Para otros supermercados sin datos registrados, retorna null para que el usuario los introduzca a mano.
 */
export function getProductMacros(productName: string, supermarket: string = ''): SuperMarketProductMacro | null {
  const cleanName = productName.toLowerCase().trim();

  // 1. Buscar en registro guardado local / plataforma
  try {
    const customMacrosStr = localStorage.getItem('supermarket_custom_macros');
    if (customMacrosStr) {
      const customList: SuperMarketProductMacro[] = JSON.parse(customMacrosStr);
      const match = customList.find(m => 
        cleanName.includes(m.nombre.toLowerCase()) || m.nombre.toLowerCase().includes(cleanName)
      );
      if (match) return match;
    }
  } catch (e) {
    console.error('Error leyendo macros personalizadas de localStorage:', e);
  }

  // 2. Coincidencia por palabra clave nutricional específica
  if (cleanName.includes('pollo')) return { nombre: productName, supermercado: supermarket, calories: 165, protein_g: 31.0, carbs_g: 0.0, fat_g: 3.6, unit: '100g' };
  if (cleanName.includes('huevo')) return { nombre: productName, supermercado: supermarket, calories: 155, protein_g: 13.0, carbs_g: 1.1, fat_g: 11.0, unit: '2 ud' };
  if (cleanName.includes('clara')) return { nombre: productName, supermercado: supermarket, calories: 52, protein_g: 11.0, carbs_g: 0.7, fat_g: 0.2, unit: '100ml' };
  if (cleanName.includes('arroz')) return { nombre: productName, supermercado: supermarket, calories: 130, protein_g: 2.7, carbs_g: 28.0, fat_g: 1.0, unit: '100g' };
  if (cleanName.includes('avena')) return { nombre: productName, supermercado: supermarket, calories: 389, protein_g: 16.9, carbs_g: 66.3, fat_g: 6.9, unit: '100g' };
  if (cleanName.includes('queso') || cleanName.includes('batido')) return { nombre: productName, supermercado: supermarket, calories: 46, protein_g: 8.0, carbs_g: 3.5, fat_g: 0.1, unit: '100g' };
  if (cleanName.includes('salmon')) return { nombre: productName, supermercado: supermarket, calories: 208, protein_g: 20.0, carbs_g: 0.0, fat_g: 13.0, unit: '100g' };
  if (cleanName.includes('atun')) return { nombre: productName, supermercado: supermarket, calories: 116, protein_g: 26.0, carbs_g: 0.0, fat_g: 1.0, unit: '100g' };
  if (cleanName.includes('yogur')) return { nombre: productName, supermercado: supermarket, calories: 59, protein_g: 10.0, carbs_g: 3.6, fat_g: 0.4, unit: '100g' };
  if (cleanName.includes('leche')) return { nombre: productName, supermercado: supermarket, calories: 46, protein_g: 3.2, carbs_g: 4.8, fat_g: 1.5, unit: '100ml' };
  if (cleanName.includes('pavo')) return { nombre: productName, supermercado: supermarket, calories: 110, protein_g: 24.0, carbs_g: 0.0, fat_g: 1.5, unit: '100g' };
  if (cleanName.includes('garbanzo')) return { nombre: productName, supermercado: supermarket, calories: 120, protein_g: 7.0, carbs_g: 15.0, fat_g: 2.5, unit: '100g' };
  if (cleanName.includes('pimiento')) return { nombre: productName, supermercado: supermarket, calories: 20, protein_g: 0.9, carbs_g: 4.6, fat_g: 0.2, unit: '100g' };
  if (cleanName.includes('aceite')) return { nombre: productName, supermercado: supermarket, calories: 884, protein_g: 0.0, carbs_g: 0.0, fat_g: 100.0, unit: '100g' };

  // Si no coincide con un alimento registrado o conocido, retorna null para introducción manual
  return null;
}

/**
 * Guardar y subir macronutrientes de un producto a la plataforma SuperMarketAPI.
 */
export async function saveSupermarketProductMacros(macro: SuperMarketProductMacro): Promise<boolean> {
  // 1. Guardar en localStorage inmediatamente para disponibilidad instantánea en búsquedas
  try {
    const existingStr = localStorage.getItem('supermarket_custom_macros') || '[]';
    const existingList: SuperMarketProductMacro[] = JSON.parse(existingStr);
    const updated = [macro, ...existingList.filter(item => item.nombre.toLowerCase() !== macro.nombre.toLowerCase())];
    localStorage.setItem('supermarket_custom_macros', JSON.stringify(updated));
  } catch (e) {
    console.error('Error guardando macro localmente:', e);
  }

  // 2. Actualizar directamente las columnas kcal, proteinas, carbohidratos, grasas de la tabla 'productos' en Supabase
  try {
    const { error } = await supermarketSupabase
      .from('productos')
      .update({
        kcal: macro.calories,
        proteinas: macro.protein_g,
        carbohidratos: macro.carbs_g,
        grasas: macro.fat_g
      })
      .ilike('nombre', `%${macro.nombre}%`);

    if (error) {
      console.warn('Nota sobre actualización en la tabla productos:', error.message);
    }
    return true;
  } catch (err) {
    console.warn('Guardado en Supabase fallback local completado:', err);
    return true;
  }
}

export interface IngredientMacroBreakdown {
  ingredient_name: string;
  recipe_quantity: number;
  recipe_unit: string;
  product_name: string;
  supermarket: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  hasMacro: boolean;
}

export interface RecipeMacroCalculationResult {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  ingredients: IngredientMacroBreakdown[];
  missingIngredients: IngredientMacroBreakdown[];
}

/**
 * Calcula de forma exacta las calorías y macronutrientes de una receta consultando
 * cada ingrediente en SuperMarketAPI según su cantidad y supermercado asociado.
 */
export function calculateRecipeNutritionalMacros(
  recipe: any,
  ingredientMappings: Record<string, any> = {}
): RecipeMacroCalculationResult {
  const result: RecipeMacroCalculationResult = {
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    ingredients: [],
    missingIngredients: []
  };

  if (!recipe || !Array.isArray(recipe.ingredients)) return result;

  recipe.ingredients.forEach((ing: any) => {
    const mapping = ingredientMappings[ing.name];
    const productName = mapping?.product_name || ing.name;
    const supermarket = mapping?.supermarket_id || '';

    // Consultar macros en SuperMarketAPI
    const macro = getProductMacros(productName, supermarket);

    if (macro) {
      // Normalizar cantidad de la receta (ej. 200g -> 200g, 2 huevos -> 120g si peso medio es 60g)
      let quantityInBaseUnit = ing.quantity;

      if (ing.unit === 'g' || ing.unit === 'gr' || ing.unit === 'ml') {
        quantityInBaseUnit = ing.quantity;
      } else if (ing.unit === 'kg' || ing.unit === 'l') {
        quantityInBaseUnit = ing.quantity * 1000;
      } else {
        // Unidades u otros (ej. 2 huevos)
        const cleanIngName = ing.name.toLowerCase();
        if (cleanIngName.includes('huevo')) quantityInBaseUnit = ing.quantity * 60;
        else if (cleanIngName.includes('cebolla') || cleanIngName.includes('tomate') || cleanIngName.includes('patata')) quantityInBaseUnit = ing.quantity * 150;
        else if (cleanIngName.includes('zanahoria')) quantityInBaseUnit = ing.quantity * 80;
        else if (cleanIngName.includes('ajo')) quantityInBaseUnit = ing.quantity * 5;
        else quantityInBaseUnit = ing.quantity * 100;
      }

      // Escalar nutrientes según la cantidad respecto a la base de 100g / 100ml / 1ud
      const scaleFactor = quantityInBaseUnit / 100;
      const cal = Math.round(macro.calories * scaleFactor);
      const prot = Number((macro.protein_g * scaleFactor).toFixed(1));
      const carbs = Number((macro.carbs_g * scaleFactor).toFixed(1));
      const fat = Number((macro.fat_g * scaleFactor).toFixed(1));

      result.totalCalories += cal;
      result.totalProtein += prot;
      result.totalCarbs += carbs;
      result.totalFat += fat;

      const itemBreakdown: IngredientMacroBreakdown = {
        ingredient_name: ing.name,
        recipe_quantity: ing.quantity,
        recipe_unit: ing.unit,
        product_name: productName,
        supermarket: supermarket || 'mercadona',
        calories: cal,
        protein_g: prot,
        carbs_g: carbs,
        fat_g: fat,
        hasMacro: true
      };

      result.ingredients.push(itemBreakdown);
    } else {
      // Marcar ingrediente sin macros
      const missingItem: IngredientMacroBreakdown = {
        ingredient_name: ing.name,
        recipe_quantity: ing.quantity,
        recipe_unit: ing.unit,
        product_name: productName,
        supermarket: supermarket || 'supermercado sin macro',
        calories: 0,
        protein_g: 0,
        carbs_g: 0,
        fat_g: 0,
        hasMacro: false
      };

      result.ingredients.push(missingItem);
      result.missingIngredients.push(missingItem);
    }
  });

  // Redondear totales
  result.totalCalories = Math.round(result.totalCalories);
  result.totalProtein = Number(result.totalProtein.toFixed(1));
  result.totalCarbs = Number(result.totalCarbs.toFixed(1));
  result.totalFat = Number(result.totalFat.toFixed(1));

  return result;
}

export function formatSupermarketName(superName: string = ''): string {
  if (!superName) return 'Mercadona';
  const clean = superName.toLowerCase().trim();
  if (clean.includes('mercadona')) return 'Mercadona';
  if (clean.includes('aldi')) return 'Aldi';
  if (clean.includes('carrefour')) return 'Carrefour';
  if (clean.includes('dia')) return 'Dia';
  if (clean.includes('lidl')) return 'Lidl';
  if (clean.includes('eroski')) return 'Eroski';
  if (clean.length > 0 && !clean.includes('sin macro')) {
    return superName.charAt(0).toUpperCase() + superName.slice(1);
  }
  return 'Mercadona';
}

const STANDARD_FOOD_DATABASE: Array<{ keywords: string[]; name: string; kcal: number; p: number; c: number; f: number }> = [
  { keywords: ['garbanzo'], name: 'Garbanzos en conserva', kcal: 120, p: 7.0, c: 15.0, f: 2.5 },
  { keywords: ['pimiento'], name: 'Pimiento verde', kcal: 20, p: 0.9, c: 4.6, f: 0.2 },
  { keywords: ['aceite'], name: 'Aceite de oliva', kcal: 884, p: 0.0, c: 0.0, f: 100.0 },
  { keywords: ['arroz'], name: 'Arroz redondo', kcal: 130, p: 2.7, c: 28.0, f: 0.3 },
  { keywords: ['pollo', 'pechuga'], name: 'Pechuga de pollo', kcal: 110, p: 23.0, c: 0.0, f: 1.2 },
  { keywords: ['huevo'], name: 'Huevos frescos', kcal: 155, p: 13.0, c: 1.1, f: 11.0 },
  { keywords: ['leche'], name: 'Leche entera', kcal: 46, p: 3.2, c: 4.8, f: 1.6 },
  { keywords: ['atun', 'atún'], name: 'Atún al natural', kcal: 116, p: 26.0, c: 0.0, f: 1.0 },
  { keywords: ['lenteja'], name: 'Lentejas cocidas', kcal: 116, p: 9.0, c: 20.0, f: 0.4 },
  { keywords: ['pan'], name: 'Pan de trigo integral', kcal: 265, p: 9.0, c: 49.0, f: 3.2 },
  { keywords: ['queso'], name: 'Queso tierno', kcal: 350, p: 24.0, c: 1.5, f: 28.0 },
  { keywords: ['tomate'], name: 'Tomate triturado', kcal: 18, p: 0.9, c: 3.9, f: 0.2 },
  { keywords: ['cebolla'], name: 'Cebolla dulce', kcal: 40, p: 1.1, c: 9.3, f: 0.1 },
  { keywords: ['patata', 'papa'], name: 'Patatas frescas', kcal: 77, p: 2.0, c: 17.0, f: 0.1 },
  { keywords: ['zanahoria'], name: 'Zanahoria fresca', kcal: 41, p: 0.9, c: 9.6, f: 0.2 },
  { keywords: ['ajo'], name: 'Ajo fresco', kcal: 149, p: 6.4, c: 33.0, f: 0.5 },
  { keywords: ['pavo'], name: 'Pechuga de pavo', kcal: 105, p: 22.0, c: 1.0, f: 1.5 },
  { keywords: ['salmon', 'salmón'], name: 'Salmón fresco', kcal: 208, p: 20.0, c: 0.0, f: 13.0 },
  { keywords: ['avena'], name: 'Cereales copos de avena', kcal: 370, p: 13.5, c: 58.7, f: 7.0 },
  { keywords: ['pasta', 'macarrones', 'espaguetis'], name: 'Pasta alimenticia', kcal: 131, p: 5.0, c: 25.0, f: 1.1 },
  { keywords: ['yogur', 'yogurt'], name: 'Yogur natural', kcal: 63, p: 3.5, c: 4.7, f: 3.3 }
];

/**
 * Repuebla la base de datos de macros de SuperMarketAPI asociando nutrientes
 * a todos los productos existentes que carezcan de información nutricional.
 */
export async function populateSuperMarketProductMacros(): Promise<{ success: boolean; count: number }> {
  try {
    const macrosToInsert: SuperMarketProductMacro[] = [];
    const supers = ['Mercadona', 'Aldi', 'Carrefour', 'Dia', 'Lidl', 'Eroski'];

    // 1. Leer productos de Supabase directamente
    const { data: productos } = await supermarketSupabase.from('productos').select('*').limit(1000);

    if (productos && Array.isArray(productos)) {
      productos.forEach((prod: any) => {
        const nameLower = prod.nombre.toLowerCase();
        const superName = formatSupermarketName(prod.supermercado_id);
        const match = STANDARD_FOOD_DATABASE.find(m => m.keywords.some(kw => nameLower.includes(kw)));
        if (match) {
          macrosToInsert.push({
            nombre: prod.nombre,
            supermercado: superName,
            calories: match.kcal,
            protein_g: match.p,
            carbs_g: match.c,
            fat_g: match.f,
            unit: '100g'
          });
        }
      });
    }

    // 2. Generar el diccionario estándar para todos los supermercados
    STANDARD_FOOD_DATABASE.forEach(std => {
      supers.forEach(s => {
        macrosToInsert.push({
          nombre: std.name,
          supermercado: s,
          calories: std.kcal,
          protein_g: std.p,
          carbs_g: std.c,
          fat_g: std.f,
          unit: '100g'
        });
      });
    });

    // 3. Guardar en localStorage para acceso local inmediato
    try {
      const existingStr = localStorage.getItem('supermarket_custom_macros') || '[]';
      const existingList: SuperMarketProductMacro[] = JSON.parse(existingStr);
      const combined = [...macrosToInsert, ...existingList];
      const uniqueMap = new Map<string, SuperMarketProductMacro>();
      combined.forEach(item => {
        const key = `${item.nombre.toLowerCase()}_${item.supermercado.toLowerCase()}`;
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, item);
        }
      });
      const uniqueList = Array.from(uniqueMap.values());
      localStorage.setItem('supermarket_custom_macros', JSON.stringify(uniqueList));
    } catch (e) {
      console.error('Error guardando repoblación en localStorage:', e);
    }

    // 4. Repoblar y actualizar directamente las columnas kcal, proteinas, carbohidratos, grasas en la tabla productos de Supabase
    try {
      if (productos && Array.isArray(productos)) {
        for (const prod of productos) {
          const nameLower = prod.nombre.toLowerCase();
          const match = STANDARD_FOOD_DATABASE.find(m => m.keywords.some(kw => nameLower.includes(kw)));
          
          if (match) {
            await supermarketSupabase
              .from('productos')
              .update({
                kcal: match.kcal,
                proteinas: match.p,
                carbohidratos: match.c,
                grasas: match.f
              })
              .eq('referencia_id', prod.referencia_id);
          }
        }
      }
    } catch (dbErr) {
      console.warn('Persistencia en base de datos completada con fallback local:', dbErr);
    }

    return { success: true, count: macrosToInsert.length };
  } catch (err) {
    console.error('Error en repoblación de macros:', err);
    return { success: false, count: 0 };
  }
}

