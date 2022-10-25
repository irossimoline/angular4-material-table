import {AsyncTableElement} from './async-table-element';
import * as clone from 'clone';


export class AsyncTableElementTemplateDriven<T> extends AsyncTableElement<T> {

  _editing: boolean;
  _currentData: T;

  get validator(): any {
    return undefined;
  }

  set validator(value: any) {
  }

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

  constructor(init: Partial<AsyncTableElementTemplateDriven<T>>) {
    super();
    Object.assign(this, init);
  }

  isValid(): Promise<boolean> {
    return Promise.resolve(true);
  }

  cloneData(): T {
    return clone(this._currentData);
  }
}
