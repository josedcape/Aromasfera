import { create } from 'zustand';
import { UserPreferences, Perfume } from '@/lib/utils';

interface PerfumeState {
  userPreferences: UserPreferences;
  recommendations: Perfume[];
  isLoading: boolean;
  
  setUserPreferences: (preferences: UserPreferences) => void;
  setRecommendations: (recommendations: Perfume[]) => void;
  setLoading: (isLoading: boolean) => void;
  resetUserPreferences: () => void;
}

export const usePerfumeStore = create<PerfumeState>((set) => ({
  userPreferences: {},
  recommendations: [],
  isLoading: false,
  
  setUserPreferences: (preferences) => 
    set((state) => ({ 
      userPreferences: { ...state.userPreferences, ...preferences } 
    })),
    
  setRecommendations: (recommendations) => 
    set({ recommendations }),
    
  setLoading: (isLoading) => 
    set({ isLoading }),
    
  resetUserPreferences: () => 
    set({ userPreferences: {} }),
}));
