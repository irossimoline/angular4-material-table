import {TableElement} from './table-element';
import {UntypedFormGroup} from '@angular/forms';

export class TableElementReactiveForms<T> extends TableElement<T> {

  validator: UntypedFormGroup;

  get currentData(): T {
    return this.validator.getRawValue();
  }

  set currentData(data: T) {
    this.validator.patchValue(data);
  }

  get editing(): boolean {
    return this.validator.enabled;
  }

  set editing(value: boolean) {
    if (value) {
      this.validator.enable();
    } else {
      this.validator.disable();
    }
  }

  get valid(): boolean {
    return this.validator.valid;
  }

  get pending(): boolean {
    return this.validator.pending;
  }

  get invalid(): boolean {
    return this.validator.invalid;
  }

  get dirty(): boolean {
    return this.validator.dirty;
  }

  constructor(init: Partial<TableElementReactiveForms<T>>) {
    super();
    this.validator = init.validator;
    Object.assign(this, init);
  }

  isValid(): boolean {

    // Enable temporarily the validator to get the valid status
    const disabled = this.validator.disabled;
    if (disabled) {
      this.validator.enable({emitEvent: false, onlySelf: true});
      this.validator.updateValueAndValidity({emitEvent: false, onlySelf: true});
    }

    try {
      if (!this.validator.valid) {

        // FIXME: enable this code, when isValid() will be async
        // Wait end of async validation
        //if (this.validator.pending) {
        //  await waitWhilePending(this.validator);
        //}

        // Quit if really invalid
        if (this.validator.invalid) {
          return false;
        }
      }

      return true;
    } finally {
      // Re-disabled, if need
      if (disabled) {
        this.validator.disable({emitEvent: false, onlySelf: true});
      }
    }
  }

  cloneData(): T {
    return this.validator.getRawValue();
  }
}
