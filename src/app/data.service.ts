import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PuzzleDifficulty } from './puzzle-difficulty.enum';
import { PuzzleInfo } from './puzzle-info';
import { PuzzleData } from './puzzle-data';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private _httpClient: HttpClient) {
  }

  getPuzzle(request: PuzzleInfo): Observable<PuzzleData> {
    const requestUrl = this.formatPuzzleUrl(request);
    console.log('Downloading puzzle from URL: ' + requestUrl);

    return this._httpClient.get(requestUrl, { responseType: 'text' })
      .pipe(
        map(responseText => {
          return this.parsePuzzleText(responseText, request);
        })
      );
  }

  private formatPuzzleUrl(request: PuzzleInfo): string {
    const baseUrl = 'https://raw.githubusercontent.com/bkoelman/Futoshiki/master/';
    const fileName = 'Puzzle' + this.prefixNumber(request.id, '0000') + '.txt';
    return `${baseUrl}puzzles/${PuzzleDifficulty[request.difficulty]}/0${request.boardSize}x0${request.boardSize}/${fileName}`;
  }

  private prefixNumber(value: number, padding: string) {
    return (padding + value).slice(-padding.length);
  }

  private parsePuzzleText(puzzleText: string, request: PuzzleInfo): PuzzleData {
    const response: PuzzleData = {
      info: request,
      puzzleLines: [],
      answerLines: []
    };

    const lineLength = request.boardSize * 2 - 1;
    const lineCount = 2 * lineLength;

    for (let lineIndex = 0; lineIndex < lineCount; lineIndex++) {
      const textIndex = lineLength * lineIndex;
      const line = puzzleText.slice(textIndex, textIndex + lineLength);

      if (lineIndex < lineCount / 2) {
        response.puzzleLines.push(line);
      } else {
        response.answerLines.push(line);
      }
    }

    return response;
  }
}
