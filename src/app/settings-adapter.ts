import { GameSettings } from './models/game-settings';

export class SettingsAdapter {
  private static readonly _separator = '-';

  toText(settings: GameSettings): string {
    return (
      `ACC${this.formatBoolean(settings.autoCleanCandidates)}${SettingsAdapter._separator}` +
      `NWM${this.formatBoolean(settings.notifyOnWrongMoves)}${SettingsAdapter._separator}` +
      `SHE${this.formatBoolean(settings.showHintExplanations)}`
    );
  }

  private formatBoolean(value: boolean): string {
    return value ? '1' : '0';
  }

  parseText(text: string): GameSettings | undefined {
    let autoCleanCandidates;
    let notifyOnWrongMoves;
    let showHintExplanations;

    for (const setting of text.split(SettingsAdapter._separator)) {
      if (setting.length >= 4) {
        switch (setting.substring(0, 3)) {
          case 'ACC':
            autoCleanCandidates = this.parseBoolean(setting.substring(3));
            break;
          case 'NWM':
            notifyOnWrongMoves = this.parseBoolean(setting.substring(3));
            break;
          case 'SHE':
            showHintExplanations = this.parseBoolean(setting.substring(3));
            break;
        }
      }
    }

    if (autoCleanCandidates === undefined || notifyOnWrongMoves === undefined || showHintExplanations === undefined) {
      return undefined;
    }

    return {
      autoCleanCandidates: autoCleanCandidates,
      notifyOnWrongMoves: notifyOnWrongMoves,
      showHintExplanations: showHintExplanations
    };
  }

  parseBoolean(text: string): boolean | undefined {
    return text === '1' ? true : text === '0' ? false : undefined;
  }
}
