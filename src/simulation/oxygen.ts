import {
  O2_CANNISTER_REFILL,
  O2_DRAIN_PER_TICK,
  O2_LOW_THRESHOLD,
  O2_SAFE_ROOM_CAP,
  O2_SAFE_ROOM_REGEN_PER_TICK,
  O2_STABLE_THRESHOLD,
} from './constants';
import type { O2Alert } from './types';

/**
 * advance O2 by one gloabal tick
 *  - outside a safe room: drain, floor is at 0.
 *  - inside a safe room: regen but capped based on max O2.
 */

export function tickOxygen(
  oxygen: number,
  oxygenMax: number,
  inSafeRoom: boolean
): number {
  if (!inSafeRoom) {
    return Math.max(0, oxygen - O2_DRAIN_PER_TICK);
  }

  const cap = oxygenMax * O2_SAFE_ROOM_CAP;
  const regenerated = oxygen + O2_SAFE_ROOM_REGEN_PER_TICK;

  return Math.max(oxygen, Math.min(cap, regenerated));
}

// O2 cannister consume
export function useCannister(oxygen: number, oxygenMax: number): number {
  return Math.min(oxygenMax, oxygen + O2_CANNISTER_REFILL);
}

// alert text for low O2. Thresholds scale with oxygenMax.
export function getO2Alert(oxygen: number, oxygenMax: number): O2Alert {
  if (oxygen < oxygenMax * O2_LOW_THRESHOLD) return 'critical';
  if (oxygen < oxygenMax * O2_STABLE_THRESHOLD) return 'low';

  return 'stable';
}
