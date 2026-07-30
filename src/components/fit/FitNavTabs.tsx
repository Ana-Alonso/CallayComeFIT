import React from 'react';
import { Activity, Utensils, Target, Watch, BookOpen, TrendingUp } from 'lucide-react';
import { Box } from '../common';

export type FitSubTab = 'dashboard' | 'diary' | 'goals' | 'activity' | 'recipes' | 'progress';

interface FitNavTabsProps {
  subTab: FitSubTab;
  onSelectSubTab: (tab: FitSubTab) => void;
}

export const FitNavTabs: React.FC<FitNavTabsProps> = ({ subTab, onSelectSubTab }) => {
  const tabs: { id: FitSubTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Resumen', icon: <Activity size={15} /> },
    { id: 'diary', label: 'Diario', icon: <Utensils size={15} /> },
    { id: 'goals', label: 'Objetivos', icon: <Target size={15} /> },
    { id: 'activity', label: 'Entrenamientos', icon: <Watch size={15} style={{ color: subTab === 'activity' ? '#FFF' : '#10B981' }} /> },
    { id: 'recipes', label: 'Recetas Fit', icon: <BookOpen size={15} /> },
    { id: 'progress', label: 'Progresión', icon: <TrendingUp size={15} /> }
  ];

  return (
    <Box
      style={{
        display: 'flex',
        gap: '6px',
        background: 'rgba(0,0,0,0.3)',
        padding: '6px',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.08)',
        overflowX: 'auto',
        maxWidth: '100%',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none'
      }}
    >
      {tabs.map((tab) => {
        const isActive = subTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectSubTab(tab.id)}
            style={{
              background: isActive ? '#10B981' : 'transparent',
              color: '#FFF',
              border: 'none',
              padding: '8px 14px',
              borderRadius: '18px',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            {tab.icon} {tab.label}
          </button>
        );
      })}
    </Box>
  );
};
