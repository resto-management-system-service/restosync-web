import { describe, expect, it } from 'vitest';
import { adjustmentFormSchema, toAdjustStockDto } from './adjustment';

describe('adjustment schema', () => {
  it('requires a reason', () => {
    expect(
      adjustmentFormSchema.safeParse({
        type: 'RESTOCK',
        quantity: 5,
        reason: ''
      }).success
    ).toBe(false);
  });

  it('rejects zero and negative quantities for non-corrections', () => {
    expect(
      adjustmentFormSchema.safeParse({
        type: 'WASTE',
        quantity: 0,
        reason: 'spoiled'
      }).success
    ).toBe(false);
    expect(
      adjustmentFormSchema.safeParse({
        type: 'WASTE',
        quantity: -2,
        reason: 'spoiled'
      }).success
    ).toBe(false);
  });

  it('allows a negative correction', () => {
    expect(
      adjustmentFormSchema.safeParse({
        type: 'CORRECTION',
        quantity: -2,
        reason: 'recount'
      }).success
    ).toBe(true);
  });

  it('maps type to the delta sign', () => {
    const base = { quantity: 3, reason: ' why ' };
    expect(toAdjustStockDto({ ...base, type: 'RESTOCK' })).toEqual({
      type: 'RESTOCK',
      quantityDelta: 3,
      reason: 'why'
    });
    expect(toAdjustStockDto({ ...base, type: 'SALE' }).quantityDelta).toBe(-3);
    expect(toAdjustStockDto({ ...base, type: 'WASTE' }).quantityDelta).toBe(-3);
    expect(toAdjustStockDto({ ...base, quantity: -3, type: 'CORRECTION' }).quantityDelta).toBe(-3);
  });
});
