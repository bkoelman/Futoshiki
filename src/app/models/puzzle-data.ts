import { PuzzleInfo } from './puzzle-info';
import { MemoryBoard } from './memory-board';

export interface PuzzleData {
    info: PuzzleInfo;
    startBoard: MemoryBoard;
    answerDigits: string;
}
