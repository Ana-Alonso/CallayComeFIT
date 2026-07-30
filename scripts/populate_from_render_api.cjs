const { execSync } = require('child_process');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://njgzdcrapgrgyshhuows.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qZ3pkY3JhcGdyZ3lzaGh1b3dzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2Mzg2NzgsImV4cCI6MjEwMDIxNDY3OH0.gs_7C6_v7Id4I4Sk6PX5YpcA-ore1_u8zPPwlACC29k";
const RENDER_API_BASE_URL = "https://supermarketapi-z9yb.onrender.com/api/v1";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const PRODUCT_KEYWORDS = [
  "leche", "huevo", "pollo", "arroz", "garbanzo", 
  "atun", "queso", "aceite", "pimiento", "avena", 
  "pan", "lenteja", "pavo", "salmon", "yogur"
];

const STANDARD_FOOD_DATABASE = [
  { keywords: ['garbanzo'], kcal: 120, p: 7.0, c: 15.0, f: 2.5 },
  { keywords: ['pimiento'], kcal: 20, p: 0.9, c: 4.6, f: 0.2 },
  { keywords: ['aceite'], kcal: 884, p: 0.0, c: 0.0, f: 100.0 },
  { keywords: ['arroz'], kcal: 130, p: 2.7, c: 28.0, f: 0.3 },
  { keywords: ['pollo', 'pechuga'], kcal: 165, p: 31.0, c: 0.0, f: 3.6 },
  { keywords: ['huevo'], kcal: 155, p: 13.0, c: 1.1, f: 11.0 },
  { keywords: ['clara'], kcal: 52, p: 11.0, c: 0.7, f: 0.2 },
  { keywords: ['leche'], kcal: 46, p: 3.2, c: 4.8, f: 1.6 },
  { keywords: ['atun', 'atún'], kcal: 116, p: 26.0, c: 0.0, f: 1.0 },
  { keywords: ['lenteja'], kcal: 116, p: 9.0, c: 20.0, f: 0.4 },
  { keywords: ['pan'], kcal: 265, p: 9.0, c: 49.0, f: 3.2 },
  { keywords: ['queso'], kcal: 350, p: 24.0, c: 1.5, f: 28.0 },
  { keywords: ['tomate'], kcal: 18, p: 0.9, c: 3.9, f: 0.2 },
  { keywords: ['cebolla'], kcal: 40, p: 1.1, c: 9.3, f: 0.1 },
  { keywords: ['patata', 'papa'], kcal: 77, p: 2.0, c: 17.0, f: 0.1 },
  { keywords: ['zanahoria'], kcal: 41, p: 0.9, c: 9.6, f: 0.2 },
  { keywords: ['ajo'], kcal: 149, p: 6.4, c: 33.0, f: 0.5 },
  { keywords: ['pavo'], kcal: 105, p: 22.0, c: 1.0, f: 1.5 },
  { keywords: ['salmon', 'salmón'], kcal: 208, p: 20.0, c: 0.0, f: 13.0 },
  { keywords: ['avena'], kcal: 370, p: 13.5, c: 58.7, f: 7.0 },
  { keywords: ['pasta', 'macarrones', 'espaguetis'], kcal: 131, p: 5.0, c: 25.0, f: 1.1 },
  { keywords: ['yogur', 'yogurt'], kcal: 63, p: 3.5, c: 4.7, f: 3.3 }
];

function calculateMacrosForProduct(productName) {
  const cleanName = productName.toLowerCase();
  const match = STANDARD_FOOD_DATABASE.find(m => m.keywords.some(kw => cleanName.includes(kw)));
  if (match) {
    return { kcal: match.kcal, proteinas: match.p, carbohidratos: match.c, grasas: match.f };
  }
  return { kcal: null, proteinas: null, carbohidratos: null, grasas: null };
}

async function populateAll() {
  const userToken = process.argv[2];
  if (!userToken) {
    console.error("❌ Por favor pasa el TOKEN de usuario.");
    process.exit(1);
  }

  console.log("🚀 Iniciando raspado de Render API y guardado directo en Supabase...");
  let totalInserted = 0;

  for (const kw of PRODUCT_KEYWORDS) {
    console.log(`\n🔍 Raspando productos para "${kw}"...`);
    try {
      const curlCmd = `curl -s -X GET "${RENDER_API_BASE_URL}/supermercados/search?q=${encodeURIComponent(kw)}" -H "Authorization: Bearer ${userToken}" -H "Accept: application/json"`;
      const stdout = execSync(curlCmd, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
      const json = JSON.parse(stdout);

      const rawProducts = json.data || json.productos || (Array.isArray(json) ? json : []);
      console.log(`📦 Recibidos ${rawProducts.length} productos de la API de raspado.`);

      if (rawProducts.length === 0) continue;

      const rowsToUpsert = rawProducts.map(p => {
        const supermarketId = (p.supermercado || p.supermercado_id || 'mercadona').toLowerCase();
        const macros = calculateMacrosForProduct(p.nombre);

        return {
          referencia_id: String(p.referencia_id || p.id),
          nombre: p.nombre,
          precio: Number(p.precio) || 0,
          supermercado_id: supermarketId,
          last_seen: p.last_seen || new Date().toISOString(),
          kcal: macros.kcal,
          proteinas: macros.proteinas,
          carbohidratos: macros.carbohidratos,
          grasas: macros.grasas
        };
      });

      const { data, error } = await supabase
        .from('productos')
        .upsert(rowsToUpsert, { onConflict: 'referencia_id' });

      if (error) {
        console.error(`❌ Error al subir a Supabase para "${kw}":`, error.message);
      } else {
        totalInserted += rowsToUpsert.length;
        console.log(`✅ ${rowsToUpsert.length} productos de "${kw}" insertados correctamente en Supabase.`);
      }

    } catch (err) {
      console.error(`❌ Error procesando "${kw}":`, err.message);
    }
  }

  const { count } = await supabase.from('productos').select('*', { count: 'exact', head: true });
  console.log(`\n🎉 ¡PROCESO COMPLETADO! Hay actualmente ${count} productos en la tabla 'productos' de Supabase.`);
}

populateAll();
