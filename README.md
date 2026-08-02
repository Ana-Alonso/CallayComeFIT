<div align="center">

<img src="public/logo.jpg" alt="Calla y Come FIT" width="120" style="border-radius: 50%;" />

# Calla y Come FIT ⚡

![CI](https://github.com/Ana-Alonso/CallayCome/actions/workflows/ci.yml/badge.svg)
### Nutrición, Contador de Calorías, Macronutrientes y Sincronización Abierta de Salud

Aplicación web + móvil basada en **Calla y Come** diseñada para el mundo fitness. Combina la planificación de menús y despensa con conteo inteligente de calorías, distribución de macronutrientes, calculadora de TDEE/BMR, importador automático del planificador y sincronización 100% gratuita con **relojes inteligentes, pulseras de actividad, Google Health Connect y lector de archivos GPX/FIT**.

[![CI/CD](https://github.com/Ana-Alonso/la-cocina-de-la-abuela/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/Ana-Alonso/la-cocina-de-la-abuela/actions/workflows/ci-cd.yml)
[![Live](https://img.shields.io/badge/🌐%20Live-callaycome.onrender.com-10B981)](https://callaycome.onrender.com)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?logo=supabase)
![Google Health](https://img.shields.io/badge/Health%20Connect-Android-4285F4?logo=android)

</div>

---

## ✨ Novedades y Módulos de Calla y Come FIT

| Módulo Fit ⚡ | Descripción |
|--------------|-------------|
| 📊 **Dashboard y Balance Calórico del Día** | Cálculo en tiempo real: $\text{Calorías Restantes} = \text{Meta Base} - \text{Consumidas} + \text{Gasto por Ejercicio de Hoy}$. Anillos e indicadores de Proteínas (🥩), Carbohidratos (🍚) y Grasas (🥑). |
| 📈 **Evolución Corporal & Progresión Mensual** | Registro de pesaje por fecha diaria (`log_date`) y agrupación mensual de biométricos: Peso, % Grasa, Grasa Visceral, IMC, Masa Magra, Músculo, Mineral Óseo, Agua y Cintura. |
| 🌙 **Reset Diario (00:00h) & Registro de Hidratación/Sueño** | Persistencia por fecha (`YYYY-MM-DD`) del consumo de agua (+250ml / +500ml) y descanso (sueño + siesta) con reseteo automático a las 00:00h para el nuevo día. |
| 🧮 **Calculadora TDEE / BMR** | Estimación metabólica precisa usando la fórmula **Mifflin-St Jeor** ajustada al nivel de actividad y objetivo (Déficit -20% para pérdida de grasa, Mantenimiento o Superávit +15%). |
| 🎛️ **Plantillas & Sliders de Macros** | Plantillas recomendadas (*Alta en Proteínas 40/35/25*, *Equilibrada 30/40/30*, *Baja en Carb 45/20/35*) + **Sliders libres de porcentaje** para ajuste manual fino. |
| ⌚ **Relojes Inteligentes & Health Connect** | Conexión directa y gratuita con cualquier pulsera de actividad o smartwatch a través de Google Health Connect sin APIs de pago ni restricciones. |
| 📁 **Importador de Archivos .GPX / .FIT** | Carga directa de archivos de ruta o entrenamiento exportados desde tu pulsera o reloj sin cuotas de suscripción. |
| 📅 **Planificador de Menús & Persistencia de Fecha** | Planificación mensual con persistencia reactiva de la fecha de inicio (`start_date`) e importación en 1-clic del menú asignado para hoy al Diario Fit. |
| 🔍 **Buscador de Alimentos con Autocompletado** | Buscador inteligente que sugiere alimentos de la base de datos nutricional (BEDCA / USDA) y escala automáticamente las calorías y macros al modificar raciones. |
| 🍲 **Adaptador de Recetas Fit** | Conversión inteligente de recetas tradicionales de Calla y Come a versiones hiperproteicas y bajas en grasa. |
| 📱 **Sincronización Android Nativa** | Sincronización fluida mediante Capacitor (`npx cap sync android`) con optimización de recursos Gradle para Android. |

---

## 🔒 Arquitectura de Base de Datos Compartida e Independiente (Híbrida)

El proyecto utiliza un **modelo de base de datos no intrusivo** sobre Supabase PostgreSQL.

- **Usuarios Tradicionales de Calla y Come**: Utilizan la app normalmente sin que las tablas Fit interfieran ni generen errores en su flujo.
- **Usuarios Calla y Come FIT**: La base de datos extiende sus funcionalidades mediante tablas dedicadas con Row Level Security (RLS):
  - `fit_user_profiles`: Datos metabólicos, peso objetivo, BMR, TDEE y ratios de macronutrientes.
  - `fit_daily_food_logs`: Registro diario de comidas consumidas y desglose de macros.
  - `fit_activities`: Registro de entrenamientos sincronizados desde Google Health Connect, GPX o ingresados manualmente.

---

## 🛠️ Stack Tecnológico

- **Frontend**: React 19 · TypeScript 6 · Vite 5
- **Estilos**: Modern CSS · Modo Oscuro Atlético (`#0F172A`) · Glassmorphism · MUI
- **Backend & DB**: Supabase (PostgreSQL + RLS Policies + Realtime)
- **Integraciones de Salud**: Google Health Connect (Relojes / Pulseras de Actividad) · Parser de archivos .GPX / .FIT
- **Móvil Nativo**: Capacitor (Android / iOS)
- **Tests & Lint**: Vitest · Testing Library · Oxlint

---

## 🚀 Desarrollo Local

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/Ana-Alonso/CallayComeFit.git
cd CallayComeFit
npm install
```

### 2. Variables de Entorno (`.env`)

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=tu-supabase-url
VITE_SUPABASE_ANON_KEY=tu-supabase-anon-key
```

### 3. Iniciar Servidor de Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

---

## 🧪 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo Vite |
| `npm run build` | Compila el paquete de producción en `/dist` |
| `npm run preview` | Previsualiza el build de producción localmente |
| `npm run lint` | Ejecuta el linter con Oxlint |
| `npm test` | Ejecuta la suite de pruebas unitarias con Vitest |
| `npx cap sync` | Sincroniza los activos web con el proyecto Android (Capacitor) |

---

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── fit/           # Módulo Calla y Come FIT (Dashboard, Diario, Macros, Health Sync)
│   ├── auth/          # Autenticación de usuarios
│   ├── planner/       # Planificador de menús mensuales
│   ├── recipes/       # Catálogo de recetas tradicionales y Fit
│   ├── pantry/        # Gestión de stock de la despensa con macros
│   ├── nevera/        # Modo nevera / Botón de pánico
│   ├── shopping/      # Generación inteligente de lista de la compra
│   ├── budget/        # Seguimiento de presupuesto y comparador de supermercados
│   └── family/        # Sincronización colaborativa familiar
├── hooks/             # Custom hooks (useGlobalState, useRecipes, etc.)
├── services/          # Clientes de Supabase & Supermarket API
├── types/             # Interfaces de TypeScript (FitUserProfile, FitFoodLogItem, etc.)
└── utils/             # Motor de nutrición (nutrition.ts) y helpers del planificador
supabase/
└── migrations/        # Scripts SQL de migraciones (incluye 20260729130000_fit_tables.sql)
```

---

## 🌐 Demo & Despliegue

- 🔗 **Web App**: [https://callaycome.onrender.com](https://callaycome.onrender.com)
- ⚡ **Acceso Fit**: Navega a la pestaña **`Fit ⚡`** dentro de la aplicación.

---

<div align="center">
  Creado con ⚡, ❤️ y mucha sazón fit · Ana Alonso
</div>
