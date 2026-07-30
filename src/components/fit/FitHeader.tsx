import React from 'react';
import { Zap } from 'lucide-react';
import { Box } from '../common';
import { format_date_display } from '../../utils/planner_helpers';

interface FitHeaderProps {
  startDate?: string | null;
  onChangeStartDate?: () => void;
  onOpenDateModal?: () => void;
}

export const FitHeader: React.FC<FitHeaderProps> = ({
  startDate,
  onOpenDateModal
}) => {
  return (
    <Box
      style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(249, 115, 22, 0.08))',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}
    >
      <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Zap size={24} style={{ color: '#10B981', fill: '#10B981' }} />
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>
              Calla y Come <span style={{ color: '#10B981' }}>FIT</span>
            </h1>
          </Box>
          <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem' }}>
            Seguimiento de nutrición, macronutrientes y gasto energético de tu actividad.
          </p>
        </Box>

        {onOpenDateModal && (
          <button
            type="button"
            onClick={onOpenDateModal}
            style={{
              background: 'rgba(59,130,246,0.15)',
              border: '1px solid rgba(59,130,246,0.3)',
              color: '#60A5FA',
              padding: '8px 14px',
              borderRadius: '10px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            📅 Inicio Plan: {startDate ? format_date_display(startDate) : 'Elegir Fecha'} ✏️
          </button>
        )}
      </Box>
    </Box>
  );
};
