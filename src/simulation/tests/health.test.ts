import { describe, expect, it } from 'vitest';
import { HEALTH_MAX, O2_MAX } from '../constants';
import { applyCatch, useSoda } from '../health';
import type { SimulationState } from '../types';

describe('health mechanics', () => {
  const baseState: SimulationState = {
    oxygen: 100,
    oxygenMax: O2_MAX,
    stress: 0,
    health: HEALTH_MAX,
    phase: 'exploring',
  };

  describe('applyCatch', () => {
    it('should reduce health by 1 when caught', () => {
      const next = applyCatch(baseState);
      expect(next.health).toBe(3);
    });

    it('should reduce oxygenMax by the first penalty on the 1st catch', () => {
      const next = applyCatch(baseState);
      expect(next.oxygenMax).toBe(90);
    });

    it('should reduce oxygenMax by the second penalty on the 2nd catch', () => {
      const state = { ...baseState, health: 3, oxygenMax: 90 };
      const next = applyCatch(state);
      expect(next.oxygenMax).toBe(75);
    });

    it('should reduce oxygenMax by the third penalty on the 3rd catch', () => {
      const state = { ...baseState, health: 2, oxygenMax: 75 };
      const next = applyCatch(state);
      expect(next.oxygenMax).toBe(50);
    });

    it('should lower current oxygen to match the new max', () => {
      // scenario: player has 100 o2 but max drops to 90 after a catch
      const next = applyCatch(baseState);
      expect(next.oxygen).toBe(90);
    });

    it('should not change current oxygen if it is already below the new max', () => {
      // scenario: player only has 30 O2, and max drops to 90 after a catch
      const state = { ...baseState, oxygen: 30 };
      const next = applyCatch(state);

      expect(next.oxygen).toBe(30);
      expect(next.oxygenMax).toBe(90);
    });

    it('should set phase to lose when health reaches 0', () => {
      const state = { ...baseState, health: 1 };
      const next = applyCatch(state);

      expect(next.health).toBe(0);
      expect(next.phase).toBe('lose');
    });

    it('should set phase to caught if caught', () => {
      const next = applyCatch(baseState);
      expect(next.phase).toBe('caught');
    });

    it('should leave oxygen and oxygenMax untouched after game over catch', () => {
      const state = { ...baseState, health: 1, oxygen: 40, oxygenMax: 50 };
      const next = applyCatch(state);

      expect(next.health).toBe(0);
      expect(next.phase).toBe('lose');
      expect(next.oxygen).toBe(40);
      expect(next.oxygenMax).toBe(50);
    });
  });

  describe('useSoda', () => {
    it('should restore 1 health point', () => {
      const state = { ...baseState, health: 1 };
      const next = useSoda(state);

      expect(next.health).toBe(2);
    });

    it.each([
      { startHealth: 1, startO2Max: 50, expectedHealth: 2, expectedO2Max: 75 }, // +25
      { startHealth: 2, startO2Max: 75, expectedHealth: 3, expectedO2Max: 90 }, // +15
      { startHealth: 3, startO2Max: 90, expectedHealth: 4, expectedO2Max: 100 }, // +10
      {
        startHealth: 4,
        startO2Max: 100,
        expectedHealth: 4,
        expectedO2Max: 100,
      }, // +0
    ])(
      'should restore the correct oxygenMax penalty when healing from $startHealth to $startHealth + 1',
      ({ startHealth, startO2Max, expectedHealth, expectedO2Max }) => {
        const state = {
          ...baseState,
          health: startHealth,
          oxygenMax: startO2Max,
        };
        const next = useSoda(state);

        expect(next.oxygenMax).toBe(expectedO2Max);
        expect(next.health).toBe(expectedHealth);
      }
    );

    it('should not restore health or oxygenMax if the player is already at max health', () => {
      const state = { ...baseState, health: 4, oxygenMax: 100 };
      const next = useSoda(state);

      // should have no changes
      expect(next.health).toBe(4);
      expect(next.oxygenMax).toBe(100);
    });
  });
});
