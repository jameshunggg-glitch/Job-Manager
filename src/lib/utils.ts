import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const STATUS_LABELS: Record<string, string> = {
  saved: '已收藏',
  applied: '已投遞',
  interviewing: '面試中',
  offer: '已錄取',
  rejected: '已拒絕',
  closed: '職缺關閉',
};

export const STATUS_COLORS: Record<string, string> = {
  saved: 'bg-blue-100 text-blue-700',
  applied: 'bg-yellow-100 text-yellow-700',
  interviewing: 'bg-purple-100 text-purple-700',
  offer: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  closed: 'bg-gray-100 text-gray-700',
};
