import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RepairStation, LoadBalanceResult, StationStatus } from '@/types';
import { mockStations } from '@/data/mockData';

interface StationState {
  stations: RepairStation[];
  setStations: (stations: RepairStation[]) => void;
  updateStationStatus: (id: string, status: StationStatus) => void;
  updateStationLoad: (id: string, load: number) => void;
  updateWaitingCount: (id: string, count: number) => void;
  incrementCompleted: (id: string) => void;
  getStationById: (id: string) => RepairStation | undefined;
  getAvailableStations: () => RepairStation[];
  calculateLoadBalance: (
    estimatedMinutes?: number,
    excludeStationId?: string
  ) => LoadBalanceResult;
  getTotalWaiting: () => number;
  recalculateAllWaitingCounts: (getWaitingCountByStation: (stationId: string) => number) => void;
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

      updateWaitingCount: (id, count) =>
        set((state) => ({
          stations: state.stations.map((s) =>
            s.id === id ? { ...s, waitingCount: count } : s
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

      calculateLoadBalance: (estimatedMinutes = 30, excludeStationId) => {
        const availableStations = get()
          .getAvailableStations()
          .filter((s) => s.id !== excludeStationId);

        if (availableStations.length === 0) {
          return { stationId: '', score: 0, reason: '暂无可用工位' };
        }

        let bestStation = availableStations[0];
        let bestScore = -Infinity;
        let bestReason = '';

        for (const station of availableStations) {
          const loadScore = 100 - station.currentLoad;
          const waitingScore = station.waitingCount * -15;
          const speedScore = (60 - station.avgServiceTime) * 0.5;
          const statusBonus = station.status === 'idle' ? 40 : 0;
          const estimatedTimeBonus = estimatedMinutes < station.avgServiceTime ? 10 : 0;
          const totalScore =
            loadScore + waitingScore + speedScore + statusBonus + estimatedTimeBonus;

          if (totalScore > bestScore) {
            bestScore = totalScore;
            bestStation = station;

            const reasons = [];
            if (station.status === 'idle') reasons.push('当前空闲');
            if (station.waitingCount === 0) reasons.push('无人等待');
            else if (station.waitingCount === 1) reasons.push('仅1人等待');
            if (station.avgServiceTime < 30) reasons.push('效率高');
            if (station.currentLoad < 30) reasons.push('负载低');
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

      recalculateAllWaitingCounts: (getWaitingCountByStation) => {
        set((state) => ({
          stations: state.stations.map((s) => ({
            ...s,
            waitingCount: getWaitingCountByStation(s.id),
          })),
        }));
      },
    }),
    {
      name: 'station-storage',
      partialize: (state) => ({ stations: state.stations }),
    }
  )
);
