import { DataSource } from '@angular/cdk/collections';

import { BehaviorSubject, Subject, Observable } from 'rxjs';

import { TableElement } from './table-element';
import { ValidatorService } from './validator.service';
import { DefaultValidatorService } from './default-validator.service';

export class TableDataSource<T> extends DataSource<TableElement<T>> {

  protected rowsSubject: BehaviorSubject<TableElement<T>[]>;
  datasourceSubject: Subject<T[]>;

  protected dataConstructor: new () => T;
  protected dataKeys: any[];

  protected currentData: any;

  /**
   * Creates a new TableDataSource instance, that can be used as datasource of `@angular/cdk` data-table.
   * @param data Array containing the initial values for the TableDataSource. If not specified, then `dataType` must be specified.
   * @param dataType Type of data contained by the Table. If not specified, then `data` with at least one element must be specified.
   * @param validatorService Service that create instances of the FormGroup used to validate row fields.
   * @param config Additional configuration for table.
   */
  constructor(
    data: T[],
    dataType?: new () => T,
    private validatorService?: ValidatorService,
    private config = { prependNewElements: false })
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
   * Start the creation of a new element, pushing an empty-data row in the table.
   */
  createNew(): void {
    const source = this.rowsSubject.getValue();

    if (!this.existsNewElement(source)) {

      const newElement = new TableElement({
        id: -1,
        editing: true,
        currentData: this.createNewObject(),
        source: this,
        validator: this.validatorService.getRowValidator(),
      });

      if (this.config.prependNewElements) {
        this.rowsSubject.next([newElement].concat(source));
      } else {
        source.push(newElement);
        this.rowsSubject.next(source);
      }
    }
  }

  /**
   * Confirm creation of the row. Save changes and disable editing.
   * If validation active and row data is invalid, it doesn't confirm creation neither disable editing.
   * @param row Row to be confirmed.
   */
  confirmCreate(row: TableElement<T>): boolean {
    if (!row.validator.valid) {
      return false
    }

    const source = this.rowsSubject.getValue();
    row.id = source.length - 1;
    this.rowsSubject.next(source);

    row.editing = false;
    row.validator.disable();

    this.updateDatasourceFromRows(source);
    return true;
  }

  /**
   * Confirm edition of the row. Save changes and disable editing.
   * If validation active and row data is invalid, it doesn't confirm editing neither disable editing.
   * @param row Row to be edited.
   */
  confirmEdit(row: TableElement<T>): boolean {
    if (!row.validator.valid) {
      return false;
    }

    const source = this.rowsSubject.getValue();
    const index = this.getIndexFromRowId(row.id, source);

    source[index] = row;
    this.rowsSubject.next(source);

    row.originalData = undefined;
    row.editing = false;
    row.validator.disable();

    this.updateDatasourceFromRows(source);
    return true;
  }

  /**
   * Delete the row with the index specified.
   */
  delete(id: number): void {
    const source = this.rowsSubject.getValue();
    const index = this.getIndexFromRowId(id, source);

    source.splice(index, 1);
    this.updateRowIds(index, source);

    this.rowsSubject.next(source);

    if (id != -1)
      this.updateDatasourceFromRows(source);
  }

  /**
 * Get row from the table.
 * @param id Id of the row to retrieve, -1 returns the current new line.
 */
  getRow(id: number): TableElement<T> {
    const source = this.rowsSubject.getValue();
    const index = this.getIndexFromRowId(id, source);

    return (index >= 0 && index < source.length) ? source[index] : null;
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
  updateDatasource(data: T[], options = { emitEvent: true }): void {
    if (this.currentData !== data) {
      this.currentData = data;
      this.rowsSubject.next(this.getRowsFromData(data))

      if (options.emitEvent)
        this.datasourceSubject.next(data);
    }
  }


  /**
   * Checks the existance of the a new row (not yet saved).
   * @param source
   */
  protected existsNewElement(source: TableElement<T>[]): boolean {
      return !(source.length == 0 || source[this.getNewRowIndex(source)].id > -1)
  }

  /**
   * Returns the possible index of the new row depending on the insertion type.
   * It doesn't imply that the new row is created, that must be checked.
   * @param source
   */
  protected getNewRowIndex(source): number {
    if (this.config.prependNewElements)
      return 0;
    else
      return source.length - 1;
  }

  /**
   * Returns the row id from the index specified. It does
   * not consider if the new row is present or not, assumes
   * that new row is not present.
   * @param index Index of the array.
   * @param count Quantity of elements in the array.
   */
  protected getRowIdFromIndex(index: number, count: number): number {
    if (this.config.prependNewElements)
      return count - 1 - index;
    else
      return index;
  }

  /**
   * Returns the index from the row id specified.
   * It takes into account if the new row exists or not.
   * @param id
   * @param source
   */
  protected getIndexFromRowId(id: number, source: TableElement<T>[]): number {
    if(id == -1) {
      return this.existsNewElement(source) ? this.getNewRowIndex(source) : -1;
    } else {
      if (this.config.prependNewElements)
          return source.length - 1 - id;
      else
        return id;
    }
  }

  /**
   * Update rows ids in the array specified, starting in the specified index
   * until the start/end of the array, depending on config.prependNewElements
   * configuration.
   * @param initialIndex Initial index of source to be updated.
   * @param source Array that contains the rows to be updated.
   */
  protected updateRowIds(initialIndex: number, source: TableElement<T>[]): void {

    const delta = this.config.prependNewElements ? -1 : 1;

    for (let index = initialIndex; index < source.length && index >= 0; index += delta) {
      if (source[index].id != -1)
        source[index].id = this.getRowIdFromIndex(index, source.length);
    }
  }

  /**
   * Get the data from the rows.
   * @param rows Rows to extract the data.
   */
  protected getDataFromRows(rows: TableElement<T>[]): T[] {
    return rows
      .filter(row => row.id != -1)
      .map<T>((row) => {
      return row.originalData ? row.originalData : row.currentData;
    });
  }

  /**
   * Update the datasource with the data contained in the specified rows.
   * @param rows Rows that contains the datasource's new data.
   */
  protected updateDatasourceFromRows(rows: TableElement<T>[]): void {
    this.currentData = this.getDataFromRows(rows);
    this.datasourceSubject.next(this.currentData);
  }

  /**
   * From an array of data, it returns rows containing the original data.
   * @param arrayData Data from which create the rows.
   */
  protected getRowsFromData(arrayData: T[]): TableElement<T>[] {
    return arrayData.map<TableElement<T>>((data, index) => {

      const validator = this.validatorService.getRowValidator();
      validator.disable();

      return new TableElement({
        id: this.getRowIdFromIndex(index, arrayData.length),
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
  protected createNewObject(): T {
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
