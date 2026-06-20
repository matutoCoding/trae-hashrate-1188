import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  ChevronDown,
  TrendingDown,
  Package,
  User,
  MapPin,
  Calendar,
  ArrowRight,
  PieChart,
  List,
  ArrowLeft,
} from 'lucide-react';
import { useOutboundStore } from '@/stores/outboundStore';
import { usePartStore } from '@/stores/partStore';
import { useStationStore } from '@/stores/stationStore';
import { useUIStore } from '@/stores/uiStore';
import {
  formatDateTime,
  cn,
} from '@/utils';
import type { OutboundRecord } from '@/types';

export default function OutboundRecords() {
  const navigate = useNavigate();
  const {
    records,
    addRecord,
    getDestinationDistribution,
    getTotalOutboundQuantity,
    getTodayOutboundCount,
  } = useOutboundStore();
  const { batches, getBatchById } = usePartStore();
  const { stations } = useStationStore();
  const { preselectedBatchId, clearPreselectedBatchId } = useUIStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterBatch, setFilterBatch] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'list' | 'distribution'>('list');
  const [returnToBatchId, setReturnToBatchId] = useState<string | null>(null);
  const [showBatchDropdown, setShowBatchDropdown] = useState(false);

  const [formData, setFormData] = useState({
    batchId: '',
    quantity: 1,
    destination: '',
    operator: '',
    remark: '',
    stationId: '',
  });

  useEffect(() => {
    if (preselectedBatchId) {
      setFormData((prev) => ({ ...prev, batchId: preselectedBatchId }));
      setReturnToBatchId(preselectedBatchId);
      setShowAddModal(true);
      clearPreselectedBatchId();
    }
  }, [preselectedBatchId, clearPreselectedBatchId]);

  const filteredRecords = () => {
    let result = records;

    if (searchKeyword) {
      result = result.filter((r) => {
        const batch = getBatchById(r.batchId);
        return (
          r.destination.includes(searchKeyword) ||
          r.operator.includes(searchKeyword) ||
          batch?.partName.includes(searchKeyword) ||
          batch?.batchNumber.includes(searchKeyword)
        );
      });
    }

    if (filterBatch !== 'all') {
      result = result.filter((r) => r.batchId === filterBatch);
    }

    return result;
  };

  const displayedRecords = filteredRecords();
  const distribution = getDestinationDistribution();

  const handleAddRecord = () => {
    if (!formData.batchId || !formData.quantity || !formData.destination) return;

    const result = addRecord({
      ...formData,
      stationId: formData.stationId || undefined,
    });

    if (result) {
      setShowAddModal(false);

      if (returnToBatchId) {
        setReturnToBatchId(null);
      }

      setFormData({
        batchId: '',
        quantity: 1,
        destination: '',
        operator: '',
        remark: '',
        stationId: '',
      });
    }
  };

  const selectedBatch = getBatchById(formData.batchId);
  const maxQuantity = selectedBatch?.remainingQuantity || 0;

  const totalOutbound = getTotalOutboundQuantity();
  const todayCount = getTodayOutboundCount();

  const colors = [
    'bg-teal-500',
    'bg-blue-500',
    'bg-amber-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-green-500',
    'bg-red-500',
    'bg-cyan-500',
  ];

  return (
    <div className="space-y-6">
      {returnToBatchId && (
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
              <Package className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-teal-800">
                正在从批次详情出库
              </p>
              <p className="text-xs text-teal-600">
                {getBatchById(returnToBatchId)?.partName} (
                {getBatchById(returnToBatchId)?.batchNumber})
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setReturnToBatchId(null);
              navigate('/parts');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-teal-700 hover:bg-teal-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回批次详情
          </button>
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">出库记录</h2>
          <p className="text-sm text-slate-500 mt-1">
            批次拆分与去向追踪
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-teal-600/25"
        >
          <Plus className="w-5 h-5" />
          拆分出库
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {records.length}
              </p>
              <p className="text-xs text-slate-400">出库记录</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{batches.length}</p>
              <p className="text-xs text-slate-400">涉及批次</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{totalOutbound}</p>
              <p className="text-xs text-slate-400">累计出库量</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{todayCount}</p>
              <p className="text-xs text-slate-400">今日出库</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('list')}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  activeTab === 'list'
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-slate-500 hover:bg-slate-50'
                )}
              >
                <List className="w-4 h-4" />
                出库明细
              </button>
              <button
                onClick={() => setActiveTab('distribution')}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  activeTab === 'distribution'
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-slate-500 hover:bg-slate-50'
                )}
              >
                <PieChart className="w-4 h-4" />
                去向分布
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="搜索..."
                  className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 w-48"
                />
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowBatchDropdown(!showBatchDropdown)}
                  className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  批次筛选
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showBatchDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-lg z-10 py-1 max-h-64 overflow-auto">
                    <button
                      onClick={() => {
                        setFilterBatch('all');
                        setShowBatchDropdown(false);
                      }}
                      className={cn(
                        'w-full px-4 py-2 text-left text-sm hover:bg-slate-50',
                        filterBatch === 'all'
                          ? 'text-teal-600 font-medium'
                          : 'text-slate-600'
                      )}
                    >
                      全部批次
                    </button>
                    {batches.map((batch) => (
                      <button
                        key={batch.id}
                        onClick={() => {
                          setFilterBatch(batch.id);
                          setShowBatchDropdown(false);
                        }}
                        className={cn(
                          'w-full px-4 py-2 text-left text-sm hover:bg-slate-50',
                          filterBatch === batch.id
                            ? 'text-teal-600 font-medium'
                            : 'text-slate-600'
                        )}
                      >
                        <p className="truncate">{batch.partName}</p>
                        <p className="text-xs text-slate-400 font-mono">
                          {batch.batchNumber}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {activeTab === 'list' ? (
          <>
            {displayedRecords.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <ClipboardList className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">暂无出库记录</p>
                <p className="text-sm mt-1">点击「拆分出库」添加记录</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {displayedRecords.map((record) => {
                  const batch = getBatchById(record.batchId);
                  return (
                    <div
                      key={record.id}
                      className="px-6 py-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center flex-shrink-0">
                          <Package className="w-6 h-6 text-teal-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-slate-800 truncate">
                              {batch?.partName || '未知配件'}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">
                              {batch?.batchNumber || ''}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {record.destination}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5" />
                              {record.operator}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDateTime(record.outboundDate)}
                            </span>
                          </div>
                          {record.remark && (
                            <p className="text-xs text-slate-400 mt-1">
                              备注：{record.remark}
                            </p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xl font-bold text-red-500">
                            -{record.quantity}
                          </p>
                          <p className="text-sm text-slate-400">
                            {batch?.unit || ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="flex items-center justify-center py-8">
                <div className="relative w-64 h-64">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    {(() => {
                      let cumulativePercent = 0;
                      return distribution.map((item, index) => {
                        const startPercent = cumulativePercent;
                        cumulativePercent += item.percentage;
                        const strokeColor = [
                          '#14b8a6',
                          '#3b82f6',
                          '#f59e0b',
                          '#a855f7',
                          '#ec4899',
                          '#22c55e',
                          '#ef4444',
                          '#06b6d4',
                        ][index % 8];

                        return (
                          <circle
                            key={item.destination}
                            cx="18"
                            cy="18"
                            r="15.9155"
                            fill="transparent"
                            stroke={strokeColor}
                            strokeWidth="3.8"
                            strokeDasharray={`${item.percentage} ${100 - item.percentage}`}
                            strokeDashoffset={-startPercent}
                          />
                        );
                      });
                    })()}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-3xl font-bold text-slate-800">
                      {totalOutbound}
                    </p>
                    <p className="text-sm text-slate-400">累计出库</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-slate-800 mb-4">去向分布明细</h4>
                {distribution.map((item, index) => (
                  <div
                    key={item.destination}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl"
                  >
                    <div
                      className={cn(
                        'w-3 h-3 rounded-full flex-shrink-0',
                        colors[index % colors.length]
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">
                        {item.destination}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full',
                              colors[index % colors.length]
                            )}
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500 w-10 text-right">
                          {item.percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-slate-800">
                        {item.quantity}
                      </p>
                      <p className="text-xs text-slate-400">单位数量</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="px-6 py-5 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">
                拆分出库
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                从批次中拆分配件出库
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  选择批次 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.batchId}
                  onChange={(e) =>
                    setFormData({ ...formData, batchId: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all bg-white"
                >
                  <option value="">请选择配件批次</option>
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.partName}（剩余 {batch.remainingQuantity}
                      {batch.unit}）
                    </option>
                  ))}
                </select>
              </div>

              {selectedBatch && (
                <div className="p-3 bg-teal-50 rounded-xl">
                  <p className="text-sm text-teal-700">
                    当前库存：
                    <span className="font-semibold">
                      {selectedBatch.remainingQuantity} {selectedBatch.unit}
                    </span>
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  出库数量 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: Math.min(
                        maxQuantity,
                        Math.max(1, Number(e.target.value))
                      ),
                    })
                  }
                  min={1}
                  max={maxQuantity}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
                {selectedBatch && (
                  <div className="flex gap-2 mt-2">
                    {[1, 5, 10].map((num) => (
                      <button
                        key={num}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            quantity: Math.min(num, maxQuantity),
                          })
                        }
                        className="px-3 py-1 text-xs bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                      >
                        {num}{selectedBatch.unit}
                      </button>
                    ))}
                    <button
                      onClick={() =>
                        setFormData({ ...formData, quantity: maxQuantity })
                      }
                      className="px-3 py-1 text-xs bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      全部
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  去向/目的工位 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.destination}
                  onChange={(e) => {
                    const dest = e.target.value;
                    const station = stations.find((s) => s.name === dest);
                    setFormData({
                      ...formData,
                      destination: dest,
                      stationId: station?.id || '',
                    });
                  }}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all bg-white"
                >
                  <option value="">请选择去向</option>
                  {stations.map((station) => (
                    <option key={station.id} value={station.name}>
                      {station.name}（{station.technician}）
                    </option>
                  ))}
                  <option value="维修车间">维修车间</option>
                  <option value="前台领用">前台领用</option>
                  <option value="其他">其他</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  经办人 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.operator}
                  onChange={(e) =>
                    setFormData({ ...formData, operator: e.target.value })
                  }
                  placeholder="请输入经办人姓名"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  备注
                </label>
                <textarea
                  value={formData.remark}
                  onChange={(e) =>
                    setFormData({ ...formData, remark: e.target.value })
                  }
                  placeholder="可选：添加备注信息"
                  rows={2}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
              {returnToBatchId ? (
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setReturnToBatchId(null);
                    setFormData({
                      batchId: '',
                      quantity: 1,
                      destination: '',
                      operator: '',
                      remark: '',
                      stationId: '',
                    });
                    navigate('/parts');
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  返回详情
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({
                      batchId: '',
                      quantity: 1,
                      destination: '',
                      operator: '',
                      remark: '',
                      stationId: '',
                    });
                  }}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                >
                  取消
                </button>
              )}
              <button
                onClick={() => {
                  handleAddRecord();
                  if (preselectedBatchId || returnToBatchId) {
                    navigate('/parts');
                  }
                }}
                disabled={
                  !formData.batchId ||
                  !formData.quantity ||
                  !formData.destination ||
                  !formData.operator ||
                  formData.quantity > maxQuantity
                }
                className="flex-1 py-2.5 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-600/25"
              >
                {returnToBatchId ? '出库并返回详情' : '确认出库'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
