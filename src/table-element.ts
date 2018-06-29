import { FormGroup } from '@angular/forms';

import { TableDataSource } from './table-data-source';

import cloneDeep from 'lodash.clonedeep';

export class TableElement<T> {
  id: number;
  currentData: T;
  editingState: EditingState<T>;
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
    this.editingState = { kind: StateKind.Editing, originalData: cloneDeep(this.currentData) }
    this.validator.enable();
  }

  cancelOrDelete(): void {
    if (this.id == -1 || this.editingState.kind === StateKind.NotEditing)
      this.delete();
    else {
      this.currentData = this.editingState.originalData;
      this.validator.disable();
    }
  }
}

export type EditingState<T> = NotEditing<T> | Editing<T>

export enum StateKind { NotEditing, Editing }

export class NotEditing<T> {
  constructor(
    readonly kind: StateKind.NotEditing
  ) { }
}

export class Editing<T> {
  constructor(
    readonly kind: StateKind.Editing,
    readonly originalData: T
  ) { }
}
