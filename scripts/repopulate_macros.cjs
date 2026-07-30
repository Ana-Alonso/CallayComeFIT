const { createClient } = require('@supabase/supabase-js');

const SUPERMARKET_SUPABASE_URL = "https://njgzdcrapgrgyshhuows.supabase.co";
const SUPERMARKET_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qZ3pkY3JhcGdyZ3lzaGh1b3dzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2Mzg2NzgsImV4cCI6MjEwMDIxNDY3OH0.gs_7C6_v7Id4I4Sk6PX5YpcA-ore1_u8zPPwlACC29k";

const supabase = createClient(SUPERMARKET_SUPABASE_URL, SUPERMARKET_SUPABASE_ANON_KEY);

const STANDARD_FOOD_MACROS = [
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

function getSupermarketFormatted(superRaw) {
  if (!superRaw) return 'Mercadona';
  const clean = superRaw.toLowerCase().trim();
  if (clean.includes('mercadona')) return 'Mercadona';
  if (clean.includes('aldi')) return 'Aldi';
  if (clean.includes('carrefour')) return 'Carrefour';
  if (clean.includes('dia')) return 'Dia';
  if (clean.includes('lidl')) return 'Lidl';
  if (clean.includes('eroski')) return 'Eroski';
  return 'Mercadona';
}

async function repopulate() {
  console.log("Iniciando repoblación de macros en SuperMarketAPI...");
  const { data: productos, error } = await supabase.from('productos').select('*').limit(500);
  if (error) {
    console.error("Error leyendo productos:", error);
    return;
  }

  console.log(`Leídos ${productos ? productos.length : 0} productos de la tabla productos.`);

  const macrosToInsert = [];

  if (productos && productos.length > 0) {
    for (const prod of productos) {
      const prodNameLower = prod.nombre.toLowerCase();
      const superFormatted = getSupermarketFormatted(prod.supermercado_id);

      const match = STANDARD_FOOD_MACROS.find(m => m.keywords.some(kw => prodNameLower.includes(kw)));
      if (match) {
        macrosToInsert.push({
          nombre: prod.nombre,
          supermercado: superFormatted,
          calories: match.kcal,
          protein_g: match.p,
          carbs_g: match.c,
          fat_g: match.f,
          unit: '100g',
          updated_at: new Date().toISOString()
        });
      }
    }
  }

  // Insertar también las palabras clave básicas para todos los supers
  for (const std of STANDARD_FOOD_MACROS) {
    ['Mercadona', 'Aldi', 'Carrefour', 'Dia', 'Lidl', 'Eroski'].forEach(s => {
      macrosToInsert.push({
        nombre: std.name,
        supermercado: s,
        calories: std.kcal,
        protein_g: std.p,
        carbs_g: std.c,
        fat_g: std.f,
        unit: '100g',
        updated_at: new Date().toISOString()
      });
    });
  }

  console.log(`Generados ${macrosToInsert.length} registros de macros para subir a productos_macros.`);

  // Intentar upsert a Supabase productos_macros
  const { error: upsertErr } = await supabase.from('productos_macros').upsert(macrosToInsert, { onConflict: 'nombre,supermercado' });
  if (upsertErr) {
    console.warn("Nota sobre upsert en productos_macros:", upsertErr.message);
  } else {
    console.log("✅ ¡Macros repoblados con éxito en la tabla productos_macros de Supabase!");
  }
}

repopulate();
