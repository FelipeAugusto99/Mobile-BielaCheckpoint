import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { PickupPoint } from '@/types/api';

interface PickupSelectionValue {
  /** null = receber em casa */
  selected: PickupPoint | null;
  select: (point: PickupPoint | null) => void;
}

const PickupSelectionContext = createContext<PickupSelectionValue | null>(null);

export function PickupSelectionProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<PickupPoint | null>(null);
  const value = useMemo(() => ({ selected, select: setSelected }), [selected]);
  return <PickupSelectionContext.Provider value={value}>{children}</PickupSelectionContext.Provider>;
}

export function usePickupSelection(): PickupSelectionValue {
  const context = useContext(PickupSelectionContext);
  if (!context) throw new Error('usePickupSelection precisa estar dentro de <PickupSelectionProvider>');
  return context;
}
