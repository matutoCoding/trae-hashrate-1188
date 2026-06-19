import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

export function formatDateTime(date: Date): string {
  const d = new Date(date);
  return d.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(date: Date): string {
  const d = new Date(date);
  return d.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function formatDate(date: Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function getServiceTypeLabel(type: string): string {
  const map: Record<string, string> = {
    repair: '维修服务',
    maintenance: '保养服务',
    inspection: '检测服务',
    custom: '定制服务',
  };
  return map[type] || type;
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    waiting: '等待中',
    calling: '叫号中',
    servicing: '服务中',
    completed: '已完成',
    cancelled: '已取消',
    idle: '空闲',
    busy: '忙碌',
    offline: '离线',
  };
  return map[status] || status;
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    waiting: 'bg-amber-100 text-amber-700 border-amber-200',
    calling: 'bg-blue-100 text-blue-700 border-blue-200',
    servicing: 'bg-teal-100 text-teal-700 border-teal-200',
    completed: 'bg-green-100 text-green-700 border-green-200',
    cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
    idle: 'bg-green-100 text-green-700 border-green-200',
    busy: 'bg-amber-100 text-amber-700 border-amber-200',
    offline: 'bg-gray-200 text-gray-500 border-gray-300',
  };
  return map[status] || 'bg-gray-100 text-gray-600 border-gray-200';
}

export function calculateLoadPercentage(
  remaining: number,
  total: number
): number {
  if (total === 0) return 0;
  return Math.round((remaining / total) * 100);
}

export function getLoadColor(percentage: number): string {
  if (percentage >= 80) return 'bg-red-500';
  if (percentage >= 50) return 'bg-amber-500';
  return 'bg-green-500';
}

export function padNumber(num: number, length: number = 3): string {
  return num.toString().padStart(length, '0');
}
