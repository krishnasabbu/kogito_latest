import { create } from 'zustand';

interface ChampionChallengeState {
  testGroups: any[];
  setTestGroups: (groups: any[]) => void;
}

export const useChampionChallengeStore = create<ChampionChallengeState>((set) => ({
  testGroups: [],
  setTestGroups: (testGroups) => set({ testGroups }),
}));
