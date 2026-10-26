import { describe, expect, it } from 'vitest';
import {
  STRESS_MAX,
  STRESS_O2_CRITICAL_PENALTY,
  STRESS_O2_LOW_PENALTY,
  STRESS_PROXIMITY_MAX_PENALTY,
  STRESS_PROXIMITY_RADIUS,
} from '../constants';
import {
  tickStress,
  getStressSpeedMultiplier,
  getStressNoiseMultiplier,
} from '../stress';

describe('Stress Mechanics', () => {
  describe('tickStress', () => {
    it('should decay by 1 if the player is safe (full O2, no monster)', () => {
      // 50 stress, full O2, monster far away
      expect(tickStress(50, 100, 100, 999)).toBe(49);
    });

    it('should not decay below 0', () => {
      expect(tickStress(0, 100, 100, 999)).toBe(0);
    });

    it('should add stress if O2 is below 40%', () => {
      // 30 O2 (below 40%), no monster. 50 + 2 = 52
      expect(tickStress(50, 30, 100, 999)).toBe(50 + STRESS_O2_LOW_PENALTY);
    });

    it('should add more stress if O2 is below 20%', () => {
      // 10 O2 (below 20%), no monster. 50 + 5 = 55
      expect(tickStress(50, 10, 100, 999)).toBe(
        50 + STRESS_O2_CRITICAL_PENALTY
      );
    });

    it('should scale O2 thresholds with a reduced oxygenMax', () => {
      // max is 75. 25 O2 is below 40% (30). Should add +2.
      expect(tickStress(50, 25, 75, 999)).toBe(50 + STRESS_O2_LOW_PENALTY);
    });

    it('should add maximum proximity stress if monster is at distance 0', () => {
      // full O2, monster distance 0
      expect(tickStress(50, 100, 100, 0)).toBe(
        50 + STRESS_PROXIMITY_MAX_PENALTY
      );
    });

    it('should add partial proximity stress if monster is near', () => {
      // distance is half the radius, so penalty is roughly half of max (2 or 3)
      const halfRadius = STRESS_PROXIMITY_RADIUS / 2;
      const result = tickStress(50, 100, 100, halfRadius);
      expect(result).toBeGreaterThan(50);
      expect(result).toBeLessThan(50 + STRESS_PROXIMITY_MAX_PENALTY);
    });

    it('should not add proximity stress if monster is outside the radius', () => {
      // distance is radius + 1. Should decay by 1.
      expect(tickStress(50, 100, 100, STRESS_PROXIMITY_RADIUS + 1)).toBe(49);
    });

    it('should combine O2 and proximity stress', () => {
      // critical O2 (+5) and distance 0 (+5). 50 + 10 = 60.
      expect(tickStress(50, 10, 100, 0)).toBe(60);
    });

    it('should never exceed STRESS_MAX', () => {
      expect(tickStress(98, 10, 100, 0)).toBe(STRESS_MAX);
    });
  });

  describe('getStressSpeedMultiplier', () => {
    it('should return 1.0 for stress below 50', () => {
      expect(getStressSpeedMultiplier(49)).toBe(1.0);
    });

    it('should return 0.9 for stress between 50 and 74', () => {
      expect(getStressSpeedMultiplier(50)).toBe(0.9);
      expect(getStressSpeedMultiplier(74)).toBe(0.9);
    });

    it('should return 0.8 for stress 75 and above', () => {
      expect(getStressSpeedMultiplier(75)).toBe(0.8);
      expect(getStressSpeedMultiplier(100)).toBe(0.8);
    });
  });

  describe('getStressNoiseMultiplier', () => {
    it('should return 1.0 for stress below 50', () => {
      expect(getStressNoiseMultiplier(49)).toBe(1.0);
    });

    it('should return 1.1 for stress between 50 and 74', () => {
      expect(getStressNoiseMultiplier(50)).toBe(1.1);
      expect(getStressNoiseMultiplier(74)).toBe(1.1);
    });

    it('should return 1.25 for stress 75 and above', () => {
      expect(getStressNoiseMultiplier(75)).toBe(1.25);
      expect(getStressNoiseMultiplier(100)).toBe(1.25);
    });
  });
});
