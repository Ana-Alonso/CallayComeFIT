import React, { useState, useEffect } from 'react';
import { Box } from '../common';

interface FitDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  startDate?: string | null;
  onChangeStartDate?: (newDate: string) => void;
}

export const FitDateModal: React.FC<FitDateModalProps> = ({
  isOpen,
  onClose,
  startDate,
  onChangeStartDate
}) => {
  const [selectedDate, setSelectedDate] = useState(startDate || new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (startDate) {
      setSelectedDate(startDate);
    }
  }, [startDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDate && onChangeStartDate) {
      onChangeStartDate(selectedDate);
    }
    onClose();
  };

  return (
    <Box style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <Box style={{ background: '#121826', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '380px' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '1.15rem' }}>Elegir Fecha de Inicio del Plan</h3>
        <p style={{ fontSize: '0.82rem', color: '#94A3B8', margin: '0 0 16px 0' }}>
          Selecciona el día de inicio del menú semanal para sincronizar el diario Fit.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            required
            style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '10px 12px', borderRadius: '8px', fontSize: '1rem' }}
          />

          <Box style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '6px' }}>
            <button type="button" onClick={onClose} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
              Cancelar
            </button>
            <button type="submit" style={{ background: '#3B82F6', color: '#FFF', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
              Establecer Fecha
            </button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};
