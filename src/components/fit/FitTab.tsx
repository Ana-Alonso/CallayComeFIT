import React, { useState } from "react";
import type { User } from "@supabase/supabase-js";
import type {
  Recipe,
  Profile,
  MealPlanDay,
  FitFoodLogItem,
  FitActivity,
} from "../../types";
import { useFitDatabase } from "../../hooks/useFitDatabase";
import { get_current_planner_day } from "../../utils/planner_helpers";
import { getRecipeSuperMarketMacros } from "../../services/supermarket_api";
import { Box } from "../common";

import { FitHeader } from "./FitHeader";
import { FitNavTabs, type FitSubTab } from "./FitNavTabs";
import { FitDashboardSubTab } from "./FitDashboardSubTab";
import { FitDiarySubTab } from "./FitDiarySubTab";
import { FitGoalsSubTab } from "./FitGoalsSubTab";
import { FitActivitiesSubTab } from "./FitActivitiesSubTab";
import { FitRecipesSubTab } from "./FitRecipesSubTab";
import { FitProgressSubTab } from "./FitProgressSubTab";

import { FitAddFoodModal } from "./FitAddFoodModal";
import { FitRegisterMacroModal } from "./FitRegisterMacroModal";
import { FitAddWeightModal } from "./FitAddWeightModal";
import { FitEditActivityModal } from "./FitEditActivityModal";
import { FitDateModal } from "./FitDateModal";
import { FitRecipeIngredientsMacroModal } from "./FitRecipeIngredientsMacroModal";

interface FitTabProps {
  user?: User | null;
  profile?: Profile | null;
  recipes: Recipe[];
  meal_plan?: MealPlanDay[];
  start_date?: string | null;
  on_change_start_date?: (newDate: string) => void;
  on_assign_recipe?: (
    dayNum: number,
    mealType: "desayuno" | "comida" | "cena",
    index: number,
    recipeId: number,
  ) => void;
  on_remove_assigned_recipe?: (
    dayNum: number,
    mealType: "desayuno" | "comida" | "cena",
    index: number,
  ) => void;
}

