// ============================================================
// Types for the Reports Feature
// ============================================================
// The OpenAPI responses for /reports/* are typed `unknown`; these mirror the
// restosync-api `ReportsService` return values.

export interface DailySummary {
  totalSalesCents: number;
  ticketCount: number;
  averageTicketCents: number;
}

export interface BestSellingProduct {
  menuItemId: string;
  name: string;
  quantitySold: number;
  revenueCents: number;
}

/** Payment method (e.g. `CASH`, `CARD`) → amount in cents. Zero-amount methods are omitted. */
export type PaymentBreakdown = Record<string, number>;

export type ReportKind = 'daily-summary' | 'best-selling' | 'payment-methods';
