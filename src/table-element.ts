import { FormGroup } from '@angular/forms';

import { TableDataSource } from './table-data-source';

import cloneDeep from 'lodash.clonedeep';

export class TableElement<T> {
  id: number;
  editing: boolean;
  currentData?: T;
  originalData: T;
  source: TableDataSource<T>;
  validator: FormGroup;

  constructor(init: Partial<TableElement<T>>) {
    Object.assign(this, init);
  }

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
    this.validator.enable();
  }

  cancelOrDelete(): void {
    if (this.id == -1 || !this.editing)
      this.delete();
    else {
      this.currentData = this.originalData;
      this.editing = false;
      this.validator.disable();
    }
  }
}
