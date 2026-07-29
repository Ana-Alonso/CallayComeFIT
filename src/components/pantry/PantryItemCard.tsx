import { Trash2, Flame } from 'lucide-react';
import { IconoBoton } from '../common/IconoBoton';
import { PantryItemContainer, FlexRow, PantryItemName, PantryItemQty } from '../common';
import type { PantryItem } from '../../types';
import { getIngredientNutrition } from '../../utils/nutrition';

interface PantryItemCardProps {
  item: PantryItem;
  on_delete: () => void;
}

export const PantryItemCard = ({
  item,
  on_delete
}: PantryItemCardProps) => {
  const macros = getIngredientNutrition(item.ingredient_name, item.quantity);

  return (
    <PantryItemContainer style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <FlexRow>
        <PantryItemName>{item.ingredient_name}</PantryItemName>
        <PantryItemQty>{item.quantity} {item.unit}</PantryItemQty>
      </FlexRow>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.3)', padding: '6px 10px', borderRadius: '8px', fontSize: '0.78rem' }}>
        <span style={{ color: '#F97316', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Flame size={14} /> {macros.calories} kcal
        </span>
        <span style={{ color: '#94A3B8' }}>
          🥩 {macros.protein_g}g P • 🍚 {macros.carbs_g}g C • 🥑 {macros.fat_g}g G
        </span>
        <IconoBoton 
          on_click={on_delete}
          color="error"
        >
          <Trash2 size={16} />
        </IconoBoton>
      </div>
    </PantryItemContainer>
  );
};
