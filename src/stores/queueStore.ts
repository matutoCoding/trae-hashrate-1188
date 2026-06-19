import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { QueueTicket, TicketStatus, ServiceType } from '@/types';
import { mockTickets } from '@/data/mockData';
import { generateId } from '@/utils';
import { useStationStore } from './stationStore';

interface QueueState {
  tickets: QueueTicket[];
  currentTicketNumber: number;
  addTicket: (data: {
    customerName: string;
    phone: string;
    bikeModel: string;
    serviceType: ServiceType;
    description: string;
    estimatedMinutes?: number;
  }) => QueueTicket;
  updateTicketStatus: (id: string, status: TicketStatus) => void;
  assignTicketToStation: (ticketId: string, stationId: string) => void;
  callNextTicket: (stationId: string) => QueueTicket | null;
  completeTicket: (id: string) => void;
  cancelTicket: (id: string) => void;
  getWaitingTickets: () => QueueTicket[];
  getCallingTickets: () => QueueTicket[];
  getServicingTickets: () => QueueTicket[];
  getCompletedTickets: () => QueueTicket[];
  getTicketsByStation: (stationId: string) => QueueTicket[];
  reassignTicket: (ticketId: string, toStationId: string) => void;
  getTodayStats: () => {
    total: number;
    waiting: number;
    servicing: number;
    completed: number;
  };
}

export const useQueueStore = create<QueueState>()(
  persist(
    (set, get) => ({
      tickets: mockTickets,
      currentTicketNumber: 105,

      addTicket: (data) => {
        const newNumber = get().currentTicketNumber + 1;
        const ticket: QueueTicket = {
          id: generateId(),
          ticketNumber: newNumber,
          customerName: data.customerName,
          phone: data.phone,
          bikeModel: data.bikeModel,
          serviceType: data.serviceType,
          description: data.description,
          status: 'waiting',
          stationId: null,
          createdAt: new Date(),
          estimatedMinutes: data.estimatedMinutes || 30,
        };

        const balanceResult = useStationStore
          .getState()
          .calculateLoadBalance(data.estimatedMinutes || 30);

        if (balanceResult.stationId) {
          ticket.stationId = balanceResult.stationId;
          const station = useStationStore
            .getState()
            .getStationById(balanceResult.stationId);
          if (station) {
            useStationStore
              .getState()
              .updateStationLoad(
                balanceResult.stationId,
                Math.min(100, station.currentLoad + 15)
              );
            const stations = useStationStore.getState().stations;
            const updatedStation = stations.find(
              (s) => s.id === balanceResult.stationId
            );
            if (updatedStation) {
              useStationStore
                .getState()
                .updateStationStatus(
                  balanceResult.stationId,
                  updatedStation.status === 'idle' ? 'busy' : updatedStation.status
                );
            }
          }
        }

        set((state) => ({
          tickets: [...state.tickets, ticket],
          currentTicketNumber: newNumber,
        }));

        return ticket;
      },

      updateTicketStatus: (id, status) =>
        set((state) => ({
          tickets: state.tickets.map((t) =>
            t.id === id ? { ...t, status } : t
          ),
        })),

      assignTicketToStation: (ticketId, stationId) =>
        set((state) => ({
          tickets: state.tickets.map((t) =>
            t.id === ticketId ? { ...t, stationId } : t
          ),
        })),

      callNextTicket: (stationId) => {
        const waitingTickets = get()
          .getWaitingTickets()
          .filter((t) => t.stationId === stationId);

        if (waitingTickets.length === 0) return null;

        const nextTicket = waitingTickets[0];
        set((state) => ({
          tickets: state.tickets.map((t) =>
            t.id === nextTicket.id
              ? { ...t, status: 'calling' as TicketStatus, calledAt: new Date() }
              : t
          ),
        }));

        return nextTicket;
      },

      completeTicket: (id) => {
        const ticket = get().tickets.find((t) => t.id === id);
        if (ticket?.stationId) {
          useStationStore.getState().incrementCompleted(ticket.stationId);
        }

        set((state) => ({
          tickets: state.tickets.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: 'completed' as TicketStatus,
                  completedAt: new Date(),
                }
              : t
          ),
        }));
      },

      cancelTicket: (id) =>
        set((state) => ({
          tickets: state.tickets.map((t) =>
            t.id === id ? { ...t, status: 'cancelled' as TicketStatus } : t
          ),
        })),

      getWaitingTickets: () => get().tickets.filter((t) => t.status === 'waiting'),

      getCallingTickets: () => get().tickets.filter((t) => t.status === 'calling'),

      getServicingTickets: () =>
        get().tickets.filter((t) => t.status === 'servicing'),

      getCompletedTickets: () =>
        get().tickets.filter((t) => t.status === 'completed'),

      getTicketsByStation: (stationId) =>
        get().tickets.filter((t) => t.stationId === stationId),

      reassignTicket: (ticketId, toStationId) => {
        const ticket = get().tickets.find((t) => t.id === ticketId);
        if (!ticket || !ticket.stationId) return;

        useStationStore
          .getState()
          .reassignTicket(ticketId, ticket.stationId, toStationId);

        set((state) => ({
          tickets: state.tickets.map((t) =>
            t.id === ticketId ? { ...t, stationId: toStationId } : t
          ),
        }));
      },

      getTodayStats: () => {
        const tickets = get().tickets;
        const today = new Date().toDateString();
        const todayTickets = tickets.filter(
          (t) => new Date(t.createdAt).toDateString() === today
        );

        return {
          total: todayTickets.length,
          waiting: todayTickets.filter((t) => t.status === 'waiting').length,
          servicing: todayTickets.filter((t) => t.status === 'servicing').length,
          completed: todayTickets.filter((t) => t.status === 'completed').length,
        };
      },
    }),
    {
      name: 'queue-storage',
      partialize: (state) => ({
        tickets: state.tickets,
        currentTicketNumber: state.currentTicketNumber,
      }),
    }
  )
);
