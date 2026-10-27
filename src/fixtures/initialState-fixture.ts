import { HEALTH_MAX, O2_MAX } from '../simulation/constants';
import type { SimulationState } from '../simulation/types';

export function createInitialState(
  overrides: Partial<SimulationState> = {} // allows optional overrides
): SimulationState {
  return {
    oxygen: 100,
    oxygenMax: O2_MAX,
    stress: 0,
    health: HEALTH_MAX,
    phase: 'exploring',
    playerPos: { x: 0, z: 0 },
    isRunning: false,
    noiseLevel: 0,
    inSafeRoom: false,
    currentRoom: 'start',
    ...overrides,
  };
}
