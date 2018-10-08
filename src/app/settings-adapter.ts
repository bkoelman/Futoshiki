import { GameSettings } from './models/game-settings';

export class SettingsAdapter {
    private static readonly _separator = '-';

    toText(settings: GameSettings): string {
        return `ADC${this.formatBoolean(settings.autoCleanDraftValues)}${SettingsAdapter._separator}` +
            `NWM${this.formatBoolean(settings.notifyOnWrongMoves)}`;
    }

    private formatBoolean(value: boolean): string {
        return value ? '1' : '0';
    }

    parseText(text: string): GameSettings | undefined {
        let autoCleanDraftValues;
        let notifyOnWrongMoves;

        for (const setting of text.split(SettingsAdapter._separator)) {
            if (setting.length >= 4) {
                switch (setting.substring(0, 3)) {
                    case 'ADC':
                        autoCleanDraftValues = this.parseBoolean(setting.substring(3));
                        break;
                    case 'NWM':
                        notifyOnWrongMoves = this.parseBoolean(setting.substring(3));
                        break;
                }
            }
        }

        if (autoCleanDraftValues === undefined || notifyOnWrongMoves === undefined) {
            return undefined;
        }

        return {
            autoCleanDraftValues: autoCleanDraftValues,
            notifyOnWrongMoves: notifyOnWrongMoves
        };
    }

    parseBoolean(text: string): boolean | undefined {
        return text === '1' ? true : text === '0' ? false : undefined;
    }
}
