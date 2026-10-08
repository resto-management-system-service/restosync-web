import { queryOptions } from '@tanstack/react-query';
import { getBestSellingProducts, getDailySummary, getPaymentBreakdown } from './service';

export const reportKeys = {
  all: ['reports'] as const,
  dailySummary: (date: string) => [...reportKeys.all, 'daily-summary', date] as const,
  bestSelling: (date: string) => [...reportKeys.all, 'best-selling', date] as const,
  payments: (date: string) => [...reportKeys.all, 'payment-methods', date] as const
};

export const dailySummaryQueryOptions = (date: string) =>
  queryOptions({
    queryKey: reportKeys.dailySummary(date),
    queryFn: () => getDailySummary(date)
  });

export const bestSellingQueryOptions = (date: string) =>
  queryOptions({
    queryKey: reportKeys.bestSelling(date),
    queryFn: () => getBestSellingProducts(date)
  });

export const paymentBreakdownQueryOptions = (date: string) =>
  queryOptions({
    queryKey: reportKeys.payments(date),
    queryFn: () => getPaymentBreakdown(date)
  });
