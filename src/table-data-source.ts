import { DataSource } from '@angular/cdk/collections';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

import { TableElement } from './table-element';
import { ValidatorService } from './validator.service';
import { DefaultValidatorService } from './default-validator.service';


export class TableDataSource<T> extends DataSource<TableElement<T>> {

  private rowsSubject: BehaviorSubject<TableElement<T>[]>;
  datasourceSubject: Subject<T[]>;

  private dataConstructor: new () => T;
  private dataKeys: any[];


  constructor(
    data: T[],
    dataType?: new () => T,
    private validatorService?: ValidatorService)
  {
    super();

    if (!validatorService)
      this.validatorService = new DefaultValidatorService();

    if (dataType) {
      this.dataConstructor = dataType;
    } else {
      if (data && data.length > 0)
        this.dataKeys = Object.keys(data[0]);
      else
        throw new Error('You must define either a non empty array, or an associated class to build the table.');
    }

    this.rowsSubject = new BehaviorSubject(this.getRowsFromData(data));
    this.datasourceSubject = new Subject<T[]>();

    this.rowsSubject.subscribe(rows => this.updateDatasource(rows));
  }

  confirmEdit(row: TableElement<T>) {
    if (row.validator.valid) {
      const source = this.rowsSubject.getValue();
      source[row.id] = row;
      this.rowsSubject.next(source);
      row.editing = false;
      row.validator.disable();
    }
  }

  confirmCreate(row: TableElement<T>) {
    if (row.validator.valid) {
      const source = this.rowsSubject.getValue();
      row.id = source.length - 1;
      this.rowsSubject.next(source);
      row.editing = false;
      row.validator.disable();
    }
  }

  createNew() {
    const source = this.rowsSubject.getValue();
    if (source.length == 0 || source[source.length - 1].id > -1) {
      source.push(new TableElement({
        id: -1,
        editing: true,
        currentData: this.createNewObject(),
        source: this,
        validator: this.validatorService.getRowValidator(),
      }));
      this.rowsSubject.next(source);
    }
  }

  delete(id: number) {
    const source = this.rowsSubject.getValue();

    const index = id == - 1
    ? (source.length - 1)
    : id;

    source.splice(index, 1);
    this.rowsSubject.next(source);
  }

  getDataFromRows(rows: TableElement<T>[]): T[] {
    return rows
      .filter(row => row.id != -1)
      .map<T>((row) => {
      return row.originalData ? row.originalData : row.currentData;
    });
  }

  updateDatasource(rows: TableElement<T>[]): void {
    this.datasourceSubject.next(this.getDataFromRows(rows));
  }

  getRowsFromData(data: T[]): TableElement<T>[] {
    return data.map<TableElement<T>>((data, index) => {

      const validator = this.validatorService.getRowValidator();
      validator.disable();

      return new TableElement({
        id: index,
        editing: false,
        currentData: data,
        source: this,
        validator: validator,
      })
    });
  }

  createNewObject() {
    if (this.dataConstructor)
      return new this.dataConstructor();
    else {
      return this.dataKeys.reduce((obj, key) => {
        obj[key] = undefined;
        return obj;
      }, {});
    }

  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<TableElement<T>[]> {
    return this.rowsSubject.asObservable();
  }

  disconnect() { }
}
