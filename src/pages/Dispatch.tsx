import { useState } from 'react';
import {
  GitBranch,
  Users,
  Clock,
  Zap,
  ArrowRightLeft,
  TrendingUp,
  TrendingDown,
  UserCircle,
  Settings,
  RefreshCw,
} from 'lucide-react';
import { useStationStore } from '@/stores/stationStore';
import { useQueueStore } from '@/stores/queueStore';
import {
  getStatusColor,
  getStatusLabel,
  getLoadColor,
} from '@/utils';
import { cn } from '@/utils';
import type { StationStatus } from '@/types';

export default function Dispatch() {
  const {
    stations,
    calculateLoadBalance,
    updateStationStatus,
  } = useStationStore();
  const {
    tickets,
    reassignTicket,
    getWaitingTickets,
    getServicingTickets,
  } = useQueueStore();

  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [targetStation, setTargetStation] = useState<string>('');

  const balanceResult = calculateLoadBalance(30);
  const waitingTickets = getWaitingTickets();
  const servicingTickets = getServicingTickets();

  const totalLoad =
    stations.length > 0
      ? Math.round(
          stations.reduce((sum, s) => sum + s.currentLoad, 0) / stations.length
        )
      : 0;

  const handleReassign = () => {
    if (selectedTicket && targetStation) {
      reassignTicket(selectedTicket, targetStation);
      setShowReassignModal(false);
      setSelectedTicket(null);
      setTargetStation('');
    }
  };

  const getStationTickets = (stationId: string) => {
    return tickets.filter(
      (t) =>
        t.stationId === stationId &&
        (t.status === 'waiting' ||
          t.status === 'calling' ||
          t.status === 'servicing')
    );
  };

  const availableStationsForReassign = stations.filter(
    (s) => s.status !== 'offline' && s.id !== selectedStation
  );

  const getLoadLevel = (load: number) => {
    if (load >= 80) return { label: '高负载', color: 'text-red-600' };
    if (load >= 50) return { label: '中负载', color: 'text-amber-600' };
    return { label: '低负载', color: 'text-green-600' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">工位调度</h2>
          <p className="text-sm text-slate-500 mt-1">
            智能负载均衡，优化工位分配
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-xl px-4 py-2.5 border border-slate-200">
            <span className="text-sm text-slate-500">平均负载：</span>
            <span className="font-semibold text-slate-800">{totalLoad}%</span>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
            <RefreshCw className="w-4 h-4" />
            刷新状态
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-amber-300" />
              <span className="text-sm font-medium text-teal-100">
                智能分配建议
              </span>
            </div>
            <p className="text-xl font-bold">
              建议分配到{' '}
              {stations.find((s) => s.id === balanceResult.stationId)?.name ||
                '未知工位'}
            </p>
            <p className="text-sm text-teal-100 mt-1">
              推荐理由：{balanceResult.reason}（综合评分 {balanceResult.score}）
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold">{waitingTickets.length}</p>
              <p className="text-xs text-teal-200">等待中</p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <p className="text-3xl font-bold">{servicingTickets.length}</p>
              <p className="text-xs text-teal-200">服务中</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stations.map((station) => {
          const stationTickets = getStationTickets(station.id);
          const loadLevel = getLoadLevel(station.currentLoad);
          const isSelected = selectedStation === station.id;

          return (
            <div
              key={station.id}
              onClick={() => setSelectedStation(isSelected ? null : station.id)}
              className={cn(
                'bg-white rounded-2xl p-5 border-2 cursor-pointer transition-all duration-200',
                isSelected
                  ? 'border-teal-500 shadow-lg shadow-teal-100'
                  : 'border-slate-100 hover:border-slate-200 hover:shadow-md'
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-800">
                    {station.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <UserCircle className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-500">
                      {station.technician}
                    </span>
                  </div>
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

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-500">负载情况</span>
                    <span className={cn('font-medium', loadLevel.color)}>
                      {loadLevel.label}
                    </span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        getLoadColor(station.currentLoad)
                      )}
                      style={{ width: `${station.currentLoad}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>{station.currentLoad}%</span>
                    <span>平均 {station.avgServiceTime}分钟/单</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                  <div className="text-center p-2 bg-slate-50 rounded-xl">
                    <p className="text-lg font-bold text-slate-800">
                      {stationTickets.length}
                    </p>
                    <p className="text-xs text-slate-400">待处理</p>
                  </div>
                  <div className="text-center p-2 bg-slate-50 rounded-xl">
                    <p className="text-lg font-bold text-slate-800">
                      {station.completedToday}
                    </p>
                    <p className="text-xs text-slate-400">今日完成</p>
                  </div>
                </div>
              </div>

              {isSelected && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                  <select
                    value={station.status}
                    onChange={(e) =>
                      updateStationStatus(
                        station.id,
                        e.target.value as StationStatus
                      )
                    }
                    className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                  >
                    <option value="idle">空闲</option>
                    <option value="busy">忙碌</option>
                    <option value="offline">离线</option>
                  </select>
                  <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                    <Settings className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">等待队列</h3>
              <span className="text-sm text-slate-400">
                共 {waitingTickets.length} 人
              </span>
            </div>
          </div>
          <div className="max-h-96 overflow-auto">
            {waitingTickets.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">暂无等待工单</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {waitingTickets.map((ticket) => {
                  const station = stations.find(
                    (s) => s.id === ticket.stationId
                  );
                  return (
                    <div
                      key={ticket.id}
                      className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center font-bold text-amber-700">
                        {String(ticket.ticketNumber).slice(-3)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 truncate">
                          {ticket.customerName}
                        </p>
                        <p className="text-sm text-slate-400 truncate">
                          {ticket.bikeModel}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-600">
                          {station?.name || '未分配'}
                        </p>
                        <p className="text-xs text-slate-400">
                          预计 {ticket.estimatedMinutes} 分钟
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTicket(ticket.id);
                          setSelectedStation(ticket.stationId || '');
                          setShowReassignModal(true);
                        }}
                        className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        title="跨窗口调剂"
                      >
                        <ArrowRightLeft className="w-5 h-5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">负载趋势</h3>
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-green-600">平稳</span>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stations.map((station) => (
                <div key={station.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{station.name}</span>
                    <span className="font-medium text-slate-800">
                      {station.currentLoad}%
                    </span>
                  </div>
                  <div className="h-8 bg-slate-50 rounded-lg overflow-hidden relative">
                    <div
                      className={cn(
                        'h-full rounded-lg transition-all duration-500',
                        getLoadColor(station.currentLoad)
                      )}
                      style={{ width: `${station.currentLoad}%` }}
                    />
                    <div className="absolute inset-0 flex items-end">
                      {[...Array(12)].map((_, i) => (
                        <div
                          key={i}
                          className="flex-1 border-r border-white/30 last:border-r-0"
                          style={{ height: `${20 + Math.random() * 60}%` }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>
                      <TrendingUp className="w-3 h-3 inline mr-1 text-green-500" />
                      今日+{station.completedToday}单
                    </span>
                    <span>
                      <Clock className="w-3 h-3 inline mr-1" />
                      平均{station.avgServiceTime}分钟
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showReassignModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="px-6 py-5 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">
                跨窗口调剂
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                将工单调剂到其他工位
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  目标工位
                </label>
                <div className="space-y-2">
                  {availableStationsForReassign.map((station) => (
                    <button
                      key={station.id}
                      onClick={() => setTargetStation(station.id)}
                      className={cn(
                        'w-full p-3 rounded-xl border-2 text-left transition-all',
                        targetStation === station.id
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-slate-200 hover:border-slate-300'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-800">
                            {station.name}
                          </p>
                          <p className="text-sm text-slate-400">
                            {station.technician}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-slate-700">
                            {station.currentLoad}% 负载
                          </p>
                          <p className="text-xs text-slate-400">
                            {getStationTickets(station.id).length} 人等待
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => {
                  setShowReassignModal(false);
                  setSelectedTicket(null);
                  setTargetStation('');
                }}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleReassign}
                disabled={!targetStation}
                className="flex-1 py-2.5 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-600/25"
              >
                确认调剂
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
