import { LogCategory } from './models/log-category.enum';
import { environment } from '.././environments/environment';

const activeLogCategories: LogCategory[] = [];
if (!environment.production) {
  activeLogCategories.push(LogCategory.Download, /* LogCategory.Caching, */ LogCategory.Cookies, /* LogCategory.Solvers, */ LogCategory.Capture);
}

export class Logger {
  static write(category: LogCategory, message: string) {
    if (activeLogCategories.includes(category)) {
      console.log(message);
    }
  }
}
