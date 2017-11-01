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

  private currentData: any;

  /**
   * Creates a new TableDataSource instance, that can be used as datasource of `@angular/cdk` data-table.
   * @param data Array containing the initial values for the TableDataSource. If not specified, then `dataType` must be specified.
   * @param dataType Type of data contained by the Table. If not specified, then `data` with at least one element must be specified.
   * @param validatorService Service that create instances of the FormGroup used to validate row fields.
   */
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
  }

  /**
   * Confirm edition of the row. Save changes and disable editing.
   * If validation active and row data is invalid, it doesn't confirm editing neither disable editing.
   * @param row Row to be edited.
   */
  confirmEdit(row: TableElement<T>) {
    if (row.validator.valid) {
      const source = this.rowsSubject.getValue();
      source[row.id] = row;
      this.rowsSubject.next(source);

      row.editing = false;
      row.validator.disable();

      this.updateDatasourceFromRows(source);
    }
  }

  /**
   * Confirm creation of the row. Save changes and disable editing.
   * If validation active and row data is invalid, it doesn't confirm creation neither disable editing.
   * @param row Row to be confirmed.
   */
  confirmCreate(row: TableElement<T>) {
    if (row.validator.valid) {
      const source = this.rowsSubject.getValue();
      row.id = source.length - 1;
      this.rowsSubject.next(source);

      row.editing = false;
      row.validator.disable();

      this.updateDatasourceFromRows(source);
    }
  }

  /**
   * Start the creation of a new element, pushing an empty-data row in the table.
   */
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

  /**
   * Delete the row with the index specified.
   */
  delete(id: number) {
    const source = this.rowsSubject.getValue();

    const index = id == - 1
    ? (source.length - 1)
    : id;

    source.splice(index, 1);
    this.rowsSubject.next(source);

    if(id != -1)
      this.updateDatasourceFromRows(source);
  }

  /**
   * Get the data from the rows.
   * @param rows Rows to extract the data.
   */
  private getDataFromRows(rows: TableElement<T>[]): T[] {
    return rows
      .filter(row => row.id != -1)
      .map<T>((row) => {
      return row.originalData ? row.originalData : row.currentData;
    });
  }


  /**
   * Update the datasource with a new array of data. If the array reference
   * is the same as the previous one, it doesn't trigger an update.
   * @param data Data to update the table datasource.
   * @param options Specify options to update the datasource.
   * If emitEvent is true and the datasource is updated, it emits an event
   * from 'datasourceSubject' with the updated data. If false, it doesn't
   * emit an event. True by default.
   */
  updateDatasource(data: T[], options= { emitEvent: true } ) {
    if(this.currentData !== data) {
      this.currentData = data;
      this.rowsSubject.next(this.getRowsFromData(data))
      
      if(options.emitEvent)
        this.datasourceSubject.next(data);
    }
  }

  /**
   * Update the datasource with the data contained in the specified rows.
   * @param rows Rows that contains the datasource's new data.
   */
  private updateDatasourceFromRows(rows: TableElement<T>[]): void {
    this.currentData = this.getDataFromRows(rows);
    this.datasourceSubject.next(this.currentData);
  }

  /**
   * From an array of data, it returns rows containing the original data.
   * @param data Data from which create the rows.
   */
  private getRowsFromData(data: T[]): TableElement<T>[] {
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

  /**
   * Create a new object with identical structure than the table source data.
   * It uses the object's type contructor if available, otherwise it creates
   * an object with the same keys of the first element contained in the original
   * datasource (used in the constructor).
   */
  private createNewObject() {
    if (this.dataConstructor)
      return new this.dataConstructor();
    else {
      return this.dataKeys.reduce((obj, key) => {
        obj[key] = undefined;
        return obj;
      }, {});
    }

  }

  /** Connect function called by the table to retrieve one stream containing
   *  the data to render. */
  connect(): Observable<TableElement<T>[]> {
    return this.rowsSubject.asObservable();
  }

  disconnect() { }
}
