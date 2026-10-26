import {
  STRESS_DECAY_PER_TICK,
  STRESS_MAX,
  STRESS_O2_CRITICAL_PENALTY,
  STRESS_O2_CRITICAL_THRESHOLD,
  STRESS_O2_LOW_PENALTY,
  STRESS_O2_LOW_THRESHOLD,
  STRESS_PROXIMITY_MAX_PENALTY,
  STRESS_PROXIMITY_RADIUS,
} from './constants';

export function tickStress(
  currentStress: number,
  oxygen: number,
  oxygenMax: number,
  monsterDistance: number // distance in game units
): number {
  let stressChange = 0;

  // 1. O2 penalties
  if (oxygen < oxygenMax * STRESS_O2_CRITICAL_THRESHOLD) {
    stressChange += STRESS_O2_CRITICAL_PENALTY;
  } else if (oxygen < oxygenMax * STRESS_O2_LOW_THRESHOLD) {
    stressChange += STRESS_O2_LOW_PENALTY;
  }

  // 2. monster proximity penalty
  if (monsterDistance <= STRESS_PROXIMITY_RADIUS) {
    // closer the monster, higher the penalty
    // at 0 distance, penalty is MAX. at distance RADIUS, penalty is 0
    const proximityRatio = 1 - monsterDistance / STRESS_PROXIMITY_RADIUS;
    const proximityPenalty = Math.round(
      proximityRatio * STRESS_PROXIMITY_MAX_PENALTY
    );
    stressChange += proximityPenalty;
  }

  // 3. decay (no threats present)
  if (stressChange === 0) {
    stressChange -= STRESS_DECAY_PER_TICK;
  }

  return Math.max(0, Math.min(STRESS_MAX, currentStress + stressChange));
}

/**
 * returns the movement speed multiplier based on stress.
 * 0-50: 100% speed
 * 50-75: 90% speed
 * 75-100: 80% speed
 */
export function getStressSpeedMultiplier(stress: number): number {
  if (stress >= 75) return 0.8;
  if (stress >= 50) return 0.9;
  return 1.0;
}

/**
 * returns the noise generation multiplier based on stress.
 * 0-50: 100% noise
 * 50-75: 110% noise
 * 75-100: 125% noise
 */
export function getStressNoiseMultiplier(stress: number): number {
  if (stress >= 75) return 1.25;
  if (stress >= 50) return 1.1;
  return 1.0;
}
