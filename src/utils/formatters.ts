// Formatting utilities for Nigerian Naira (₦), dates, and numbers

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('NGN', '₦');
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export const getDaysRemaining = (dueDateString: string): { days: number; isOverdue: boolean } => {
  if (!dueDateString) return { days: 0, isOverdue: false };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDateString);
  due.setHours(0, 0, 0, 0);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return {
    days: Math.abs(diffDays),
    isOverdue: diffDays < 0,
  };
};

export const calculateMargin = (cost: number, selling: number): number => {
  if (selling <= 0) return 0;
  return Math.round(((selling - cost) / selling) * 100);
};
