import {ValidatorService} from '../ngx-material-table/validator.service';
import {UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {Injectable} from '@angular/core';
import {timer} from 'rxjs';
import {first, map} from 'rxjs/operators';

export class Person {
  name: string;
  age: number;
}

@Injectable()
export class PersonValidatorService implements ValidatorService {
  getRowValidator(): UntypedFormGroup {
    return new UntypedFormGroup({
      name: new UntypedFormControl(null, Validators.required,
        // Create an async validation (e.g. access to a server)
        (control) => {
          console.debug('Checking name is valid: ' + control.value);

          // Wait 2s, then just test the name length
          // In a real world, we can check if the name is unique.
          return timer(2000)
            .pipe(
              first(),
              map(() => {
                const name = control.value;
                if (name && name.trim().length < 3) {
                  return {minLength: true};
                }
                return null;
              })
            );
        }),

      age: new UntypedFormControl(null, Validators.compose([Validators.min(0), Validators.max(120)]))
    });
  }
}
