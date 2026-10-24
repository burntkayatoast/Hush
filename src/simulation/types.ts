export type GamePhase = 'exploring' | 'caught' | 'win' | 'lose';
export type O2Alert = 'stable' | 'low' | 'critical';

export interface SimulationState {
  oxygen: number; // track current
  oxygenMax: number; // starts at 100, reduces when caught and restored by soda
  stress: number; // starts at 100
  health: number; // 4 health points, lose one per catch
  phase: GamePhase;
}
