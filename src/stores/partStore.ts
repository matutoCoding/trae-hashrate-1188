import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PartBatch } from '@/types';
import { mockPartBatches } from '@/data/mockData';
import { generateId } from '@/utils';

interface PartState {
  batches: PartBatch[];
  addBatch: (data: Omit<PartBatch, 'id' | 'remainingQuantity'>) => PartBatch;
  updateBatch: (id: string, data: Partial<PartBatch>) => void;
  deleteBatch: (id: string) => void;
  getBatchById: (id: string) => PartBatch | undefined;
  updateRemainingQuantity: (id: string, quantity: number) => void;
  getLowStockBatches: (threshold?: number) => PartBatch[];
  getBatchesByCategory: (category: string) => PartBatch[];
  getCategories: () => string[];
  searchBatches: (keyword: string) => PartBatch[];
}

export const usePartStore = create<PartState>()(
  persist(
    (set, get) => ({
      batches: mockPartBatches,

      addBatch: (data) => {
        const newBatch: PartBatch = {
          ...data,
          id: generateId(),
          remainingQuantity: data.totalQuantity,
        };
        set((state) => ({
          batches: [...state.batches, newBatch],
        }));
        return newBatch;
      },

      updateBatch: (id, data) =>
        set((state) => ({
          batches: state.batches.map((b) =>
            b.id === id ? { ...b, ...data } : b
          ),
        })),

      deleteBatch: (id) =>
        set((state) => ({
          batches: state.batches.filter((b) => b.id !== id),
        })),

      getBatchById: (id) => get().batches.find((b) => b.id === id),

      updateRemainingQuantity: (id, quantity) =>
        set((state) => ({
          batches: state.batches.map((b) =>
            b.id === id
              ? { ...b, remainingQuantity: Math.max(0, quantity) }
              : b
          ),
        })),

      getLowStockBatches: (threshold = 30) =>
        get().batches.filter((b) => {
          const percentage = (b.remainingQuantity / b.totalQuantity) * 100;
          return percentage <= threshold;
        }),

      getBatchesByCategory: (category) =>
        get().batches.filter((b) => b.category === category),

      getCategories: () => {
        const categories = new Set(get().batches.map((b) => b.category));
        return Array.from(categories);
      },

      searchBatches: (keyword) => {
        const lowerKeyword = keyword.toLowerCase();
        return get().batches.filter(
          (b) =>
            b.partName.toLowerCase().includes(lowerKeyword) ||
            b.partCode.toLowerCase().includes(lowerKeyword) ||
            b.batchNumber.toLowerCase().includes(lowerKeyword)
        );
      },
    }),
    {
      name: 'part-storage',
      partialize: (state) => ({ batches: state.batches }),
    }
  )
);
