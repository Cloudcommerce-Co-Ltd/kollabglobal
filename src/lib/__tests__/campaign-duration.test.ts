import { describe, it, expect } from 'vitest';
import { computeDurationDisplay } from '@/lib/campaign-duration';

const NOW = new Date('2026-04-15T12:00:00Z');

describe('computeDurationDisplay', () => {
  describe('awaiting_payment and brief — static duration', () => {
    it('returns static duration for awaiting_payment', () => {
      const result = computeDurationDisplay({
        displayStatus: 'awaiting_payment',
        duration: 30,
        deadline: '2026-04-20',
        liveAt: null,
        now: NOW,
      });
      expect(result).toEqual({ text: '30 วัน', isOverdue: false });
    });

    it('returns static duration for brief', () => {
      const result = computeDurationDisplay({
        displayStatus: 'brief',
        duration: 14,
        deadline: null,
        liveAt: null,
        now: NOW,
      });
      expect(result).toEqual({ text: '14 วัน', isOverdue: false });
    });

    it('returns static duration for cancelled', () => {
      const result = computeDurationDisplay({
        displayStatus: 'cancelled',
        duration: 30,
        deadline: null,
        liveAt: null,
        now: NOW,
      });
      expect(result).toEqual({ text: '30 วัน', isOverdue: false });
    });
  });

  describe('accepting / ship / active — countdown to deadline', () => {
    it("shows 'เหลือ N วัน' when more than 10 days remain", () => {
      // NOW = 2026-04-15, deadline = 2026-04-20 → 5 days → อีก
      // Use a deadline far enough: 2026-05-10 → 25 days
      const result = computeDurationDisplay({
        displayStatus: 'accepting',
        duration: 30,
        deadline: '2026-05-10',
        liveAt: null,
        now: NOW,
      });
      expect(result.isOverdue).toBe(false);
      expect(result.text).toMatch(/^เหลือ \d+ วัน$/);
    });

    it("shows 'อีก N วัน' when 10 or fewer days remain", () => {
      const result = computeDurationDisplay({
        displayStatus: 'accepting',
        duration: 30,
        deadline: '2026-04-20',
        liveAt: null,
        now: NOW,
      });
      expect(result.isOverdue).toBe(false);
      expect(result.text).toMatch(/^อีก \d+ วัน$/);
    });

    it("shows 'อีก 1 วัน' when deadline is today (end-of-day still future)", () => {
      // NOW is 12:00 UTC, deadline end-of-day T23:59:59 is still ~12h in the future → ceil = 1
      const result = computeDurationDisplay({
        displayStatus: 'ship',
        duration: 30,
        deadline: '2026-04-15',
        liveAt: null,
        now: NOW,
      });
      expect(result.isOverdue).toBe(false);
      expect(result.text).toBe('อีก 1 วัน');
    });

    it("shows 'เกิน N วัน' when deadline has passed", () => {
      const result = computeDurationDisplay({
        displayStatus: 'active',
        duration: 30,
        deadline: '2026-04-10',
        liveAt: null,
        now: NOW,
      });
      expect(result.isOverdue).toBe(true);
      expect(result.text).toMatch(/^เกิน \d+ วัน$/);
    });

    it('falls back to static duration when deadline is null', () => {
      const result = computeDurationDisplay({
        displayStatus: 'accepting',
        duration: 30,
        deadline: null,
        liveAt: null,
        now: NOW,
      });
      expect(result).toEqual({ text: '30 วัน', isOverdue: false });
    });
  });

  describe('live — campaign duration', () => {
    it('shows static duration when live', () => {
      const result = computeDurationDisplay({
        displayStatus: 'live',
        duration: 40,
        deadline: null,
        liveAt: '2026-04-05T00:00:00Z',
        now: NOW,
      });
      expect(result).toEqual({ text: '40 วัน', isOverdue: false });
    });

    it('shows static duration when live and liveAt is null', () => {
      const result = computeDurationDisplay({
        displayStatus: 'live',
        duration: 30,
        deadline: null,
        liveAt: null,
        now: NOW,
      });
      expect(result).toEqual({ text: '30 วัน', isOverdue: false });
    });
  });
});
