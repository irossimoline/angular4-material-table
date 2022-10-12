import {firstValueFrom, Observable, timer} from 'rxjs';
import {AbstractControl} from '@angular/forms';
import {filter, map, takeUntil} from 'rxjs/operators';

export function waitWhilePending(form: AbstractControl, opts?: {stop?: Observable<any>, timeout?: number}): Promise<any> {
  const status$ = form.statusChanges
    .pipe(
      filter(status => status !== 'PENDING'),
      map(status => status === 'VALID')
    );
  const stop$ = opts?.stop || (opts?.timeout > 0 && timer(opts?.timeout));
  if (stop$) {
    return firstValueFrom(
      status$
        .pipe(
          takeUntil(stop$)
        ));
  }

  return firstValueFrom(status$);
}

export function isPromise(value: any): value is Promise<any> {
  return (typeof value === 'object' && (value instanceof Promise || !!value['then']));
}
