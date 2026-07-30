import React, { useState, useEffect } from 'react';
import { Box } from '../common';
import { saveSupermarketProductMacros } from '../../services/supermarket_api';

interface FitRegisterMacroModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProductName?: string;
}

export const FitRegisterMacroModal: React.FC<FitRegisterMacroModalProps> = ({
  isOpen,
  onClose,
  initialProductName = ''
}) => {
  const [regMacroName, setRegMacroName] = useState(initialProductName);
  const [regMacroSuper, setRegMacroSuper] = useState('Mercadona');
  const [regMacroKcal, setRegMacroKcal] = useState('');
  const [regMacroProtein, setRegMacroProtein] = useState('');
  const [regMacroCarbs, setRegMacroCarbs] = useState('');
  const [regMacroFat, setRegMacroFat] = useState('');

  useEffect(() => {
    if (initialProductName) {
      setRegMacroName(initialProductName);
    }
  }, [initialProductName]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regMacroName || !regMacroKcal) return;

    await saveSupermarketProductMacros({
      nombre: regMacroName,
      supermercado: regMacroSuper,
      calories: parseInt(regMacroKcal) || 0,
      protein_g: parseFloat(regMacroProtein) || 0,
      carbs_g: parseFloat(regMacroCarbs) || 0,
      fat_g: parseFloat(regMacroFat) || 0,
      unit: '100g'
    });

    onClose();
    setRegMacroName('');
    setRegMacroKcal('');
    setRegMacroProtein('');
    setRegMacroCarbs('');
    setRegMacroFat('');
  };

  return (
    <Box style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <Box style={{ background: '#1E293B', border: '1px solid #3B82F6', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '450px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '1.15rem', color: '#60A5FA' }}>🛒 Registrar Macros de Producto</h3>
        <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '0 0 16px 0' }}>
          Guarda la información nutricional (por cada 100g) en SuperMarketAPI para recordarla automáticamente en tus búsquedas.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Box>
            <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Nombre del Producto *</label>
            <input
              type="text"
              value={regMacroName}
              onChange={(e) => setRegMacroName(e.target.value)}
              required
              placeholder="Ej. Pechuga de Pavo 95%, Yogur Proteico..."
              style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '8px 12px', borderRadius: '8px' }}
            />
          </Box>

          <Box>
            <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Supermercado</label>
            <select
              value={regMacroSuper}
              onChange={(e) => setRegMacroSuper(e.target.value)}
              style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '8px 12px', borderRadius: '8px' }}
            >
              <option value="Mercadona">Mercadona</option>
              <option value="Aldi">Aldi</option>
              <option value="Carrefour">Carrefour</option>
              <option value="Lidl">Lidl</option>
              <option value="Dia">Dia</option>
              <option value="Eroski">Eroski</option>
              <option value="Otros">Otros</option>
            </select>
          </Box>

          <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Box>
              <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Calorías / 100g (kcal) *</label>
              <input
                type="number"
                value={regMacroKcal}
                onChange={(e) => setRegMacroKcal(e.target.value)}
                required
                placeholder="Ej. 110"
                style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '8px 12px', borderRadius: '8px' }}
              />
            </Box>

            <Box>
              <label style={{ fontSize: '0.8rem', color: '#60A5FA', display: 'block', marginBottom: '4px' }}>Proteínas / 100g (g)</label>
              <input
                type="number"
                step="0.1"
                value={regMacroProtein}
                onChange={(e) => setRegMacroProtein(e.target.value)}
                placeholder="Ej. 24.0"
                style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '8px 12px', borderRadius: '8px' }}
              />
            </Box>
          </Box>

          <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Box>
              <label style={{ fontSize: '0.8rem', color: '#FCD34D', display: 'block', marginBottom: '4px' }}>Carbohidratos / 100g (g)</label>
              <input
                type="number"
                step="0.1"
                value={regMacroCarbs}
                onChange={(e) => setRegMacroCarbs(e.target.value)}
                placeholder="Ej. 1.2"
                style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '8px 12px', borderRadius: '8px' }}
              />
            </Box>

            <Box>
              <label style={{ fontSize: '0.8rem', color: '#FBCFE8', display: 'block', marginBottom: '4px' }}>Grasas / 100g (g)</label>
              <input
                type="number"
                step="0.1"
                value={regMacroFat}
                onChange={(e) => setRegMacroFat(e.target.value)}
                placeholder="Ej. 1.5"
                style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '8px 12px', borderRadius: '8px' }}
              />
            </Box>
          </Box>

          <Box style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button type="button" onClick={onClose} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
              Cancelar
            </button>
            <button type="submit" style={{ background: '#3B82F6', color: '#FFF', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
              Guardar en SuperMarketAPI
            </button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};
