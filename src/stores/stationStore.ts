import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RepairStation, LoadBalanceResult, StationStatus } from '@/types';
import { mockStations } from '@/data/mockData';

interface StationState {
  stations: RepairStation[];
  setStations: (stations: RepairStation[]) => void;
  updateStationStatus: (id: string, status: StationStatus) => void;
  updateStationLoad: (id: string, load: number) => void;
  incrementCompleted: (id: string) => void;
  getStationById: (id: string) => RepairStation | undefined;
  getAvailableStations: () => RepairStation[];
  calculateLoadBalance: (estimatedMinutes?: number) => LoadBalanceResult;
  getTotalWaiting: () => number;
  reassignTicket: (ticketId: string, fromStationId: string, toStationId: string) => void;
}

export const useStationStore = create<StationState>()(
  persist(
    (set, get) => ({
      stations: mockStations,

      setStations: (stations) => set({ stations }),

      updateStationStatus: (id, status) =>
        set((state) => ({
          stations: state.stations.map((s) =>
            s.id === id ? { ...s, status } : s
          ),
        })),

      updateStationLoad: (id, load) =>
        set((state) => ({
          stations: state.stations.map((s) =>
            s.id === id ? { ...s, currentLoad: load } : s
          ),
        })),

      incrementCompleted: (id) =>
        set((state) => ({
          stations: state.stations.map((s) =>
            s.id === id
              ? { ...s, completedToday: s.completedToday + 1 }
              : s
          ),
        })),

      getStationById: (id) => get().stations.find((s) => s.id === id),

      getAvailableStations: () =>
        get().stations.filter((s) => s.status !== 'offline'),

      calculateLoadBalance: (estimatedMinutes = 30) => {
        const availableStations = get().getAvailableStations();
        if (availableStations.length === 0) {
          return { stationId: '', score: 0, reason: '暂无可用工位' };
        }

        let bestStation = availableStations[0];
        let bestScore = -Infinity;
        let bestReason = '';

        for (const station of availableStations) {
          const loadScore = 100 - station.currentLoad;
          const waitingScore = station.waitingCount * -10;
          const speedScore = (60 - station.avgServiceTime) * 0.5;
          const statusBonus = station.status === 'idle' ? 30 : 0;
          const totalScore =
            loadScore + waitingScore + speedScore + statusBonus;

          if (totalScore > bestScore) {
            bestScore = totalScore;
            bestStation = station;

            const reasons = [];
            if (station.status === 'idle') reasons.push('当前空闲');
            if (station.waitingCount === 0) reasons.push('无人等待');
            if (station.avgServiceTime < 30) reasons.push('效率高');
            bestReason = reasons.join('、') || '综合评分最高';
          }
        }

        return {
          stationId: bestStation.id,
          score: Math.round(bestScore),
          reason: bestReason,
        };
      },

      getTotalWaiting: () =>
        get().stations.reduce((sum, s) => sum + s.waitingCount, 0),

      reassignTicket: (_ticketId, fromStationId, toStationId) => {
        set((state) => ({
          stations: state.stations.map((s) => {
            if (s.id === fromStationId) {
              return { ...s, waitingCount: Math.max(0, s.waitingCount - 1) };
            }
            if (s.id === toStationId) {
              return { ...s, waitingCount: s.waitingCount + 1 };
            }
            return s;
          }),
        }));
      },
    }),
    {
      name: 'station-storage',
      partialize: (state) => ({ stations: state.stations }),
    }
  )
);
