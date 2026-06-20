import { useState, useEffect } from 'react';
import {
  Plus,
  User,
  Phone,
  Bike as BikeIcon,
  FileText,
  Clock,
  Volume2,
  Play,
  Wrench,
  CheckCircle,
  XCircle,
  Bell,
  Car,
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
  cn,
} from '@/utils';

export default function QueueHall() {
  const {
    addTicket,
    callNextTicket,
    completeTicket,
    cancelTicket,
    startServicing,
    getWaitingTickets,
    getStationCurrentTicket,
    getStationWaitingTickets,
    getReadyForPickupTickets,
    pickupTicket,
    recalculateStationLoad,
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

  const waitingTickets = getWaitingTickets();
  const readyForPickupTickets = getReadyForPickupTickets();

  useEffect(() => {
    stations.forEach((station) => {
      recalculateStationLoad(station.id);
    });
  }, []);

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
    callNextTicket(stationId);
  };

  const handleStartServicing = (ticketId: string) => {
    startServicing(ticketId);
  };

  const handleComplete = (ticketId: string) => {
    completeTicket(ticketId);
  };

  const handleCancel = (ticketId: string) => {
    cancelTicket(ticketId);
  };

  const handlePickup = (ticketId: string) => {
    pickupTicket(ticketId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">叫号大厅</h2>
          <p className="text-sm text-slate-500 mt-1">
            当前等待 {waitingTickets.length} 人，
            {stations.filter((s) => s.status !== 'offline').length} 个工位工作中
            {readyForPickupTickets.length > 0 && (
              <span className="ml-2 text-amber-600">
                · {readyForPickupTickets.length} 辆车待取车
              </span>
            )}
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

      {readyForPickupTickets.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Bell className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-800">待取车提醒</h3>
              <p className="text-sm text-amber-600">
                以下车辆已完成维修，请通知车主取车
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {readyForPickupTickets.map((ticket) => {
              const station = stations.find((s) => s.id === ticket.stationId);
              return (
                <div
                  key={ticket.id}
                  className="bg-white rounded-xl p-4 border border-amber-200 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <Car className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800 truncate">
                        {ticket.customerName}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {ticket.bikeModel}
                      </p>
                      <p className="text-xs text-amber-600">
                        {station?.name || '未知工位'} · {formatTime(ticket.completedAt!)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handlePickup(ticket.id)}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm rounded-lg font-medium transition-colors flex-shrink-0"
                  >
                    已取车
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stations.map((station) => {
          const currentTicket = getStationCurrentTicket(station.id);
          const stationWaitingTickets = getStationWaitingTickets(station.id);
          const isCalling = currentTicket?.status === 'calling';
          const isServicing = currentTicket?.status === 'servicing';
          const hasActiveTicket = isCalling || isServicing;

          return (
            <div
              key={station.id}
              className={cn(
                'bg-white rounded-2xl border-2 p-5 transition-all duration-300',
                isCalling
                  ? 'border-teal-400 shadow-lg shadow-teal-100'
                  : isServicing
                  ? 'border-blue-400 shadow-lg shadow-blue-100'
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
                    'rounded-xl p-4 mb-4',
                    isCalling
                      ? 'bg-gradient-to-br from-teal-50 to-cyan-50'
                      : isServicing
                      ? 'bg-gradient-to-br from-blue-50 to-indigo-50'
                      : 'bg-slate-50'
                  )}
                >
                  <div className="text-center mb-3">
                    <p className="text-xs text-slate-500 mb-1">
                      {isCalling ? '当前叫号' : '服务中'}
                    </p>
                    <p
                      className={cn(
                        'text-4xl font-bold mb-2',
                        isCalling
                          ? 'text-teal-600 animate-pulse'
                          : 'text-blue-600'
                      )}
                    >
                      {padNumber(currentTicket.ticketNumber)}
                    </p>
                    <p className="text-sm text-slate-600 font-medium">
                      {currentTicket.customerName}
                    </p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {currentTicket.bikeModel}
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-xs">
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full font-medium',
                        isCalling
                          ? 'bg-teal-100 text-teal-700'
                          : 'bg-blue-100 text-blue-700'
                      )}
                    >
                      {getServiceTypeLabel(currentTicket.serviceType)}
                    </span>
                    <span className="text-slate-400">
                      {formatTime(currentTicket.calledAt || currentTicket.createdAt)}
                    </span>
                  </div>

                  {isCalling && (
                    <div className="flex items-center justify-center gap-1 mt-3 text-teal-600">
                      <Volume2 className="w-4 h-4 animate-bounce" />
                      <span className="text-xs font-medium">叫号中...</span>
                    </div>
                  )}

                  {isServicing && (
                    <div className="flex items-center justify-center gap-1 mt-3 text-blue-600">
                      <Wrench className="w-4 h-4" />
                      <span className="text-xs font-medium">维修进行中</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-50 rounded-xl p-4 mb-4 text-center">
                  <p className="text-slate-400 text-sm">暂无叫号</p>
                  {stationWaitingTickets.length > 0 && (
                    <p className="text-xs text-slate-500 mt-1">
                      队列中有 {stationWaitingTickets.length} 人等待
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">等待人数</span>
                  <span className="font-semibold text-slate-700">
                    {stationWaitingTickets.length} 人
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">当前负载</span>
                  <span className="font-semibold text-slate-700">
                    {station.currentLoad}%
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                {!hasActiveTicket && (
                  <button
                    onClick={() => handleCallNext(station.id)}
                    disabled={station.status === 'offline' || stationWaitingTickets.length === 0}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Play className="w-4 h-4" />
                    下一位
                  </button>
                )}
                {isCalling && (
                  <>
                    <button
                      onClick={() => handleCallNext(station.id)}
                      disabled={stationWaitingTickets.length === 0}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Play className="w-4 h-4" />
                      重叫
                    </button>
                    <button
                      onClick={() => handleStartServicing(currentTicket!.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-sm font-medium transition-colors"
                    >
                      <Wrench className="w-4 h-4" />
                      开始维修
                    </button>
                  </>
                )}
                {isServicing && (
                  <button
                    onClick={() => handleComplete(currentTicket!.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl text-sm font-medium transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    完成
                  </button>
                )}
              </div>

              {stationWaitingTickets.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-2">等待队列</p>
                  <div className="space-y-1.5 max-h-24 overflow-auto">
                    {stationWaitingTickets.slice(0, 3).map((ticket) => (
                      <div
                        key={ticket.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-600 flex-shrink-0">
                            {padNumber(ticket.ticketNumber)}
                          </span>
                          <span className="text-slate-600 truncate">
                            {ticket.customerName}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 flex-shrink-0">
                          {getServiceTypeLabel(ticket.serviceType)}
                        </span>
                      </div>
                    ))}
                    {stationWaitingTickets.length > 3 && (
                      <p className="text-xs text-slate-400 text-center">
                        还有 {stationWaitingTickets.length - 3} 人...
                      </p>
                    )}
                  </div>
                </div>
              )}
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
            {waitingTickets.map((ticket, index) => {
              const station = stations.find((s) => s.id === ticket.stationId);
              return (
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
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
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
                      {station && (
                        <span className="px-2 py-0.5 bg-slate-100 rounded-full text-xs text-slate-600">
                          {station.name}
                        </span>
                      )}
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
                      title="取消"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
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
