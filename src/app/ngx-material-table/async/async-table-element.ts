import { UntypedFormGroup } from '@angular/forms';
import {AsyncTableDataSource, IAsyncTableDataSource} from './async-table-data-source';
import {ScrollableTableDataSource} from "../scrollable/scrollable-table-data-source";

export abstract class AsyncTableElement<T> {
  id: number;
  originalData?: T;
  source: IAsyncTableDataSource<T, any>;

  abstract get editing(): boolean;
  abstract set editing(editing: boolean);

  abstract get currentData(): T;
  abstract set currentData(currentData: T);
  abstract cloneData(): T;

  abstract get validator(): UntypedFormGroup;
  abstract set validator(validator: UntypedFormGroup);

  delete( options = { emitEvent: true }): Promise<boolean> {
    return this.source.delete(this.id, options);
  }

  confirmEditCreate(options = { emitEvent: true }): Promise<boolean> {
    return this.source.confirmEditCreate(this, options);
  }

  /**
   * Cancel or delete
   */
  cancelOrDelete(options = { emitEvent: true }): Promise<boolean> {
    return this.source.cancelOrDelete(this, options);
  }

  cancel(): Promise<boolean> {
    return this.source.cancel(this);
  }

  startEdit(): Promise<boolean> {
    return this.source.startEdit(this);
  }

  move(direction: number): Promise<boolean> {
    return this.source.move(this.id, direction);
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
