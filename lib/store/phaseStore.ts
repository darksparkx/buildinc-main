// lib/store/phaseStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { IPhase } from "@/lib/types";

interface PhaseState {
	phases: Record<string, IPhase>;
	setPhases: (phases: IPhase[]) => void;
	setProjectPhases: (projectId: string, phases: IPhase[]) => void;
	updatePhase: (id: string, updates: Partial<IPhase>) => void;
	addPhase: (phase: IPhase) => void;
	deletePhase: (id: string) => void;
	getPhase: (id: string) => IPhase | undefined;
	getPhasesByProject: (projectId: string) => IPhase[];
	clearPhases: () => void;
}

export const usePhaseStore = create<PhaseState>()(
	persist(
		(set, get) => ({
			phases: {},

			setPhases: (phases) => {
				const phasesObj: Record<string, IPhase> = {};
				phases.forEach((phase) => {
					phasesObj[phase.id] = phase;
				});
				set({ phases: phasesObj });
			},

			setProjectPhases: (projectId, phases) => {
				set((state) => {
					const retained = Object.fromEntries(
						Object.entries(state.phases).filter(
							([, phase]) => phase.projectId !== projectId,
						),
					);
					const next = { ...retained };
					phases.forEach((phase) => {
						next[phase.id] = phase;
					});
					return { phases: next };
				});
			},

			updatePhase: (id, updates) => {
				set((state) => {
					const existing = state.phases[id];
					if (existing) {
						return {
							phases: {
								...state.phases,
								[id]: { ...existing, ...updates },
							},
						};
					}
					return state;
				});
			},

			addPhase: (phase) => {
				set((state) => ({
					phases: {
						...state.phases,
						[phase.id]: phase,
					},
				}));
			},

			deletePhase: (id) => {
				set((state) => {
					const { [id]: _, ...remainingPhases } = state.phases;
					return { phases: remainingPhases };
				});
			},

			getPhase: (id) => {
				return get().phases[id];
			},

			getPhasesByProject: (projectId) => {
				const phases = Object.values(get().phases);
				return phases.filter((phase) => phase.projectId === projectId);
			},

			clearPhases: () => {
				set({ phases: {} });
			},
		}),
		{
			name: "phase-storage",
		}
	)
);
