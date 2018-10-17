import { PuzzleDifficulty } from './puzzle-difficulty.enum';

export interface PuzzleInfo {
  difficulty: PuzzleDifficulty;
  boardSize: number;
  id: number;
}
