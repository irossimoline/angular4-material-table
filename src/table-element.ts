import { FormGroup } from '@angular/forms';
import cloneDeep from 'lodash.clonedeep';

import { TableDataSource } from './table-data-source';

export abstract class TableElement<T> {
  id: number;
  editing: boolean;
  currentData: T;
  originalData?: T;
  source: TableDataSource<T>;

  abstract get validator(): FormGroup;
  abstract set validator(validator: FormGroup);

  delete(): void {
    this.source.delete(this.id);
  }

  confirmEditCreate(): boolean {
    if (this.id == -1)
      return this.source.confirmCreate(this);
    else
      return this.source.confirmEdit(this);
  }

  startEdit(): void {
    this.originalData = cloneDeep(this.currentData);
    this.editing = true;
  }

  cancelOrDelete() {
    if (this.id == -1 || !this.editing)
      this.delete();
    else {
      this.currentData = this.originalData;
      this.editing = false;
    }
  }

  abstract isValid(): boolean;
}
