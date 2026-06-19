import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OutboundRecord } from '@/types';
import { mockOutboundRecords } from '@/data/mockData';
import { generateId } from '@/utils';
import { usePartStore } from './partStore';

interface OutboundState {
  records: OutboundRecord[];
  addRecord: (data: {
    batchId: string;
    quantity: number;
    destination: string;
    operator: string;
    remark?: string;
    ticketId?: string;
    stationId?: string;
  }) => OutboundRecord | null;
  deleteRecord: (id: string) => void;
  getRecordsByBatch: (batchId: string) => OutboundRecord[];
  getRecordsByStation: (stationId: string) => OutboundRecord[];
  getDestinationDistribution: (batchId?: string) => {
    destination: string;
    quantity: number;
    percentage: number;
  }[];
  getTodayOutboundCount: () => number;
  getTotalOutboundQuantity: (batchId?: string) => number;
  getRecentRecords: (limit?: number) => OutboundRecord[];
}

export const useOutboundStore = create<OutboundState>()(
  persist(
    (set, get) => ({
      records: mockOutboundRecords,

      addRecord: (data) => {
        const batch = usePartStore.getState().getBatchById(data.batchId);
        if (!batch) return null;
        if (data.quantity > batch.remainingQuantity) return null;

        const newRecord: OutboundRecord = {
          id: generateId(),
          batchId: data.batchId,
          quantity: data.quantity,
          destination: data.destination,
          operator: data.operator,
          outboundDate: new Date(),
          remark: data.remark || '',
          ticketId: data.ticketId,
          stationId: data.stationId,
        };

        const newRemaining = batch.remainingQuantity - data.quantity;
        usePartStore
          .getState()
          .updateRemainingQuantity(data.batchId, newRemaining);

        set((state) => ({
          records: [newRecord, ...state.records],
        }));

        return newRecord;
      },

      deleteRecord: (id) => {
        const record = get().records.find((r) => r.id === id);
        if (record) {
          const batch = usePartStore.getState().getBatchById(record.batchId);
          if (batch) {
            usePartStore
              .getState()
              .updateRemainingQuantity(
                record.batchId,
                batch.remainingQuantity + record.quantity
              );
          }
        }

        set((state) => ({
          records: state.records.filter((r) => r.id !== id),
        }));
      },

      getRecordsByBatch: (batchId) =>
        get().records.filter((r) => r.batchId === batchId),

      getRecordsByStation: (stationId) =>
        get().records.filter((r) => r.stationId === stationId),

      getDestinationDistribution: (batchId) => {
        const records = batchId
          ? get().getRecordsByBatch(batchId)
          : get().records;

        const distribution: Record<string, number> = {};
        let total = 0;

        for (const record of records) {
          distribution[record.destination] =
            (distribution[record.destination] || 0) + record.quantity;
          total += record.quantity;
        }

        return Object.entries(distribution).map(([destination, quantity]) => ({
          destination,
          quantity,
          percentage: total > 0 ? Math.round((quantity / total) * 100) : 0,
        }));
      },

      getTodayOutboundCount: () => {
        const today = new Date().toDateString();
        return get().records.filter(
          (r) => new Date(r.outboundDate).toDateString() === today
        ).length;
      },

      getTotalOutboundQuantity: (batchId) => {
        const records = batchId
          ? get().getRecordsByBatch(batchId)
          : get().records;
        return records.reduce((sum, r) => sum + r.quantity, 0);
      },

      getRecentRecords: (limit = 10) => get().records.slice(0, limit),
    }),
    {
      name: 'outbound-storage',
      partialize: (state) => ({ records: state.records }),
    }
  )
);
