import { HttpInterceptorFn } from '@angular/common/http';
import { retryWhen, mergeMap } from 'rxjs/operators';
import { throwError, timer } from 'rxjs';

function jitterDelay(base: number, attempt: number) {
  const jitter = Math.random() * base;
  return base * Math.pow(2, attempt) + jitter;
}

export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  const maxRetries = 4;
  const baseDelayMs = 500; // initial delay

  return next(req).pipe(
    retryWhen(errors =>
      errors.pipe(
        mergeMap((error, i) => {
          const attempt = i + 1;

          // If it's an HTTP response with status 429, use Retry-After header if present
          const status = error?.status;
          if (status === 429 && attempt <= maxRetries) {
            const retryAfterHeader = error?.headers?.get?.('retry-after');
            if (retryAfterHeader) {
              const seconds = Number(retryAfterHeader);
              if (!isNaN(seconds)) {
                return timer(seconds * 1000);
              }
            }
            const backoff = jitterDelay(baseDelayMs, attempt);
            return timer(backoff);
          }

          // Network or other transient errors (status 0) - retry with backoff
          if ((status === 0 || !status) && attempt <= maxRetries) {
            const backoff = jitterDelay(baseDelayMs, attempt);
            return timer(backoff);
          }

          // Otherwise give up
          return throwError(() => error);
        })
      )
    )
  );
};
