import { LogCategory } from './models/log-category.enum';
import { environment } from '.././environments/environment';

const activeLogCategories: LogCategory[] = [];
if (!environment.production) {
  activeLogCategories.push(LogCategory.Download, LogCategory.Cookies, LogCategory.Capture, LogCategory.PlayTime);
}

export class Logger {
  static write(category: LogCategory, message: string) {
    if (activeLogCategories.indexOf(category) > -1) {
      console.log(message);
    }
  }
}
