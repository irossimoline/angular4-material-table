import {Observable, timer} from 'rxjs';
import {AbstractControl} from '@angular/forms';
import {filter, first, map, takeUntil} from 'rxjs/operators';

export function waitWhilePending(form: AbstractControl, opts?: {stop?: Observable<any>, timeout?: number}): Promise<any> {
  const status$ = form.statusChanges
    .pipe(
      filter(status => status !== 'PENDING'),
      map(status => status === 'VALID')
    );
  const stop$ = opts?.stop || (opts?.timeout > 0 && timer(opts?.timeout));
  if (stop$) {
    return status$
        .pipe(
          takeUntil(stop$),
          first()
        )
    .toPromise();
  }

  return status$.pipe(
      first()
    )
    .toPromise();
}
