'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ContentPiece } from '@/types';
import { seedProjects } from '@/lib/content';

export interface Webhooks {
  instagram?: string;
  google?: string;
}

interface AppStore {
  projects: ContentPiece[];
  current: ContentPiece | null;
  view: 'home' | 'studio';
  flowOpen: boolean;
  generating: boolean;
  toast: string | null;
  webhooks: Webhooks;

  setProjects: (projects: ContentPiece[]) => void;
  setCurrent: (p: ContentPiece | null) => void;
  setView: (v: 'home' | 'studio') => void;
  setFlowOpen: (v: boolean) => void;
  setGenerating: (v: boolean) => void;
  setToast: (msg: string | null) => void;
  updateCurrent: (p: ContentPiece) => void;
  addProject: (p: ContentPiece) => void;
  removeProject: (id: string) => void;
  setWebhooks: (w: Webhooks) => void;
}

export const useStore = create<AppStore>()(
  persist(
    (set) => ({
      projects: seedProjects(),
      current: null,
      view: 'home',
      flowOpen: false,
      generating: false,
      toast: null,
      webhooks: {
        instagram: 'https://hooks.zapier.com/hooks/catch/14659614/43606p9/',
        google: 'https://hooks.zapier.com/hooks/catch/14659614/43606p9/',
      },

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
      removeProject: (id) => set(state => ({
        projects: state.projects.filter(x => x.id !== id),
        current: state.current?.id === id ? (state.projects.find(x => x.id !== id) ?? null) : state.current,
      })),
      setWebhooks: (w) => set(state => ({ webhooks: { ...state.webhooks, ...w } })),
    }),
    {
      name: 'fw_projects',
      partialize: (state) => ({ projects: state.projects, webhooks: state.webhooks }),
    }
  )
);
