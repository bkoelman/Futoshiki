import { LogCategory } from './models/log-category.enum';
import { Logger } from './logger';

declare var TimeMe: any;

export class PlayTimeTracker {
  private static readonly _timeMePageName = 'Futoshiki';

  private _earlierPlayTimeInSeconds = 0;

  constructor(userLeavesCallback: Function) {
    TimeMe.initialize({
      idleTimeoutInSeconds: 5 * 60
    });

    TimeMe.callWhenUserLeaves(() => {
      Logger.write(LogCategory.PlayTime, 'User has left the browser.');
      TimeMe.stopTimer(PlayTimeTracker._timeMePageName);
      userLeavesCallback();
    });

    TimeMe.callWhenUserReturns(function() {
      Logger.write(LogCategory.PlayTime, 'User has returned to the browser.');
      TimeMe.startTimer(PlayTimeTracker._timeMePageName);
    });
  }

  reset() {
    Logger.write(LogCategory.PlayTime, 'Resetting play time.');
    this._earlierPlayTimeInSeconds = 0;
    TimeMe.resetRecordedPageTime(PlayTimeTracker._timeMePageName);
    TimeMe.startTimer(PlayTimeTracker._timeMePageName);
  }

  setEarlierPlayTime(seconds: number) {
    this._earlierPlayTimeInSeconds = seconds;
  }

  getPlayTimeInSeconds() {
    const playTimeInSeconds = this._earlierPlayTimeInSeconds + TimeMe.getTimeOnPageInSeconds(PlayTimeTracker._timeMePageName);
    Logger.write(LogCategory.PlayTime, `Total playing time: ${playTimeInSeconds}sec`);
    return playTimeInSeconds;
  }
}
