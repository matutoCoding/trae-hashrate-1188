import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { QueueTicket, TicketStatus, ServiceType } from '@/types';
import { mockTickets } from '@/data/mockData';
import { generateId, getServiceTypeLabel } from '@/utils';
import { useStationStore } from './stationStore';
import { useNotificationStore } from './notificationStore';

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
  startServicing: (ticketId: string) => void;
  completeTicket: (id: string) => void;
  cancelTicket: (id: string) => void;
  pickupTicket: (id: string) => void;
  getWaitingTickets: () => QueueTicket[];
  getCallingTickets: () => QueueTicket[];
  getServicingTickets: () => QueueTicket[];
  getCompletedTickets: () => QueueTicket[];
  getReadyForPickupTickets: () => QueueTicket[];
  getTicketsByStation: (stationId: string) => QueueTicket[];
  getStationCurrentTicket: (stationId: string) => QueueTicket | null;
  getStationWaitingTickets: (stationId: string) => QueueTicket[];
  reassignTicket: (ticketId: string, toStationId: string) => void;
  recalculateStationLoad: (stationId: string) => void;
  getTodayStats: () => {
    total: number;
    waiting: number;
    calling: number;
    servicing: number;
    completed: number;
    readyForPickup: number;
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

          const stations = useStationStore.getState().stations;
          const station = stations.find((s) => s.id === balanceResult.stationId);
          if (station) {
            useStationStore
              .getState()
              .updateStationStatus(
                balanceResult.stationId,
                station.status === 'idle' ? 'busy' : station.status
              );
          }

          get().recalculateStationLoad(balanceResult.stationId);
        }

        set((state) => ({
          tickets: [...state.tickets, ticket],
          currentTicketNumber: newNumber,
        }));

        if (ticket.stationId) {
          get().recalculateStationLoad(ticket.stationId);
        }

        return ticket;
      },

      updateTicketStatus: (id, status) =>
        set((state) => ({
          tickets: state.tickets.map((t) =>
            t.id === id ? { ...t, status } : t
          ),
        })),

      assignTicketToStation: (ticketId, stationId) => {
        const ticket = get().tickets.find((t) => t.id === ticketId);
        const oldStationId = ticket?.stationId;

        set((state) => ({
          tickets: state.tickets.map((t) =>
            t.id === ticketId ? { ...t, stationId } : t
          ),
        }));

        if (oldStationId) {
          get().recalculateStationLoad(oldStationId);
        }
        get().recalculateStationLoad(stationId);
      },

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

        get().recalculateStationLoad(stationId);

        return nextTicket;
      },

      startServicing: (ticketId) => {
        const ticket = get().tickets.find((t) => t.id === ticketId);
        if (!ticket) return;

        set((state) => ({
          tickets: state.tickets.map((t) =>
            t.id === ticketId ? { ...t, status: 'servicing' as TicketStatus } : t
          ),
        }));

        if (ticket.stationId) {
          get().recalculateStationLoad(ticket.stationId);
        }
      },

      completeTicket: (id) => {
        const ticket = get().tickets.find((t) => t.id === id);
        if (!ticket) return;

        if (ticket.stationId) {
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

        const station = ticket.stationId
          ? useStationStore.getState().getStationById(ticket.stationId)
          : null;

        useNotificationStore.getState().addNotification({
          type: 'pickup',
          title: '车辆待取车',
          message: `${ticket.customerName} 的 ${ticket.bikeModel} 已完成${getServiceTypeLabel(ticket.serviceType)}，请通知取车`,
          ticketId: ticket.id,
          stationId: ticket.stationId || undefined,
          customerName: ticket.customerName,
          bikeModel: ticket.bikeModel,
        });

        if (ticket.stationId) {
          get().recalculateStationLoad(ticket.stationId);
        }
      },

      cancelTicket: (id) => {
        const ticket = get().tickets.find((t) => t.id === id);
        const stationId = ticket?.stationId;

        set((state) => ({
          tickets: state.tickets.map((t) =>
            t.id === id ? { ...t, status: 'cancelled' as TicketStatus } : t
          ),
        }));

        if (stationId) {
          get().recalculateStationLoad(stationId);
        }
      },

      pickupTicket: (id) => {
        const notifications = useNotificationStore
          .getState()
          .notifications.filter((n) => n.ticketId === id);
        notifications.forEach((n) => {
          useNotificationStore.getState().markAsRead(n.id);
        });
      },

      getWaitingTickets: () => get().tickets.filter((t) => t.status === 'waiting'),

      getCallingTickets: () => get().tickets.filter((t) => t.status === 'calling'),

      getServicingTickets: () =>
        get().tickets.filter((t) => t.status === 'servicing'),

      getCompletedTickets: () =>
        get().tickets.filter((t) => t.status === 'completed'),

      getReadyForPickupTickets: () => {
        const pickupNotificationTicketIds = new Set(
          useNotificationStore
            .getState()
            .getPickupNotifications()
            .map((n) => n.ticketId)
        );
        return get().tickets.filter(
          (t) => t.status === 'completed' && pickupNotificationTicketIds.has(t.id)
        );
      },

      getTicketsByStation: (stationId) =>
        get().tickets.filter((t) => t.stationId === stationId),

      getStationCurrentTicket: (stationId) => {
        const stationTickets = get().getTicketsByStation(stationId);
        return (
          stationTickets.find(
            (t) => t.status === 'calling' || t.status === 'servicing'
          ) || null
        );
      },

      getStationWaitingTickets: (stationId) =>
        get()
          .getTicketsByStation(stationId)
          .filter((t) => t.status === 'waiting'),

      reassignTicket: (ticketId, toStationId) => {
        const ticket = get().tickets.find((t) => t.id === ticketId);
        if (!ticket) return;
        const fromStationId = ticket.stationId;

        set((state) => ({
          tickets: state.tickets.map((t) =>
            t.id === ticketId ? { ...t, stationId: toStationId } : t
          ),
        }));

        if (fromStationId) {
          get().recalculateStationLoad(fromStationId);
        }
        get().recalculateStationLoad(toStationId);
      },

      recalculateStationLoad: (stationId) => {
        const stationTickets = get().getTicketsByStation(stationId);
        const waitingCount = stationTickets.filter(
          (t) => t.status === 'waiting'
        ).length;
        const hasActiveTicket = stationTickets.some(
          (t) => t.status === 'calling' || t.status === 'servicing'
        );

        const baseLoad = hasActiveTicket ? 50 : 0;
        const waitingLoad = waitingCount * 15;
        const totalLoad = Math.min(100, baseLoad + waitingLoad);

        const stationStore = useStationStore.getState();
        stationStore.updateStationLoad(stationId, totalLoad);
        stationStore.updateWaitingCount(stationId, waitingCount);

        const stations = stationStore.stations;
        const station = stations.find((s) => s.id === stationId);
        if (station) {
          const newStatus =
            totalLoad > 0 ? 'busy' : ('idle' as const);
          if (station.status !== 'offline' && station.status !== newStatus) {
            stationStore.updateStationStatus(stationId, newStatus);
          }
        }
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
          calling: todayTickets.filter((t) => t.status === 'calling').length,
          servicing: todayTickets.filter((t) => t.status === 'servicing').length,
          completed: todayTickets.filter((t) => t.status === 'completed').length,
          readyForPickup: get().getReadyForPickupTickets().length,
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
