import { GameSaveState } from './game-save-state';
import { CellContentSnapshot } from './cell-content-snapshot';
import { BoardComponent } from './board/board.component';
import { PuzzleInfo } from './puzzle-info';
import { Coordinate } from './coordinate';

export class SaveGameAdapter {
    private static readonly _separator = '-';
    private static readonly emptyCellText = '0000';
    private static readonly _allCellValuesCached = [9, 8, 7, 6, 5, 4, 3, 2, 1];

    toText(info: PuzzleInfo, board: BoardComponent, forceEmptyBoard: boolean): string {
        let cells = '';
        let seenValues = false;

        if (!forceEmptyBoard) {
            for (let row = 1; row <= info.boardSize; row++) {
                for (let column = 1; column <= info.boardSize; column++) {
                    const coordinate = new Coordinate(row, column);
                    const cell = board.getCellAtCoordinate(coordinate);
                    if (cell) {
                        const snapshot = cell.getContentSnapshot();
                        const text = this.formatCellSnapshot(snapshot);
                        cells += text;

                        if (text !== SaveGameAdapter.emptyCellText) {
                            seenValues = true;
                        }
                    }
                }
            }
        }

        let result = `D${info.difficulty}${SaveGameAdapter._separator}S${info.boardSize}` +
            `${SaveGameAdapter._separator}I${info.id}`;

        if (seenValues) {
            result += `${SaveGameAdapter._separator}B` + cells;
        }

        return result;
    }

    private formatCellSnapshot(snapshot: CellContentSnapshot): string {
        if (snapshot.userValue !== undefined) {
            return 'ff' + this.decimalToHex(snapshot.userValue);
        } else if (snapshot.draftValues.length > 0) {
            let draftBitmask = 0;
            for (const draftValue of snapshot.draftValues) {
                draftBitmask += Math.pow(2, draftValue - 1);
            }

            const hexValue = this.decimalToHex(draftBitmask);
            return hexValue.length === 2 ? '00' + hexValue : hexValue;
        } else {
            return SaveGameAdapter.emptyCellText;
        }
    }

    private decimalToHex(value: number) {
        const result = value.toString(16);
        return result.length % 2 === 1 ? '0' + result : result;
    }

    parseText(text: string): GameSaveState | undefined {
        let difficulty;
        let boardSize;
        let puzzleId;
        let cellSnapshotMap;

        for (const setting of text.split(SaveGameAdapter._separator)) {
            if (setting.length >= 2) {
                switch (setting[0]) {
                    case 'D':
                        difficulty = this.parseIntegerInRange(setting.substring(1), 0, 3);
                        break;
                    case 'S':
                        boardSize = this.parseIntegerInRange(setting.substring(1), 4, 9);
                        break;
                    case 'I':
                        puzzleId = this.parseIntegerInRange(setting.substring(1), 1, 9999);
                        break;
                    case 'B':
                        cellSnapshotMap = this.parseSnapshotMap(setting);
                        break;
                }
            }
        }

        if (difficulty === undefined || boardSize === undefined || puzzleId === undefined) {
            return undefined;
        }

        return {
            info: {
                difficulty: difficulty,
                boardSize: boardSize,
                id: puzzleId
            },
            cellSnapshotMap: cellSnapshotMap
        };
    }

    private parseIntegerInRange(text: string, minValue: number, maxValue: number): number | undefined {
        const value = parseInt(text, 10);
        if (!isNaN(value) && value >= minValue && value <= maxValue) {
            return value;
        }
        return undefined;
    }

    private parseSnapshotMap(setting: string): object | undefined {
        let cellSnapshotMap;
        let index = 0;
        let textOffset = 1;

        while (textOffset < setting.length) {
            const cellText = setting.substring(textOffset, textOffset + 4);
            const snapshot = this.parseCellSnapshot(cellText);

            if (cellSnapshotMap === undefined) {
                cellSnapshotMap = {};
            }
            cellSnapshotMap[index] = snapshot;

            index++;
            textOffset += 4;
        }

        return cellSnapshotMap;
    }

    private parseCellSnapshot(text: string): CellContentSnapshot | undefined {
        if (text.startsWith('ff')) {
            const userValue = parseInt(text.substring(2), 16);
            return new CellContentSnapshot(userValue, []);
        } else if (text === '0000') {
            return CellContentSnapshot.empty();
        } else {
            let draftBitmask = parseInt(text, 16);
            const draftValues = [];

            for (const draftValue of SaveGameAdapter._allCellValuesCached) {
                const bitmaskValue = Math.pow(2, draftValue - 1);
                if (draftBitmask - bitmaskValue >= 0) {
                    draftBitmask -= bitmaskValue;
                    draftValues.push(draftValue);
                }
            }

            return new CellContentSnapshot(undefined, draftValues.sort());
        }
    }
}
