import { HEALTH_MAX, O2_CATCH_PENALTY } from './constants';
import type { SimulationState } from './types';

/**
 * applies the effects of the monster catching the player
 *   - reduces health by 1
 *   - if health reaches 0, game over and phase sets to 'lose'
 *   - otherwise, reduce oxygenMac based on the catch number
 *   - clamps current oxygen so it doesn't exceed the new oxygenMax
 *   - player wakes in safe room after each catch
 * */
export function applyCatch(state: SimulationState): SimulationState {
  const health = state.health - 1;

  // game over
  if (health <= 0) {
    return { ...state, health: 0, phase: 'lose' };
  }

  // 1st catch = health 3 > penalty O2 -10 (0)
  // 2nd catch = health 2 > penalty O2 -15 (1)
  // 3rd catch = health 1 > penalty O2 -25 (2)
  const catchIndex = HEALTH_MAX - state.health;
  const penalty = O2_CATCH_PENALTY[catchIndex] ?? 0;

  const oxygenMax = state.oxygenMax - penalty;

  // ensre current o2 doesn't exceed the new max
  const oxygen = Math.min(state.oxygen, oxygenMax);

  return {
    ...state,
    health,
    oxygenMax,
    oxygen,
    phase: 'caught',
  };
}

// consuming one soda pop restores one health point and heals one O2 penalty.
export function useSoda(state: SimulationState): SimulationState {
  if (state.health >= HEALTH_MAX || state.phase === 'lose') {
    return state;
  }

  const newHealth = state.health + 1;

  // figure out what penalty to remove
  const restoreIndex = HEALTH_MAX - newHealth;
  const restoreOxygenMax = O2_CATCH_PENALTY[restoreIndex] ?? 0;

  return {
    ...state,
    health: newHealth,
    oxygenMax: state.oxygenMax + restoreOxygenMax,
  };
}
