import {UntypedFormGroup} from '@angular/forms';
import {AsyncTableDataSource} from './async-table-data-source';

export abstract class AsyncTableElement<T> {

  id: number;
  originalData?: T;
  source: AsyncTableDataSource<T, any>;

  abstract get editing(): boolean;
  abstract set editing(editing: boolean);

  abstract get currentData(): T;
  abstract set currentData(currentData: T);
  abstract cloneData(): T;

  abstract get validator(): UntypedFormGroup;
  abstract set validator(validator: UntypedFormGroup);

  delete(): Promise<boolean> {
    return this.source.delete(this.id);
  }

  confirmEditCreate(): Promise<boolean> {
    return this.source.confirmEditCreate(this);
  }

  /**
   * Cancel or delete
   */
  cancelOrDelete(): Promise<boolean> {
    return this.source.cancelOrDelete(this);
  }

  cancel(): Promise<boolean> {
    return this.source.cancel(this);
  }

  startEdit(): Promise<boolean> {
    return this.source.startEdit(this);
  }

  abstract get valid(): boolean;

  abstract get pending(): boolean;

  abstract get invalid(): boolean;

  abstract get dirty(): boolean;

  /**
   * Check if the row is valid. Use Promise to allow async validator to finish
   */
  abstract isValid(): Promise<boolean>;
}
