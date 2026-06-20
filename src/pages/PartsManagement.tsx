import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Search,
  Plus,
  Filter,
  ChevronDown,
  MapPin,
  Calendar,
  Building2,
  AlertTriangle,
  TrendingDown,
  Eye,
} from 'lucide-react';
import { usePartStore } from '@/stores/partStore';
import { useOutboundStore } from '@/stores/outboundStore';
import { useUIStore } from '@/stores/uiStore';
import {
  formatDate,
  calculateLoadPercentage,
  getLoadColor,
  cn,
} from '@/utils';

export default function PartsManagement() {
  const navigate = useNavigate();
  const {
    batches,
    getCategories,
    searchBatches,
    getLowStockBatches,
  } = usePartStore();
  const { getTotalOutboundQuantity, getRecordsByBatch } = useOutboundStore();
  const { setPreselectedBatchId } = useUIStore();

  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const categories = getCategories();

  const filteredBatches = () => {
    let result = batches;

    if (searchKeyword) {
      result = searchBatches(searchKeyword);
    }

    if (selectedCategory !== 'all') {
      result = result.filter((b) => b.category === selectedCategory);
    }

    if (showLowStockOnly) {
      result = getLowStockBatches(30);
    }

    return result;
  };

  const displayedBatches = filteredBatches();
  const lowStockCount = getLowStockBatches(30).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">配件管理</h2>
          <p className="text-sm text-slate-500 mt-1">
            批次管理与库存追踪
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-teal-600/25">
          <Plus className="w-5 h-5" />
          新增批次
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {batches.length}
              </p>
              <p className="text-xs text-slate-400">总批次数</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {lowStockCount}
              </p>
              <p className="text-xs text-slate-400">低库存预警</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {getTotalOutboundQuantity()}
              </p>
              <p className="text-xs text-slate-400">累计出库</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Filter className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {categories.length}
              </p>
              <p className="text-xs text-slate-400">配件分类</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索配件名称、编码、批次号..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                分类筛选
                <ChevronDown className="w-4 h-4" />
              </button>
              {showFilterDropdown && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-slate-200 shadow-lg z-10 py-1">
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setShowFilterDropdown(false);
                    }}
                    className={cn(
                      'w-full px-4 py-2 text-left text-sm hover:bg-slate-50',
                      selectedCategory === 'all'
                        ? 'text-teal-600 font-medium'
                        : 'text-slate-600'
                    )}
                  >
                    全部分类
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setShowFilterDropdown(false);
                      }}
                      className={cn(
                        'w-full px-4 py-2 text-left text-sm hover:bg-slate-50',
                        selectedCategory === cat
                          ? 'text-teal-600 font-medium'
                          : 'text-slate-600'
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowLowStockOnly(!showLowStockOnly)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors',
                showLowStockOnly
                  ? 'bg-amber-100 text-amber-700'
                  : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
              )}
            >
              <AlertTriangle className="w-4 h-4" />
              仅看预警
            </button>
          </div>
        </div>

        {displayedBatches.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">暂无配件批次</p>
            <p className="text-sm mt-1">点击「新增批次」添加配件</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    配件信息
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    批次号
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    库存情况
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    供应商
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    库位
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedBatches.map((batch) => {
                  const percentage = calculateLoadPercentage(
                    batch.remainingQuantity,
                    batch.totalQuantity
                  );
                  const isLowStock = percentage <= 30;
                  const outboundCount = getRecordsByBatch(batch.id).length;

                  return (
                    <tr
                      key={batch.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'w-10 h-10 rounded-xl flex items-center justify-center',
                              isLowStock
                                ? 'bg-amber-100'
                                : 'bg-teal-100'
                            )}
                          >
                            <Package
                              className={cn(
                                'w-5 h-5',
                                isLowStock
                                  ? 'text-amber-600'
                                  : 'text-teal-600'
                              )}
                            />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">
                              {batch.partName}
                            </p>
                            <p className="text-sm text-slate-400">
                              {batch.partCode} · {batch.category}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600 font-mono">
                          {batch.batchNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-medium text-slate-700">
                              {batch.remainingQuantity}
                              <span className="text-slate-400 font-normal">
                                {' '}
                                / {batch.totalQuantity} {batch.unit}
                              </span>
                            </span>
                            {isLowStock && (
                              <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                预警
                              </span>
                            )}
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all duration-500',
                                getLoadColor(percentage)
                              )}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            已出库 {outboundCount} 次
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Building2 className="w-4 h-4 text-slate-400" />
                          {batch.supplier}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          {batch.location}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedBatch(batch.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          详情
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedBatch && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-hidden">
            {(() => {
              const batch = batches.find((b) => b.id === selectedBatch);
              if (!batch) return null;
              const percentage = calculateLoadPercentage(
                batch.remainingQuantity,
                batch.totalQuantity
              );
              const records = getRecordsByBatch(batch.id);
              const isLowStock = percentage <= 30;

              return (
                <>
                  <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">
                        {batch.partName}
                      </h3>
                      <p className="text-sm text-slate-400">
                        {batch.batchNumber}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedBatch(null)}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="p-6 overflow-auto max-h-[60vh]">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">总数量</p>
                        <p className="text-xl font-bold text-slate-800">
                          {batch.totalQuantity} {batch.unit}
                        </p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">剩余数量</p>
                        <p
                          className={cn(
                            'text-xl font-bold',
                            isLowStock ? 'text-amber-600' : 'text-slate-800'
                          )}
                        >
                          {batch.remainingQuantity} {batch.unit}
                        </p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">单价</p>
                        <p className="text-xl font-bold text-slate-800">
                          ¥{batch.pricePerUnit}
                        </p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">入库日期</p>
                        <p className="text-xl font-bold text-slate-800">
                          {formatDate(batch.receivedDate)}
                        </p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">
                          库存进度
                        </span>
                        <span className="text-sm text-slate-500">
                          {percentage}%
                        </span>
                      </div>
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-500',
                            getLoadColor(percentage)
                          )}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-500">供应商：</span>
                        <span className="text-slate-700">{batch.supplier}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-500">存放位置：</span>
                        <span className="text-slate-700">{batch.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-500">分类：</span>
                        <span className="text-slate-700">{batch.category}</span>
                      </div>
                    </div>

                    {records.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-slate-100">
                        <h4 className="font-medium text-slate-800 mb-3">
                          出库记录（{records.length} 条）
                        </h4>
                        <div className="space-y-2">
                          {records.slice(0, 5).map((record) => (
                            <div
                              key={record.id}
                              className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                            >
                              <div>
                                <p className="text-sm font-medium text-slate-700">
                                  {record.destination}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {record.operator} ·{' '}
                                  {formatDate(record.outboundDate)}
                                </p>
                              </div>
                              <span className="text-sm font-semibold text-red-500">
                                -{record.quantity}
                                {batch.unit}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
                    <button
                      onClick={() => setSelectedBatch(null)}
                      className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                    >
                      关闭
                    </button>
                    <button
                      onClick={() => {
                        if (selectedBatch) {
                          setPreselectedBatchId(selectedBatch);
                          setSelectedBatch(null);
                          navigate('/outbound');
                        }
                      }}
                      className="flex-1 py-2.5 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/25"
                    >
                      拆分出库
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
