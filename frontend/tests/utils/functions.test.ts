import {
  formatDateOnly,
  normalizeDateOnly,
  toDateOnlyApiValue,
  toDateOnlyRangeEnd,
  toDateOnlyRangeStart,
} from '@/utils/functions';

describe('date-only helpers', () => {
  it('normalizes input and serializes date-only payloads at noon UTC', () => {
    expect(normalizeDateOnly('2026-05-19T00:00:00.000Z')).toBe('2026-05-19');
    expect(toDateOnlyApiValue('2026-05-19')).toBe('2026-05-19T12:00:00.000Z');
  });

  it('builds inclusive date ranges for filters', () => {
    expect(toDateOnlyRangeStart('2026-05-19')).toBe('2026-05-19T00:00:00.000Z');
    expect(toDateOnlyRangeEnd('2026-05-19')).toBe('2026-05-19T23:59:59.999Z');
  });

  it('formats date-only values without shifting the calendar day', () => {
    expect(formatDateOnly('2026-05-19T12:00:00.000Z', 'en-CA')).toBe('2026-05-19');
  });
});