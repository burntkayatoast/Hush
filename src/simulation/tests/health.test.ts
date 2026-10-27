import { describe, expect, it } from 'vitest';
import { createInitialState } from '@/fixtures/initialState-fixture';
import { applyCatch, useSoda } from '../health';

describe('health mechanics', () => {
  describe('applyCatch', () => {
    it('should reduce health by 1 when caught', () => {
      const next = applyCatch(createInitialState());
      expect(next.health).toBe(3);
    });

    it('should reduce oxygenMax by the first penalty on the 1st catch', () => {
      const next = applyCatch(createInitialState());
      expect(next.oxygenMax).toBe(90);
    });

    it('should reduce oxygenMax by the second penalty on the 2nd catch', () => {
      const next = applyCatch(createInitialState({ health: 3, oxygenMax: 90 }));
      expect(next.oxygenMax).toBe(75);
    });

    it('should reduce oxygenMax by the third penalty on the 3rd catch', () => {
      const next = applyCatch(createInitialState({ health: 2, oxygenMax: 75 }));
      expect(next.oxygenMax).toBe(50);
    });

    it('should lower current oxygen to match the new max', () => {
      const next = applyCatch(createInitialState());
      expect(next.oxygen).toBe(90);
    });

    it('should not change current oxygen if it is already below the new max', () => {
      const next = applyCatch(createInitialState({ oxygen: 30 }));
      expect(next.oxygen).toBe(30);
      expect(next.oxygenMax).toBe(90);
    });

    it('should set phase to lose when health reaches 0', () => {
      const next = applyCatch(createInitialState({ health: 1 }));
      expect(next.health).toBe(0);
      expect(next.phase).toBe('lose');
    });

    it('should set phase to caught if caught', () => {
      const next = applyCatch(createInitialState());
      expect(next.phase).toBe('caught');
    });

    it('should leave oxygen and oxygenMax untouched after game over catch', () => {
      const next = applyCatch(
        createInitialState({ health: 1, oxygen: 40, oxygenMax: 50 })
      );
      expect(next.health).toBe(0);
      expect(next.phase).toBe('lose');
      expect(next.oxygen).toBe(40);
      expect(next.oxygenMax).toBe(50);
    });
  });

  describe('useSoda', () => {
    it('should restore 1 health point', () => {
      const next = useSoda(createInitialState({ health: 1 }));
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
        const next = useSoda(
          createInitialState({ health: startHealth, oxygenMax: startO2Max })
        );
        expect(next.oxygenMax).toBe(expectedO2Max);
        expect(next.health).toBe(expectedHealth);
      }
    );

    it('should not restore health or oxygenMax if the player is already at max health', () => {
      const next = useSoda(createInitialState({ health: 4, oxygenMax: 100 }));
      expect(next.health).toBe(4);
      expect(next.oxygenMax).toBe(100);
    });
  });
});
