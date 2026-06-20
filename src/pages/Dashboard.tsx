import {
  Users,
  Wrench,
  CheckCircle2,
  Clock,
  TrendingUp,
  Package,
  AlertTriangle,
  ArrowRight,
  Ticket,
  Car,
  Check,
  Bike,
} from 'lucide-react';
import { useQueueStore } from '@/stores/queueStore';
import { useStationStore } from '@/stores/stationStore';
import { usePartStore } from '@/stores/partStore';
import { useOutboundStore } from '@/stores/outboundStore';
import { useNotificationStore } from '@/stores/notificationStore';
import {
  getStatusColor,
  getStatusLabel,
  formatTime,
  calculateLoadPercentage,
  getLoadColor,
} from '@/utils';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const {
    getTodayStats,
    getCallingTickets,
    getServicingTickets,
    getReadyForPickupTickets,
    pickupTicket,
  } = useQueueStore();
  const { stations, getAvailableStations } = useStationStore();
  const { getLowStockBatches, batches } = usePartStore();
  const { getTodayOutboundCount, getRecentRecords } = useOutboundStore();
  const { getUnreadCount, markAsRead, notifications } = useNotificationStore();

  const stats = getTodayStats();
  const lowStockBatches = getLowStockBatches(30);
  const recentRecords = getRecentRecords(5);
  const availableStations = getAvailableStations();
  const callingTickets = getCallingTickets();
  const servicingTickets = getServicingTickets();

  const statCards = [
    {
      label: '今日叫号',
      value: stats.total,
      icon: Ticket,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
    },
    {
      label: '等待中',
      value: stats.waiting,
      icon: Clock,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50',
    },
    {
      label: '服务中',
      value: stats.servicing,
      icon: Wrench,
      color: 'from-teal-500 to-emerald-500',
      bgColor: 'bg-teal-50',
    },
    {
      label: '已完成',
      value: stats.completed,
      icon: CheckCircle2,
      color: 'from-green-500 to-lime-500',
      bgColor: 'bg-green-50',
    },
  ];

  const readyForPickupTickets = getReadyForPickupTickets();
  const unreadCount = getUnreadCount();
  const unreadPickupNotifications = notifications.filter(
    (n) => n.type === 'pickup' && !n.read
  );

  const handlePickup = (ticketId: string, notificationId: string) => {
    pickupTicket(ticketId);
    markAsRead(notificationId);
  };

  return (
    <div className="space-y-6">
      {unreadPickupNotifications.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
                <Car className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-800">
                  待取车提醒
                </h3>
                <p className="text-sm text-amber-600">
                  {unreadPickupNotifications.length} 辆车已完成维修，等待车主取车
                </p>
              </div>
            </div>
            {unreadPickupNotifications.length > 0 && (
              <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
                {unreadPickupNotifications.length} 条未读
              </span>
            )}
          </div>

          <div className="space-y-3">
            {unreadPickupNotifications.slice(0, 3).map((notification) => {
              const station = notification.stationId
                ? stations.find((s) => s.id === notification.stationId)
                : null;
              return (
                <div
                  key={notification.id}
                  className="bg-white rounded-xl p-4 border border-amber-100 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                      <Bike className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-800">
                          {notification.customerName}
                        </span>
                        <span className="text-sm text-slate-500">
                          {notification.bikeModel}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <Wrench className="w-3.5 h-3.5" />
                          {station?.name || '未知工位'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatTime(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {notification.ticketId && (
                    <button
                      onClick={() =>
                        handlePickup(
                          notification.ticketId!,
                          notification.id
                        )
                      }
                      className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-amber-500/25"
                    >
                      <Check className="w-4 h-4" />
                      确认取车
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">{card.label}</p>
                  <p className="text-3xl font-bold text-slate-800">
                    {card.value}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 rounded-xl ${card.bgColor} bg-gradient-to-br ${card.color} flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs">
                <TrendingUp className="w-3.5 h-3.5 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">+12%</span>
                <span className="text-slate-400 ml-2">较昨日</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold text-slate-800">
                工位状态
              </h3>
              <p className="text-sm text-slate-400 mt-0.5">
                共 {stations.length} 个工位，{availableStations.length} 个可用
              </p>
            </div>
            <Link
              to="/dispatch"
              className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1 font-medium"
            >
              查看详情
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stations.slice(0, 4).map((station) => (
              <div
                key={station.id}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-700">
                    {station.name}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                      station.status
                    )}`}
                  >
                    {getStatusLabel(station.status)}
                  </span>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>负载</span>
                      <span>{station.currentLoad}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getLoadColor(
                          station.currentLoad
                        )}`}
                        style={{ width: `${station.currentLoad}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">技师</span>
                    <span className="text-slate-700 font-medium">
                      {station.technician}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">今日完成</span>
                    <span className="text-slate-700 font-medium">
                      {station.completedToday} 单
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold text-slate-800">
                库存预警
              </h3>
              <p className="text-sm text-slate-400 mt-0.5">
                低于 30% 库存提醒
              </p>
            </div>
            <Link
              to="/parts"
              className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1 font-medium"
            >
              全部
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {lowStockBatches.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">暂无库存预警</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockBatches.slice(0, 5).map((batch) => {
                const percentage = calculateLoadPercentage(
                  batch.remainingQuantity,
                  batch.totalQuantity
                );
                return (
                  <div
                    key={batch.id}
                    className="p-3 rounded-xl bg-amber-50 border border-amber-100"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {batch.partName}
                        </p>
                        <p className="text-xs text-slate-400">
                          {batch.batchNumber}
                        </p>
                      </div>
                      <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-amber-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-amber-700">
                        {batch.remainingQuantity}
                        {batch.unit}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold text-slate-800">
                叫号动态
              </h3>
              <p className="text-sm text-slate-400 mt-0.5">
                当前叫号和服务中的工单
              </p>
            </div>
            <Link
              to="/queue"
              className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1 font-medium"
            >
              叫号大厅
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {callingTickets.length === 0 && servicingTickets.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">暂无进行中的工单</p>
              </div>
            ) : (
              [...callingTickets, ...servicingTickets].slice(0, 5).map(
                (ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                        ticket.status === 'calling'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-teal-100 text-teal-700'
                      }`}
                    >
                      {String(ticket.ticketNumber).slice(-3)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {ticket.customerName}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {ticket.bikeModel}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          ticket.status
                        )}`}
                      >
                        {getStatusLabel(ticket.status)}
                      </span>
                      <p className="text-xs text-slate-400 mt-1">
                        {ticket.calledAt
                          ? formatTime(ticket.calledAt)
                          : formatTime(ticket.createdAt)}
                      </p>
                    </div>
                  </div>
                )
              )
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold text-slate-800">
                最近出库
              </h3>
              <p className="text-sm text-slate-400 mt-0.5">
                今日出库 {getTodayOutboundCount()} 次
              </p>
            </div>
            <Link
              to="/outbound"
              className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1 font-medium"
            >
              全部记录
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentRecords.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">暂无出库记录</p>
              </div>
            ) : (
              recentRecords.map((record) => {
                const batch = batches.find((b) => b.id === record.batchId);
                return (
                  <div
                    key={record.id}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                      <Package className="w-5 h-5 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {batch?.partName || '未知配件'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {record.destination} · {record.operator}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-800">
                        -{record.quantity}
                        {batch?.unit || ''}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatTime(record.outboundDate)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
