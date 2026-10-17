import { describe, expect, it } from 'vitest';
import {
  O2_CANNISTER_REFILL,
  O2_DRAIN_PER_TICK,
  O2_LOW_THRESHOLD,
  O2_MAX,
  O2_SAFE_ROOM_CAP,
  O2_SAFE_ROOM_REGEN_PER_TICK,
  O2_STABLE_THRESHOLD,
} from '../constants';
import { getO2Alert, tickOxygen, useCannister } from '../oxygen';

describe('oxygen mechanics', () => {
  describe('tickOxygen', () => {
    it('should drain oxygen outside a safe room', () => {
      expect(tickOxygen(50, O2_MAX, false)).toBe(50 - O2_DRAIN_PER_TICK);
    });

    it('should never go below zero', () => {
      expect(tickOxygen(1, O2_MAX, false)).toBe(0);
    });

    it('should regenerate oxygen in a safe room below the cap', () => {
      expect(tickOxygen(20, O2_MAX, true)).toBe(
        20 + O2_SAFE_ROOM_REGEN_PER_TICK
      );
    });

    it('should regenerate up to the safe-room cap and no further', () => {
      const cap = O2_MAX * O2_SAFE_ROOM_CAP; // 50

      expect(tickOxygen(cap - 5, O2_MAX, true)).toBe(cap);
    });

    it('should not regenerate above the safe-room cap', () => {
      // above the cap: no regen, no drain - oxygen level is static
      const cap = O2_MAX * O2_SAFE_ROOM_CAP;
      const aboveCap = cap + 20;

      expect(tickOxygen(aboveCap, O2_MAX, true)).toBe(aboveCap);
    });

    it('should not change oxygen at exactly the cap', () => {
      const cap = O2_MAX * O2_SAFE_ROOM_CAP;

      expect(tickOxygen(cap, O2_MAX, true)).toBe(cap);
    });

    it('should scale the cap down with a reduced oxygenMax after a catch', () => {
      const reducedMax = 75; // 10 and 15 penalty applied
      const cap = reducedMax * O2_SAFE_ROOM_CAP; // capped at 37.5 (75*0.5 = 37.5)

      expect(tickOxygen(cap - 5, reducedMax, true)).toBe(cap);
    });

    it('should scale the cap back up when soda restores oxygenMax', () => {
      const oxygen = 40;

      // one penalty active: max at 90, regen cap at 45
      expect(tickOxygen(oxygen, 90, true)).toBe(45);
      // soda removed penalty, max back at 100, regen cap at 50
      expect(tickOxygen(oxygen, 100, true)).toBe(50);
    });
  });

  describe('useCannister', () => {
    it('should add the canister refill amount', () => {
      expect(useCannister(40, O2_MAX)).toBe(40 + O2_CANNISTER_REFILL);
    });

    it('should be able to exceed the safe-room cap', () => {
      // cannisters are not limited by the safe-room cap
      const cap = O2_MAX * O2_SAFE_ROOM_CAP;

      expect(useCannister(30, O2_MAX)).toBeGreaterThan(cap);
    });

    it('should be clamped by oxygenMax, not by the safe-room cap', () => {
      expect(useCannister(80, 90)).toBe(90);
    });
  });

  describe('getO2Alert', () => {
    it('should be stable at exactly 40% of a full bar', () => {
      expect(getO2Alert(O2_MAX * O2_STABLE_THRESHOLD, O2_MAX)).toBe('stable');
    });

    it('should be critical below the low threshold', () => {
      const critical = O2_MAX * O2_LOW_THRESHOLD - 5; // 15

      expect(getO2Alert(critical, O2_MAX)).toBe('critical');
    });

    it('should scale with a reduced oxygenMax after a catch', () => {
      // 40 on a max of 75 is still >40% so it's still stable
      expect(getO2Alert(40, 75)).toBe('stable'); // 40/75 > 0.4
    });

    it('should return low between the two thresholds', () => {
      expect(getO2Alert(38, 100)).toBe('low');
    });
  });
});
