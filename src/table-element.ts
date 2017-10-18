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

  delete() {
    this.source.delete(this.id);
  }

  confirmEditCreate() {
    this.originalData = undefined;
    if (this.id == -1)
      this.source.confirmCreate(this);
    else
      this.source.confirmEdit(this);
  }

  startEdit() {
    this.originalData = cloneDeep(this.currentData);
    this.editing = true;
  }

  cancel() {
    if (this.id == -1 || !this.editing)
      this.delete();
    else {
      this.currentData = this.originalData;
      this.editing = false;
    }
  }
}
