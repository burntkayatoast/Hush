// tick intervals
export const AI_TICK_MS = 1000;
export const GLOBAL_TICK_MS = 15000;

// oxygen
export const O2_MAX = 100;
export const O2_DRAIN_PER_TICK = 1;
export const O2_SAFE_ROOM_REGEN_PER_TICK = 10;
export const O2_SAFE_ROOM_CAP = 0.5;
export const O2_CANNISTER_REFILL = 25;
export const O2_STABLE_THRESHOLD = 0.4; // < this: "WARNING: LOW OXYGEN"
export const O2_LOW_THRESHOLD = 0.2; // < this: "!! WARNING: OXYGEN CRITICAL !!"

// health
export const HEALTH_MAX = 4;
export const O2_CATCH_PENALTY = [10, 15, 25];

// stress
export const STRESS_MAX = 100;
export const STRESS_DECAY_PER_TICK = 1;
export const STRESS_O2_LOW_THRESHOLD = 0.4; // <40% o2
export const STRESS_O2_CRITICAL_THRESHOLD = 0.2; // <20% o2
export const STRESS_O2_LOW_PENALTY = 2;
export const STRESS_O2_CRITICAL_PENALTY = 5;
export const STRESS_PROXIMITY_RADIUS = 20; // distance at which monster starts causing stress
export const STRESS_PROXIMITY_MAX_PENALTY = 5; // max stress per tick if the monster is right on top of player
