import { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Check,
  Car,
  AlertTriangle,
  Settings,
  X,
  ChevronRight,
} from 'lucide-react';
import { useNotificationStore } from '@/stores/notificationStore';
import { useStationStore } from '@/stores/stationStore';
import { useQueueStore } from '@/stores/queueStore';
import { cn, formatTime } from '@/utils';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
  } = useNotificationStore();
  const { stations } = useStationStore();
  const { pickupTicket } = useQueueStore();

  const unreadCount = getUnreadCount();
  const unreadNotifications = notifications
    .filter((n) => !n.read)
    .slice(0, 10);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'pickup':
        return <Car className="w-5 h-5 text-amber-500" />;
      case 'low_stock':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Settings className="w-5 h-5 text-slate-500" />;
    }
  };

  const getNotificationBg = (type: string) => {
    switch (type) {
      case 'pickup':
        return 'bg-amber-50 border-amber-200';
      case 'low_stock':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  const handlePickup = (ticketId: string, notificationId: string) => {
    pickupTicket(ticketId);
    markAsRead(notificationId);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 bg-red-500 text-white text-[10px] font-bold rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">通知中心</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-teal-600 hover:text-teal-700 font-medium"
              >
                全部已读
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-auto">
            {unreadNotifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="text-slate-400 text-sm">暂无新通知</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {unreadNotifications.map((notification) => {
                  const station = notification.stationId
                    ? stations.find((s) => s.id === notification.stationId)
                    : null;
                  return (
                    <div
                      key={notification.id}
                      className={cn(
                        'p-4 border-l-4 hover:bg-slate-50 transition-colors',
                        getNotificationBg(notification.type)
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-slate-800 text-sm">
                              {notification.title}
                            </h4>
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1 text-slate-300 hover:text-slate-500 rounded hover:bg-slate-100 transition-colors flex-shrink-0"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-sm text-slate-600 mt-1">
                            {notification.message}
                          </p>
                          {notification.customerName && (
                            <div className="mt-2 text-xs text-slate-500 space-y-0.5">
                              <p>车主：{notification.customerName}</p>
                              {notification.bikeModel && (
                                <p>车型：{notification.bikeModel}</p>
                              )}
                              {station && (
                                <p>完成工位：{station.name}</p>
                              )}
                            </div>
                          )}
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-xs text-slate-400">
                              {formatTime(notification.createdAt)}
                            </span>
                            {notification.type === 'pickup' &&
                              notification.ticketId && (
                                <button
                                  onClick={() =>
                                    handlePickup(
                                      notification.ticketId!,
                                      notification.id
                                    )
                                  }
                                  className="flex items-center gap-1 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs rounded-lg font-medium transition-colors"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  已取车
                                </button>
                              )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="px-4 py-3 border-t border-slate-100">
            <button className="w-full flex items-center justify-center gap-1 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
              查看全部通知
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
