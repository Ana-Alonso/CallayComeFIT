import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ShoppingList } from '../ShoppingList';
import type { ShoppingItem } from '../../../types';

describe('ShoppingList Component', () => {
  const mockRecalculate = vi.fn();
  const mockToggle = vi.fn();
  const mockAddCustom = vi.fn();

  const mockItems: ShoppingItem[] = [
    { id: 1, ingredient_name: 'Tomates', quantity: 3, unit: 'unidades', purchased: false, manual: false },
    { id: 2, ingredient_name: 'Servilletas', quantity: 2, unit: 'uds', purchased: false, manual: true }
  ];

  test('renders calculated and manual items correctly', () => {
    render(
      <ShoppingList
        shopping_items={mockItems}
        on_recalculate={mockRecalculate}
        on_toggle={mockToggle}
        on_add_custom={mockAddCustom}
        start_date={null}
      />
    );

    // Verify items are displayed
    expect(screen.getByText('Tomates')).toBeInTheDocument();
    expect(screen.getByText('Servilletas')).toBeInTheDocument();
    expect(screen.getByText('comprar 3 unidades')).toBeInTheDocument();
    expect(screen.getByText('comprar 2 uds')).toBeInTheDocument();
  });

  test('calls on_add_custom when adding a manual item', () => {
    render(
      <ShoppingList
        shopping_items={mockItems}
        on_recalculate={mockRecalculate}
        on_toggle={mockToggle}
        on_add_custom={mockAddCustom}
        start_date={null}
      />
    );

    const inputName = screen.getByPlaceholderText('Añadir ítem manual...');
    const inputQty = screen.getByRole('spinbutton');
    const selectUnit = screen.getByRole('combobox');
    const addButton = screen.getByRole('button', { name: /Añadir/i });

    fireEvent.change(inputName, { target: { value: 'Leche' } });
    fireEvent.change(inputQty, { target: { value: '4' } });
    fireEvent.change(selectUnit, { target: { value: 'L' } });

    fireEvent.click(addButton);

    expect(mockAddCustom).toHaveBeenCalledWith('Leche', 4, 'L');
  });

  test('calls on_toggle when clicking on a shopping item card', () => {
    render(
      <ShoppingList
        shopping_items={mockItems}
        on_recalculate={mockRecalculate}
        on_toggle={mockToggle}
        on_add_custom={mockAddCustom}
        start_date={null}
      />
    );

    const itemCard = screen.getByText('Tomates');
    fireEvent.click(itemCard);

    expect(mockToggle).toHaveBeenCalledWith(0); // Tomates is index 0
  });
});
