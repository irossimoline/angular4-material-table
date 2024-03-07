import { TableElement } from './table-element';
import * as cloneImported from 'clone';
import { unwrapESModule } from './modules';

const clone = unwrapESModule<typeof cloneImported>(cloneImported);

export class TableElementTemplateDriven<T> extends TableElement<T> {
  _editing: boolean;
  _currentData: T;

  get validator(): any {
    return undefined;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  set validator(value: any) {}

  get currentData(): T {
    return this._currentData;
  }

  set currentData(data: T) {
    this._currentData = data;
  }

  get editing(): boolean {
    return this._editing;
  }

  set editing(value: boolean) {
    this._editing = value;
  }

  get valid(): boolean {
    return true;
  }

  get invalid(): boolean {
    return false;
  }

  get pending(): boolean {
    return false;
  }

  get dirty(): boolean {
    return false;
  }

  constructor(init: Partial<TableElementTemplateDriven<T>>) {
    super();
    Object.assign(this, init);
  }

  isValid(): boolean {
    return true;
  }

  cloneData(): T {
    return clone(this._currentData);
  }
}
