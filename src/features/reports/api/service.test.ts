import { beforeEach, describe, expect, it, vi } from 'vitest';

const api = vi.hoisted(() => ({
  reportsControllerGetDailySummary: vi.fn(),
  reportsControllerGetBestSellingProducts: vi.fn(),
  reportsControllerGetPaymentMethodBreakdown: vi.fn()
}));

vi.mock('@/api-client', () => api);

import {
  getBestSellingProducts,
  getDailySummary,
  getPaymentBreakdown,
  getReportCsv
} from './service';

beforeEach(() => vi.resetAllMocks());

describe('JSON reports', () => {
  it('fetches the daily summary for a date', async () => {
    const summary = { totalSalesCents: 5000, ticketCount: 2, averageTicketCents: 2500 };
    api.reportsControllerGetDailySummary.mockResolvedValue({ data: summary });

    await expect(getDailySummary('2026-10-08')).resolves.toEqual(summary);
    expect(api.reportsControllerGetDailySummary).toHaveBeenCalledWith({
      query: { date: '2026-10-08' }
    });
  });

  it('fetches best-selling products with a limit', async () => {
    const rows = [{ menuItemId: 'm1', name: 'Taco', quantitySold: 3, revenueCents: 900 }];
    api.reportsControllerGetBestSellingProducts.mockResolvedValue({ data: rows });

    await expect(getBestSellingProducts('2026-10-08')).resolves.toEqual(rows);
    expect(api.reportsControllerGetBestSellingProducts).toHaveBeenCalledWith({
      query: { date: '2026-10-08', limit: 10 }
    });
  });

  it('returns an empty list when best-selling is not an array', async () => {
    api.reportsControllerGetBestSellingProducts.mockResolvedValue({ data: null });
    await expect(getBestSellingProducts('2026-10-08')).resolves.toEqual([]);
  });

  it('fetches the payment breakdown', async () => {
    api.reportsControllerGetPaymentMethodBreakdown.mockResolvedValue({
      data: { CASH: 1000, CARD: 4000 }
    });
    await expect(getPaymentBreakdown('2026-10-08')).resolves.toEqual({ CASH: 1000, CARD: 4000 });
  });

  it('throws when the API returns an error', async () => {
    api.reportsControllerGetDailySummary.mockResolvedValue({ error: { message: 'boom' } });
    await expect(getDailySummary('2026-10-08')).rejects.toThrow(/daily summary/);
  });
});

describe('getReportCsv', () => {
  it.each([
    ['daily-summary', 'reportsControllerGetDailySummary'],
    ['best-selling', 'reportsControllerGetBestSellingProducts'],
    ['payment-methods', 'reportsControllerGetPaymentMethodBreakdown']
  ] as const)('requests %s as csv', async (kind, fn) => {
    api[fn].mockResolvedValue({ data: 'a,b\n1,2' });

    await expect(getReportCsv(kind, '2026-10-08')).resolves.toEqual({
      filename: `${kind}-2026-10-08.csv`,
      content: 'a,b\n1,2'
    });
    expect(api[fn]).toHaveBeenCalledWith({
      query: expect.objectContaining({ date: '2026-10-08', format: 'csv' })
    });
  });

  it('throws when the body is not text', async () => {
    api.reportsControllerGetDailySummary.mockResolvedValue({ data: { totalSalesCents: 1 } });
    await expect(getReportCsv('daily-summary', '2026-10-08')).rejects.toThrow(/export/);
  });
});
