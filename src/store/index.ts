'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ContentPiece, ChannelId } from '@/types';
import { seedProjects } from '@/lib/content';

interface AppStore {
  projects: ContentPiece[];
  current: ContentPiece | null;
  view: 'home' | 'studio';
  flowOpen: boolean;
  generating: boolean;
  toast: string | null;

  setProjects: (projects: ContentPiece[]) => void;
  setCurrent: (p: ContentPiece | null) => void;
  setView: (v: 'home' | 'studio') => void;
  setFlowOpen: (v: boolean) => void;
  setGenerating: (v: boolean) => void;
  setToast: (msg: string | null) => void;
  updateCurrent: (p: ContentPiece) => void;
  addProject: (p: ContentPiece) => void;
}

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      projects: seedProjects(),
      current: null,
      view: 'home',
      flowOpen: false,
      generating: false,
      toast: null,

      setProjects: (projects) => set({ projects }),
      setCurrent: (p) => set({ current: p }),
      setView: (v) => set({ view: v }),
      setFlowOpen: (v) => set({ flowOpen: v }),
      setGenerating: (v) => set({ generating: v }),
      setToast: (msg) => set({ toast: msg }),
      updateCurrent: (p) => set(state => ({
        current: p,
        projects: state.projects.map(x => x.id === p.id ? p : x),
      })),
      addProject: (p) => set(state => ({
        projects: [p, ...state.projects],
        current: p,
      })),
    }),
    {
      name: 'fw_projects',
      partialize: (state) => ({ projects: state.projects }),
    }
  )
);
