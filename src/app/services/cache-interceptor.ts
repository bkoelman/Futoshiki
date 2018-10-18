import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { HttpCacheService } from './http-cache.service';
import { tap } from 'rxjs/operators';
import { Logger } from '../logger';
import { LogCategory } from '../models/log-category.enum';

@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  constructor(private cacheService: HttpCacheService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    if (req.method !== 'GET') {
      return next.handle(req);
    }

    const response = this.cacheService.get(req.url);
    if (response) {
      Logger.write(LogCategory.Caching, 'Returning response from cache.');
      return of(response);
    }

    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          Logger.write(LogCategory.Caching, 'Response added to cache.');
          this.cacheService.put(req.url, event);
        }
      })
    );
  }
}