export const FitTab: React.FC<FitTabProps> = ({
  user,
  profile,
  recipes,
  meal_plan,
  start_date,
  on_change_start_date,
  on_assign_recipe,
  on_remove_assigned_recipe,
}) => {
  const {
    userProfile,
    setUserProfile,
    foodLogs,
    addFoodLog,
    removeFoodLog,
    activities,
    addActivity,
    removeActivity,
    updateActivity,
    weightLogs,
    addWeightLog,
    removeWeightLog,
  } = useFitDatabase(user || null);

  const [subTab, setSubTab] = useState<FitSubTab>("dashboard");

  const [isAddFoodOpen, setIsAddFoodOpen] = useState(false);
  const [modalMealType, setModalMealType] = useState<
    "breakfast" | "lunch" | "dinner" | "snack"
  >("breakfast");

  const [isRegisterMacroOpen, setIsRegisterMacroOpen] = useState(false);
  const [registerMacroName, setRegisterMacroName] = useState("");
  const [isRecipeIngredientsMacroOpen, setIsRecipeIngredientsMacroOpen] = useState(false);

  const [isAddWeightOpen, setIsAddWeightOpen] = useState(false);
  const [isEditActivityOpen, setIsEditActivityOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<FitActivity | null>(
    null,
  );
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);

  const currentDayNum = get_current_planner_day(start_date || null) || 1;
  const currentDayPlan = meal_plan?.find((d) => d.day === currentDayNum);

  const handleImportMealPlan = () => {
    if (!currentDayPlan) {
      alert(
        `No hay plan asignado para el Día ${currentDayNum} en tu planificador.`,
      );
      return;
    }

    const importSlot = (
      recipeIds: Array<number | null>,
      mealType: "breakfast" | "lunch" | "dinner",
    ) => {
      recipeIds.forEach((id) => {
        if (!id) return;
        const recipe = recipes.find((r) => r.id === id);
        if (!recipe) return;

        const apiMacros = getRecipeSuperMarketMacros(recipe);

        const newItem: FitFoodLogItem = {
          id: Date.now().toString() + Math.random().toString().slice(2, 6),
          meal_type: mealType,
          food_name: `${recipe.name} (Plan Calla y Come)`,
          callaycome_recipe_id: recipe.id,
          servings: recipe.servings ?? recipe.portions ?? apiMacros.portions,
          calories: recipe.calories ?? apiMacros.caloriesPerServing,
          protein_g: recipe.protein_g ?? apiMacros.proteinPerServing,
          carbs_g: recipe.carbs_g ?? apiMacros.carbsPerServing,
          fat_g: recipe.fat_g ?? apiMacros.fatPerServing,
        };

        addFoodLog(newItem);
      });
    };

    importSlot(currentDayPlan.desayuno, "breakfast");
    importSlot(currentDayPlan.comida, "lunch");
    importSlot(currentDayPlan.cena, "dinner");

    alert(
      `¡Comidas planificadas para hoy (Día ${currentDayNum}) importadas a tu diario Fit!`,
    );
  };

  const handleOpenAddFoodModal = (
    meal: "breakfast" | "lunch" | "dinner" | "snack" = "breakfast",
  ) => {
    setModalMealType(meal);
    setIsAddFoodOpen(true);
  };

  const handleOpenEditActivityModal = (act?: FitActivity | null) => {
    setEditingActivity(act || null);
    setIsEditActivityOpen(true);
  };

  const handleOpenRegisterMacroModal = (initialName: string) => {
    setRegisterMacroName(initialName);
    setIsRegisterMacroOpen(true);
  };

  const handleDeleteFood = (id: string) => {
    const itemToDelete = foodLogs.find((f) => f.id === id);
    removeFoodLog(id);

    const hasActiveFamily = Boolean(profile?.active_family_id);
    if (
      itemToDelete &&
      itemToDelete.callaycome_recipe_id &&
      on_remove_assigned_recipe &&
      !hasActiveFamily
    ) {
      const plannerMealType =
        itemToDelete.meal_type === "breakfast"
          ? "desayuno"
          : itemToDelete.meal_type === "lunch"
            ? "comida"
            : "cena";
      on_remove_assigned_recipe(currentDayNum, plannerMealType, 0);
    }
  };

  const handleAddRecipeToLog = (r: Recipe) => {
    const apiMacros = getRecipeSuperMarketMacros(r);

    addFoodLog({
      id: Date.now().toString(),
      meal_type: "lunch",
      food_name: `${r.name} (Versión Fit)`,
      callaycome_recipe_id: r.id,
      servings: r.servings ?? r.portions ?? apiMacros.portions,
      calories: r.calories ?? apiMacros.caloriesPerServing,
      protein_g: r.protein_g ?? apiMacros.proteinPerServing,
      carbs_g: r.carbs_g ?? apiMacros.carbsPerServing,
      fat_g: r.fat_g ?? apiMacros.fatPerServing,
    });
    alert(`¡${r.name} añadida a tu diario nutricional!`);
  };

  return (
    <Box style={{ padding: "16px 0", color: "#F8FAFC" }}>
      <FitHeader
        startDate={start_date}
        onOpenDateModal={() => setIsDateModalOpen(true)}
      />

      <Box style={{ marginBottom: "20px" }}>
        <FitNavTabs subTab={subTab} onSelectSubTab={setSubTab} />
      </Box>

      {subTab === "dashboard" && (
        <FitDashboardSubTab
          userProfile={userProfile}
          setUserProfile={setUserProfile}
          foodLogs={foodLogs}
          activities={activities}
          onOpenAddActivityModal={handleOpenEditActivityModal}
          onRemoveActivity={removeActivity}
          onSelectSubTab={setSubTab}
        />
      )}

      {subTab === "diary" && (
        <FitDiarySubTab
          foodLogs={foodLogs}
          profile={profile}
          currentDayPlan={currentDayPlan}
          currentDayNum={currentDayNum}
          onImportMealPlan={handleImportMealPlan}
          onOpenAddFoodModal={handleOpenAddFoodModal}
          onOpenRegisterMacroModal={handleOpenRegisterMacroModal}
          onOpenRecipeIngredientsMacroModal={() => setIsRecipeIngredientsMacroOpen(true)}
          onDeleteFood={handleDeleteFood}
        />
      )}

      {subTab === "goals" && (
        <FitGoalsSubTab
          userProfile={userProfile}
          setUserProfile={setUserProfile}
        />
      )}

      {subTab === "activity" && (
        <FitActivitiesSubTab
          activities={activities}
          onOpenAddActivityModal={handleOpenEditActivityModal}
          onRemoveActivity={removeActivity}
        />
      )}

      {subTab === "recipes" && (
        <FitRecipesSubTab
          recipes={recipes}
          onAddRecipeToLog={handleAddRecipeToLog}
        />
      )}

      {subTab === "progress" && (
        <FitProgressSubTab
          weightLogs={weightLogs}
          userProfile={userProfile}
          activities={activities}
          onOpenAddWeightModal={() => setIsAddWeightOpen(true)}
          onRemoveWeightLog={removeWeightLog}
        />
      )}

      <FitAddFoodModal
        isOpen={isAddFoodOpen}
        onClose={() => setIsAddFoodOpen(false)}
        mealType={modalMealType}
        recipes={recipes}
        profile={profile}
        startDate={start_date}
        onAddFoodLog={addFoodLog}
        onAssignRecipe={on_assign_recipe}
        onOpenRegisterMacroModal={handleOpenRegisterMacroModal}
      />

      <FitRegisterMacroModal
        isOpen={isRegisterMacroOpen}
        onClose={() => setIsRegisterMacroOpen(false)}
        initialProductName={registerMacroName}
      />

      <FitRecipeIngredientsMacroModal
        isOpen={isRecipeIngredientsMacroOpen}
        onClose={() => setIsRecipeIngredientsMacroOpen(false)}
        recipes={recipes}
      />

      <FitAddWeightModal
        isOpen={isAddWeightOpen}
        onClose={() => setIsAddWeightOpen(false)}
        userProfile={userProfile}
        onAddWeightLog={addWeightLog}
      />

      <FitEditActivityModal
        isOpen={isEditActivityOpen}
        onClose={() => setIsEditActivityOpen(false)}
        activityToEdit={editingActivity}
        onAddActivity={addActivity}
        onUpdateActivity={updateActivity}
      />

      <FitDateModal
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
        startDate={start_date}
        onChangeStartDate={on_change_start_date}
      />
    </Box>
  );
};

export default FitTab;
