-- =============================================================================
-- ESQUEMA EXTENDIDO FIT (100% COMPATIBLE Y NO INTRUSIVO CON CALLA Y COME BASE)
-- =============================================================================
-- Este script extienda la base de datos de Calla y Come sin modificar
-- la estructura existente. Si un usuario solo usa la app tradicional,
-- la app original funciona 100% igual sin afectarle.
-- =============================================================================

-- 1. Perfil de Salud y Metas Fit (Asociado opcionalmente al id de usuario existente)
CREATE TABLE IF NOT EXISTS fit_user_profiles (
    user_id UUID PRIMARY KEY, -- Referencia a la tabla users(id) de Calla y Come
    age INT NOT NULL DEFAULT 25,
    gender VARCHAR(10) NOT NULL DEFAULT 'unspecified', -- 'male', 'female', 'other'
    height_cm NUMERIC(5, 2) NOT NULL DEFAULT 170.0,
    current_weight_kg NUMERIC(5, 2) NOT NULL DEFAULT 70.0,
    target_weight_kg NUMERIC(5, 2) NOT NULL DEFAULT 65.0,
    activity_level VARCHAR(20) NOT NULL DEFAULT 'moderate', -- 'sedentary', 'light', 'moderate', 'active', 'very_active'
    fitness_goal VARCHAR(20) NOT NULL DEFAULT 'maintenance', -- 'fat_loss', 'maintenance', 'muscle_gain'
    bmr INT NOT NULL DEFAULT 1650,
    tdee INT NOT NULL DEFAULT 2200,
    daily_calorie_target INT NOT NULL DEFAULT 2000,
    macro_preset VARCHAR(30) NOT NULL DEFAULT 'balanced', -- 'balanced', 'high_protein', 'low_carb', 'keto', 'custom'
    custom_protein_pct INT DEFAULT 30,
    custom_carb_pct INT DEFAULT 40,
    custom_fat_pct INT DEFAULT 30,
    daily_water_target_ml INT DEFAULT 2500,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Registro Diario de Alimentación (Diario Nutricional)
CREATE TABLE IF NOT EXISTS fit_daily_food_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    meal_type VARCHAR(20) NOT NULL, -- 'breakfast', 'lunch', 'dinner', 'snack'
    food_name VARCHAR(255) NOT NULL,
    callaycome_recipe_id UUID NULL, -- Opcional: Si el plato proviene de una receta existente de Calla y Come
    servings NUMERIC(4, 2) NOT NULL DEFAULT 1.0,
    calories INT NOT NULL,
    protein_g NUMERIC(6, 2) NOT NULL DEFAULT 0.0,
    carbs_g NUMERIC(6, 2) NOT NULL DEFAULT 0.0,
    fat_g NUMERIC(6, 2) NOT NULL DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Registro de Entrenamientos y Actividades (Strava / Wearables / Manual)
CREATE TABLE IF NOT EXISTS fit_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    activity_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    source VARCHAR(30) NOT NULL DEFAULT 'manual', -- 'strava', 'fitbit', 'google_fit', 'manual'
    external_activity_id VARCHAR(100) NULL, -- ID único retornado por Strava/Fitbit API para evitar duplicados
    activity_type VARCHAR(50) NOT NULL, -- 'running', 'cycling', 'swimming', 'weightlifting', 'hiit', 'walking', 'yoga'
    title VARCHAR(255) NOT NULL,
    duration_minutes INT NOT NULL,
    distance_km NUMERIC(6, 2) DEFAULT 0.0,
    calories_burned INT NOT NULL DEFAULT 0,
    avg_heart_rate INT DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Conexiones OAuth2 con Dispositivos y Servicios Externos (Strava / Pulseras)
CREATE TABLE IF NOT EXISTS fit_wearable_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    provider VARCHAR(30) NOT NULL, -- 'strava', 'fitbit', 'google_fit', 'garmin'
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    athlete_external_id VARCHAR(100) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_provider UNIQUE(user_id, provider)
);

-- 5. Histórico de Métricas Corporales (Evolución de Peso)
CREATE TABLE IF NOT EXISTS fit_body_metrics_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    recorded_at DATE NOT NULL DEFAULT CURRENT_DATE,
    weight_kg NUMERIC(5, 2) NOT NULL,
    body_fat_pct NUMERIC(4, 1) DEFAULT NULL,
    notes TEXT DEFAULT NULL
);

-- Índices optimizados para lecturas rápidas en la app Fit
CREATE INDEX IF NOT EXISTS idx_fit_food_logs_user_date ON fit_daily_food_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_fit_activities_user_date ON fit_activities(user_id, activity_date);
CREATE INDEX IF NOT EXISTS idx_fit_body_metrics_user_date ON fit_body_metrics_history(user_id, recorded_at);
