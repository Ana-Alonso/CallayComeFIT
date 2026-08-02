-- Migration: Secure remaining tables in CallayComeFit / Calla y Come
-- Run this in the Supabase SQL Editor for the Kitchen project

-- ─── INGREDIENT_MAPPINGS ───────────────────────────────────────────────────
ALTER TABLE IF EXISTS public.ingredient_mappings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_ingredient_mappings ON public.ingredient_mappings;
DROP POLICY IF EXISTS user_ingredient_mappings_family ON public.ingredient_mappings;

-- Acceso individual: el usuario puede ver/gestionar sus propios mapeos
CREATE POLICY user_ingredient_mappings ON public.ingredient_mappings
    FOR ALL
    USING (
        auth.uid() = user_id
        OR (
            user_id IS NULL
            AND EXISTS (
                SELECT 1 FROM public.family_members
                WHERE family_members.family_id = public.ingredient_mappings.family_id
                  AND family_members.user_id = auth.uid()
            )
        )
    )
    WITH CHECK (
        auth.uid() = user_id
        OR (
            user_id IS NULL
            AND EXISTS (
                SELECT 1 FROM public.family_members
                WHERE family_members.family_id = public.ingredient_mappings.family_id
                  AND family_members.user_id = auth.uid()
            )
        )
    );

-- ─── RECIPES — Restringir escritura ────────────────────────────────────────
DROP POLICY IF EXISTS authenticated_recipes_write ON public.recipes;

-- Usuarios autenticados pueden insertar recetas
CREATE POLICY user_can_insert_own_recipes ON public.recipes
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

-- Solo usuarios autenticados pueden actualizar o borrar recetas
CREATE POLICY user_can_modify_own_recipes ON public.recipes
    FOR UPDATE
    TO authenticated
    USING (auth.uid() IS NOT NULL);

CREATE POLICY user_can_delete_own_recipes ON public.recipes
    FOR DELETE
    TO authenticated
    USING (auth.uid() IS NOT NULL);

-- ─── FIT_BODY_WEIGHT_LOGS (si existe) ──────────────────────────────────────
ALTER TABLE IF EXISTS public.fit_body_weight_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own weight logs" ON public.fit_body_weight_logs;
CREATE POLICY "Users can manage their own weight logs" ON public.fit_body_weight_logs
    FOR ALL USING (auth.uid() = user_id);
