import { HintProvider } from './hint-provider';
import { PuzzleInfo } from './models/puzzle-info';
import { PuzzleDataService } from './services/puzzle-data.service';
import { TestBed, getTestBed } from '@angular/core/testing';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { MemoryBoard } from './models/memory-board';
import { PuzzleDifficulty } from './models/puzzle-difficulty.enum';
import { BoardTextConverter } from './board-text-converter';

const enabled = false;

describe('Scanner for puzzles to find a specific board scenario to solve', () => {
    let injector: TestBed;
    const converter = new BoardTextConverter();

    beforeEach(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000000000;

        TestBed.configureTestingModule({
            imports: [HttpClientModule]
        });
    });

    if (enabled) {
        it('should find a puzzle for which the hint provider throws', async () => {
            for (let index = 1; index <= 9999; index++) {
                for (const size of [4, 5, 6, 7, 8, 9]) {
                    for (const difficulty of [
                        PuzzleDifficulty.Trivial, PuzzleDifficulty.Easy, PuzzleDifficulty.Tricky, PuzzleDifficulty.Extreme
                    ]) {
                        const info: PuzzleInfo = {
                            difficulty: difficulty,
                            boardSize: size,
                            id: index
                        };

                        const board = await retrievePuzzleBoard(info);
                        let beforeBoardText = converter.boardToText(board);

                        const provider = new HintProvider(board);
                        try {
                            while (provider.runAtBoard()) {
                                beforeBoardText = converter.boardToText(board);
                            }
                        } catch (error) {
                            console.log(`Found matching scenario on board ` +
                                `${PuzzleDifficulty[info.difficulty]} / ${info.boardSize}x${info.boardSize} / ${info.id}:`);
                            console.log(beforeBoardText);
                            return;
                        }
                    }
                }
            }

            expect('No matching board found.').toBeFalsy();
        });
    }

    async function retrievePuzzleBoard(info: PuzzleInfo): Promise<MemoryBoard> {
        injector = getTestBed();
        const httpClient = injector.get(HttpClient) as HttpClient;
        const service = new PuzzleDataService(httpClient);
        const data = await service.getPuzzle(info).toPromise();
        return data.startBoard;
    }
});
