import { Trash2 } from 'lucide-react';
import { IconoBoton } from '../common/IconoBoton';
import { PantryItemContainer, FlexRow, PantryItemName, PantryItemQty } from '../common';
import type { PantryItem } from '../../types';

interface PantryItemCardProps {
  item: PantryItem;
  on_delete: () => void;
}

export const PantryItemCard = ({
  item,
  on_delete
}: PantryItemCardProps) => {
  return (
    <PantryItemContainer>
      <FlexRow>
        <PantryItemName>{item.ingredient_name}</PantryItemName>
        <PantryItemQty>{item.quantity} {item.unit}</PantryItemQty>
        <IconoBoton 
          on_click={on_delete}
          color="error"
        >
          <Trash2 size={16} />
        </IconoBoton>
      </FlexRow>
    </PantryItemContainer>
  );
};
