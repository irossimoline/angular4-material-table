import {ValidatorService} from '../ngx-material-table/validator.service';
import {UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {Injectable} from '@angular/core';

@Injectable()
export class PersonValidatorService implements ValidatorService {
  getRowValidator(): UntypedFormGroup {
    return new UntypedFormGroup({
      name: new UntypedFormControl(null, Validators.required),
      age: new UntypedFormControl(null, Validators.compose([Validators.min(0), Validators.max(120)]))
    });
  }
}
