// ============================================================
// Reports Service — Data Access Layer using the Generated API Client
// ============================================================
import {
  reportsControllerGetBestSellingProducts,
  reportsControllerGetDailySummary,
  reportsControllerGetPaymentMethodBreakdown
} from '@/api-client';
import type { BestSellingProduct, DailySummary, PaymentBreakdown, ReportKind } from './types';

export const BEST_SELLING_LIMIT = 10;

export async function getDailySummary(date: string): Promise<DailySummary> {
  const { data, error } = await reportsControllerGetDailySummary({ query: { date } });
  if (error) throw new Error(`Failed to fetch daily summary: ${JSON.stringify(error)}`);
  return data as DailySummary;
}

export async function getBestSellingProducts(date: string): Promise<BestSellingProduct[]> {
  const { data, error } = await reportsControllerGetBestSellingProducts({
    query: { date, limit: BEST_SELLING_LIMIT }
  });
  if (error) throw new Error(`Failed to fetch best-selling products: ${JSON.stringify(error)}`);
  return Array.isArray(data) ? (data as BestSellingProduct[]) : [];
}

export async function getPaymentBreakdown(date: string): Promise<PaymentBreakdown> {
  const { data, error } = await reportsControllerGetPaymentMethodBreakdown({ query: { date } });
  if (error) throw new Error(`Failed to fetch payment breakdown: ${JSON.stringify(error)}`);
  return (data ?? {}) as PaymentBreakdown;
}

/**
 * Ask the backend for a report as CSV (`format=csv`). The client parses
 * `text/csv` responses as text.
 */
export async function getReportCsv(
  kind: ReportKind,
  date: string
): Promise<{ filename: string; content: string }> {
  const query = { date, format: 'csv' as const };
  const { data, error } =
    kind === 'daily-summary'
      ? await reportsControllerGetDailySummary({ query })
      : kind === 'best-selling'
        ? await reportsControllerGetBestSellingProducts({
            query: { ...query, limit: BEST_SELLING_LIMIT }
          })
        : await reportsControllerGetPaymentMethodBreakdown({ query });

  if (error || typeof data !== 'string') {
    throw new Error(`Failed to export ${kind} report`);
  }
  return { filename: `${kind}-${date}.csv`, content: data };
}
