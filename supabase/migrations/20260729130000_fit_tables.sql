-- Migration: Fit tables extension for Calla y Come Fit
-- Compatible and non-intrusive database additions

CREATE TABLE IF NOT EXISTS fit_user_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    age INT NOT NULL DEFAULT 25,
    gender VARCHAR(10) NOT NULL DEFAULT 'unspecified',
    height_cm NUMERIC(5, 2) NOT NULL DEFAULT 170.0,
    current_weight_kg NUMERIC(5, 2) NOT NULL DEFAULT 70.0,
    target_weight_kg NUMERIC(5, 2) NOT NULL DEFAULT 65.0,
    activity_level VARCHAR(20) NOT NULL DEFAULT 'moderate',
    fitness_goal VARCHAR(20) NOT NULL DEFAULT 'maintenance',
    bmr INT NOT NULL DEFAULT 1650,
    tdee INT NOT NULL DEFAULT 2200,
    daily_calorie_target INT NOT NULL DEFAULT 2000,
    macro_preset VARCHAR(30) NOT NULL DEFAULT 'balanced',
    custom_protein_pct INT DEFAULT 30,
    custom_carb_pct INT DEFAULT 40,
    custom_fat_pct INT DEFAULT 30,
    daily_water_target_ml INT DEFAULT 2500,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fit_daily_food_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    meal_type VARCHAR(20) NOT NULL,
    food_name VARCHAR(255) NOT NULL,
    callaycome_recipe_id UUID NULL,
    servings NUMERIC(4, 2) NOT NULL DEFAULT 1.0,
    calories INT NOT NULL,
    protein_g NUMERIC(6, 2) NOT NULL DEFAULT 0.0,
    carbs_g NUMERIC(6, 2) NOT NULL DEFAULT 0.0,
    fat_g NUMERIC(6, 2) NOT NULL DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fit_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    source VARCHAR(30) NOT NULL DEFAULT 'manual',
    external_activity_id VARCHAR(100) NULL,
    activity_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    duration_minutes INT NOT NULL,
    distance_km NUMERIC(6, 2) DEFAULT 0.0,
    calories_burned INT NOT NULL DEFAULT 0,
    avg_heart_rate INT DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fit_wearable_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    provider VARCHAR(30) NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    athlete_external_id VARCHAR(100) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_provider UNIQUE(user_id, provider)
);

-- Enable RLS for security
ALTER TABLE fit_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fit_daily_food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fit_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE fit_wearable_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own fit profile" ON fit_user_profiles
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own food logs" ON fit_daily_food_logs
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own activities" ON fit_activities
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own wearable connections" ON fit_wearable_connections
    FOR ALL USING (auth.uid() = user_id);
