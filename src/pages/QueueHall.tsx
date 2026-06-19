import { useState } from 'react';
import {
  Plus,
  User,
  Phone,
  Bike as BikeIcon,
  FileText,
  Clock,
  Volume2,
  Play,
  CheckCircle,
  XCircle,
  Bell,
} from 'lucide-react';
import { useQueueStore } from '@/stores/queueStore';
import { useStationStore } from '@/stores/stationStore';
import type { ServiceType } from '@/types';
import {
  getStatusLabel,
  getStatusColor,
  getServiceTypeLabel,
  formatTime,
  padNumber,
} from '@/utils';
import { cn } from '@/utils';

export default function QueueHall() {
  const {
    tickets,
    addTicket,
    callNextTicket,
    completeTicket,
    cancelTicket,
    getWaitingTickets,
    getCallingTickets,
    updateTicketStatus,
  } = useQueueStore();
  const { stations } = useStationStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    bikeModel: '',
    serviceType: 'maintenance' as ServiceType,
    description: '',
    estimatedMinutes: 30,
  });

  const [selectedStation, setSelectedStation] = useState<string | null>(null);

  const waitingTickets = getWaitingTickets();
  const callingTickets = getCallingTickets();

  const handleAddTicket = () => {
    if (!formData.customerName || !formData.bikeModel) return;
    addTicket(formData);
    setShowAddModal(false);
    setFormData({
      customerName: '',
      phone: '',
      bikeModel: '',
      serviceType: 'maintenance',
      description: '',
      estimatedMinutes: 30,
    });
  };

  const handleCallNext = (stationId: string) => {
    const ticket = callNextTicket(stationId);
    if (ticket) {
      setSelectedStation(stationId);
      setTimeout(() => {
        updateTicketStatus(ticket.id, 'servicing');
      }, 5000);
    }
  };

  const handleComplete = (ticketId: string) => {
    completeTicket(ticketId);
  };

  const handleCancel = (ticketId: string) => {
    cancelTicket(ticketId);
  };

  const stationCallingTickets = (stationId: string) =>
    callingTickets.filter((t) => t.stationId === stationId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">叫号大厅</h2>
          <p className="text-sm text-slate-500 mt-1">
            当前等待 {waitingTickets.length} 人，{stations.filter((s) => s.status !== 'offline').length} 个工位工作中
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-teal-600/25"
        >
          <Plus className="w-5 h-5" />
          取号登记
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stations.map((station) => {
          const callingTicketsForStation = stationCallingTickets(station.id);
          const isCalling = callingTicketsForStation.length > 0;
          const currentTicket = callingTicketsForStation[0];

          return (
            <div
              key={station.id}
              className={cn(
                'bg-white rounded-2xl border-2 p-5 transition-all duration-300',
                isCalling
                  ? 'border-teal-400 shadow-lg shadow-teal-100'
                  : 'border-slate-100'
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-800">
                    {station.name}
                  </h3>
                  <p className="text-sm text-slate-400">{station.technician}</p>
                </div>
                <span
                  className={cn(
                    'px-2.5 py-1 rounded-full text-xs font-medium border',
                    getStatusColor(station.status)
                  )}
                >
                  {getStatusLabel(station.status)}
                </span>
              </div>

              {currentTicket ? (
                <div
                  className={cn(
                    'rounded-xl p-4 mb-4 text-center',
                    isCalling
                      ? 'bg-gradient-to-br from-teal-50 to-cyan-50'
                      : 'bg-slate-50'
                  )}
                >
                  <p className="text-xs text-slate-500 mb-1">当前叫号</p>
                  <p
                    className={cn(
                      'text-4xl font-bold mb-2',
                      isCalling
                        ? 'text-teal-600 animate-pulse'
                        : 'text-slate-700'
                    )}
                  >
                    {padNumber(currentTicket.ticketNumber)}
                  </p>
                  <p className="text-sm text-slate-600">
                    {currentTicket.customerName}
                  </p>
                  {isCalling && (
                    <div className="flex items-center justify-center gap-1 mt-2 text-teal-600">
                      <Volume2 className="w-4 h-4 animate-bounce" />
                      <span className="text-xs font-medium">叫号中...</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-50 rounded-xl p-4 mb-4 text-center">
                  <p className="text-slate-400 text-sm">暂无叫号</p>
                </div>
              )}

              <div className="flex items-center justify-between text-sm mb-4">
                <span className="text-slate-400">等待人数</span>
                <span className="font-semibold text-slate-700">
                  {
                    tickets.filter(
                      (t) =>
                        t.stationId === station.id && t.status === 'waiting'
                    ).length
                  }{' '}
                  人
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleCallNext(station.id)}
                  disabled={station.status === 'offline'}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-4 h-4" />
                  下一位
                </button>
                {currentTicket && (
                  <button
                    onClick={() => handleComplete(currentTicket.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl text-sm font-medium transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    完成
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">排队列表</h3>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-500">
              共 {waitingTickets.length} 人等待
            </span>
          </div>
        </div>

        {waitingTickets.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Bell className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">暂无排队</p>
            <p className="text-sm mt-1">点击「取号登记」添加新工单</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {waitingTickets.map((ticket, index) => (
              <div
                key={ticket.id}
                className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors"
              >
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg',
                    index === 0
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-100 text-slate-600'
                  )}
                >
                  {padNumber(ticket.ticketNumber)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-slate-800">
                      {ticket.customerName}
                    </span>
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        getStatusColor(ticket.status)
                      )}
                    >
                      {getServiceTypeLabel(ticket.serviceType)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 truncate">
                    {ticket.bikeModel}
                  </p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-sm text-slate-500">
                    预计 {ticket.estimatedMinutes} 分钟
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {formatTime(ticket.createdAt)} 取号
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCancel(ticket.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="px-6 py-5 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">
                取号登记
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                填写车主信息，系统将自动分配工位
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  <User className="w-4 h-4 inline mr-1.5" />
                  车主姓名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData({ ...formData, customerName: e.target.value })
                  }
                  placeholder="请输入车主姓名"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  <Phone className="w-4 h-4 inline mr-1.5" />
                  联系电话
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="请输入联系电话"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  <BikeIcon className="w-4 h-4 inline mr-1.5" />
                  车型 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.bikeModel}
                  onChange={(e) =>
                    setFormData({ ...formData, bikeModel: e.target.value })
                  }
                  placeholder="例如：美利达 挑战者300"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  <FileText className="w-4 h-4 inline mr-1.5" />
                  服务类型
                </label>
                <select
                  value={formData.serviceType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      serviceType: e.target.value as ServiceType,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all bg-white"
                >
                  <option value="maintenance">保养服务</option>
                  <option value="repair">维修服务</option>
                  <option value="inspection">检测服务</option>
                  <option value="custom">定制服务</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  预计用时（分钟）
                </label>
                <input
                  type="number"
                  value={formData.estimatedMinutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estimatedMinutes: Number(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  问题描述
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="请简要描述车辆问题"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddTicket}
                className="flex-1 py-2.5 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/25"
              >
                确认取号
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
