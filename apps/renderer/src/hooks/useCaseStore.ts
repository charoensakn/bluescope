import { create } from 'zustand';

interface CaseState {
  focusCaseId: string | null;
  setFocusCaseId: (id: string | null) => void;
}

export const useCaseStore = create<CaseState>((set) => ({
  focusCaseId: null,
  setFocusCaseId: (id) => set({ focusCaseId: id }),
}));
