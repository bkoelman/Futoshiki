import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PuzzleData } from './puzzle-data';
import { PuzzleDifficulty } from './puzzle-difficulty.enum';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private _httpClient: HttpClient) {
  }

  getPuzzle(boardSize: number, difficulty: PuzzleDifficulty, id: number): Observable<PuzzleData> {
    const requestUrl = this.formatPuzzleUrl(boardSize, difficulty, id);
    console.log('Downloading puzzle from URL: ' + requestUrl);

    return this._httpClient.get(requestUrl, { responseType: 'text' })
      .pipe(
        map(responseText => {
          return this.parsePuzzleText(responseText, boardSize);
        })
      );
  }

  private formatPuzzleUrl(boardSize: number, difficulty: PuzzleDifficulty, id: number): string {
    const baseUrl = window.location.origin + window.location.pathname;
    const fileName = 'Puzzle' + this.prefixNumber(id, '0000') + '.txt';
    return `${baseUrl}puzzles/${PuzzleDifficulty[difficulty]}/0${boardSize}x0${boardSize}/${fileName}`;
  }

  private prefixNumber(value: number, padding: string) {
    return (padding + value).slice(-padding.length);
  }

  private parsePuzzleText(puzzleText: string, boardSize: number): PuzzleData {
    const puzzleData: PuzzleData = {
      boardSize: boardSize,
      puzzleLines: [],
      answerLines: []
    };

    const lineLength = boardSize * 2 - 1;
    const lineCount = 2 * lineLength;

    for (let lineIndex = 0; lineIndex < lineCount; lineIndex++) {
      const textIndex = lineLength * lineIndex;
      const line = puzzleText.slice(textIndex, textIndex + lineLength);

      if (lineIndex < lineCount / 2) {
        puzzleData.puzzleLines.push(line);
      } else {
        puzzleData.answerLines.push(line);
      }
    }

    return puzzleData;
  }
}
