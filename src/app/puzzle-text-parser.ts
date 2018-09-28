import { PuzzleInfo } from './models/puzzle-info';
import { PuzzleData } from './models/puzzle-data';

export class PuzzleTextParser {
    static parseText(puzzleText: string, info: PuzzleInfo): PuzzleData {
        const result: PuzzleData = {
            info: info,
            puzzleLines: [],
            answerLines: []
        };

        const lineLength = info.boardSize * 2 - 1;
        const lineCount = 2 * lineLength;

        for (let lineIndex = 0; lineIndex < lineCount; lineIndex++) {
            const textIndex = lineLength * lineIndex;
            const line = puzzleText.slice(textIndex, textIndex + lineLength);

            if (lineIndex < lineCount / 2) {
                result.puzzleLines.push(line);
            } else {
                result.answerLines.push(line);
            }
        }

        return result;
    }
}
