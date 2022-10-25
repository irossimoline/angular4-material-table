import {CollectionViewer, DataSource, ListRange} from '@angular/cdk/collections';
import {BehaviorSubject, Observable, Subject, Subscription} from 'rxjs';
import {TableElementFactory} from './table-element.factory';
import {ValidatorService} from './validator.service';
import {TableElement} from './table-element';
import {filter, map} from 'rxjs/operators';
import {moveItemInArray} from '@angular/cdk/drag-drop';
import {UntypedFormGroup} from '@angular/forms';

/**
 * TableDataSourceConfig:
 * prependNewElements: if true, the new row is prepended to all other rows; otherwise it is appended
 * suppressErrors: if true, no error log
 * restoreOriginalDataOnCancel: if true, canceling a row will restore the original data, otherwise, previous data is restored
 **/
export interface TableDataSourceConfig {
  prependNewElements?: boolean;
  suppressErrors?: boolean;
  restoreOriginalDataOnCancel?: boolean;
}

export class TableDataSource<T,
  V extends ValidatorService = ValidatorService,
  C extends TableDataSourceConfig = TableDataSourceConfig,
  R extends TableElement<T> = TableElement<T>
  > extends DataSource<R> {

  /**
   * Return the data array, of confirmed rows (currentData)
   */
  datasourceSubject: Subject<T[]>;

  /**
   * Return all existing rows. Please use connect() instead
   */
  rowsSubject: BehaviorSubject<R[]>;

  protected dataConstructor: new () => T;
  protected dataKeys: any[];
  protected connectedViewers: {
    viewer: CollectionViewer;
    subscription: Subscription;
    range: ListRange;
  }[] = [];
  protected currentData: any;
  private readonly _config: C;
  private _newElement: R = null;

  get config(): C {
    return this._config;
  }

  /**
   * Say if there is a new (and not confirmed) row
   * @param source
   */
  get hasNewElement(): boolean {
    return !!this._newElement;
  }

  /**
   * Creates a new TableDataSource instance, that can be used as datasource of `@angular/cdk` data-table.
   * @param data Array containing the initial values for the TableDataSource. If not specified, then `dataType` must be specified.
   * @param dataType Type of data contained by the Table. If not specified, then `data` with at least one element must be specified.
   * @param validatorService Service that create instances of the UntypedFormGroup used to validate row fields.
   * @param config Additional configuration for table.
   */
  constructor(
    data: T[],
    dataType?: new () => T,
    protected validatorService?: V,
    config?: C) {
    super();

    this._config = {
      prependNewElements: false,
      suppressErrors: false,
      restoreOriginalDataOnCancel: false,
      ...config
    };

    if (dataType) {
      this.dataConstructor = dataType;
    } else {
      if (data && data.length > 0) {
        this.dataKeys = Object.keys(data[0]);
      } else {
        throw new Error('You must define either a non empty array, or an associated class to build the table.');
      }
    }

    this.checkValidatorFields();

    this.datasourceSubject = new Subject<T[]>();
    const rows = this.createRowsFromData(data);
    this.rowsSubject = new BehaviorSubject(rows);
  }

  protected checkValidatorFields() {
    if (this._config.suppressErrors) return; // Skip, as error will not be logged

    const formGroup = this.createRowValidator();
    if (formGroup != null) {
      const rowKeys = Object.keys(this.createNewObject());
      const invalidKeys = Object.keys(formGroup.controls).filter(key => !rowKeys.some(x => x === key));
      if (invalidKeys.length > 0) {
        console.error('Validator form control keys must match row object keys. Invalid keys: ' + invalidKeys.toString());
      }
    }
  }

  /**
   * Start the creation of a new element, pushing an empty-data row in the table.
   * @param insertAt: insert the new element at specified position
   * @param options
   */
  async createNew(insertAt?: number, options?: {editing?: boolean, originalData?: T, emitEvent?: boolean;}): Promise<R|undefined> {
    if (this.hasNewElement) {
      if (!this._config.suppressErrors) {
        console.warn('Cannot add new row, because already has nex row. Please confirm it first');
      }
      return; // Cannot add if still have some new element
    }

    const rows = this.rowsSubject.getValue();

    const [currentData, validator] = [options?.originalData || this.createNewObject(), this.createRowValidator({editing: options?.editing})];

    const editing = (options?.editing !== false); // true by default
    const id = editing ? -1 : this.getRowIdFromIndex(rows.length, rows.length + 1);
    const newElement = TableElementFactory.createTableElement({
      id,
      editing,
      currentData,
      validator,
      // Link to datasource
      source: this
    });

    if (insertAt) {
      rows.splice(insertAt, 0, newElement);
      this.rowsSubject.next(rows);
    } else {
      if (this._config.prependNewElements) {
        this.rowsSubject.next([newElement].concat(rows));
      } else {
        rows.push(newElement);
        this.rowsSubject.next(rows);
      }
    }

    // New row is not confirmed: remember it
    if (editing) {
      this._newElement = newElement;
    }

    // Notify the changes
    else if (!options || options.emitEvent !== false){
      this.datasourceSubject.next(this.getDataFromRows(rows));
    }

    return newElement;
  }


  /**
   * Pushing new data row in the table.
   * @param originalData data to insert
   * @param insertAt: insert the new element at specified position
   * @param options
   */
  async addMany(originalData: T[], insertAt?: number, options?: {editing?: boolean, emitEvent?: boolean}): Promise<R[]|undefined> {
    if (this.hasNewElement) {
      if (!this._config.suppressErrors) {
        console.warn('Cannot add new row, because already has nex row. Please confirm it first');
      }
      return; // Cannot add if still have some new element
    }

    const editing = options?.editing === true; // false by default

    // Create new rows:
    // WARNING: ids will be bad. Need to be recomputed (see bellow)
    const newElements = this.createRowsFromData(originalData, {editing});

    // Retrieve actual rows array
    let rows = this.rowsSubject.getValue();

    // Insert into rows array
    if (insertAt) {
      rows.splice(insertAt, 0, ...newElements);
      const refreshStartIndex = this._config.prependNewElements ? insertAt + newElements.length - 1 : insertAt;
      this.updateRowIds(refreshStartIndex, rows);
    } else {
      if (this._config.prependNewElements) {
        rows = newElements.concat(...rows);
        this.updateRowIds(newElements.length, rows);
      } else {
        rows = rows.concat(...newElements);
        this.updateRowIds(rows.length - newElements.length, rows);
      }
    }

    this.rowsSubject.next(rows);

    if (editing) {
      // New rows are still editing: do not emit changes
    }

    // New rows have been confirmed: notify changes
    else if (!options || options.emitEvent !== false){
      this.updateDatasourceFromRows(this.rowsSubject.getValue());
    }

    return newElements;
  }

  confirmEditCreate(row: R, options = {emitEvent: true}): boolean {
    if (row.id === -1) {
      return this.confirmCreate(row, options);
    } else {
      return this.confirmEdit(row, options);
    }
  }

  cancelOrDelete(row: R, options = {emitEvent: true}): boolean {
    if (row.id === -1 || !row.editing) {
      return this.delete(row.id, options);
    } else {
      return this.cancel(row);
    }
  }

  /**
   * Confirm creation of the row. Save changes and disable editing.
   * If validation active and row data is invalid, it doesn't confirm creation neither disable editing.
   * @param row Row to be confirmed.
   * @param options Use emitEvent=false to avoid 'datasourceSubject' to be updated
   */
  confirmCreate(row: R, options = {emitEvent: true}): boolean {
    const valid = row.isValid();
    if (!valid) {
      return false;
    }

    const source = this.rowsSubject.getValue();
    row.id = source.length - 1;
    this._newElement = null;
    this.rowsSubject.next(source);
    row.editing = false;

    if (!options || options.emitEvent != false) {
      this.updateDatasourceFromRows(source);
    }

    return true;
  }

  /**
   * Confirm edition of the row. Save changes and disable editing.
   * If validation active and row data is invalid, it doesn't confirm editing neither disable editing.
   * @param row Row to be edited.
   * @param options Use emitEvent=false to avoid 'datasourceSubject' to be updated
   */
  confirmEdit(row: R, options = {emitEvent: true}): boolean {
    const valid = row.isValid();
    if (!valid) {
      return false;
    }

    const source = this.rowsSubject.getValue();
    const index = this.getIndexFromRowId(row.id, source);

    source[index] = row;
    this.rowsSubject.next(source);

    // Reset backup data
    if (!this._config.restoreOriginalDataOnCancel) {
      row.originalData = undefined;
    }
    row.editing = false;

    if (!options || options.emitEvent !== false) {
      this.updateDatasourceFromRows(source);
    }
    return true;
  }

  startEdit(row: R): boolean {
    if (row.editing) return true; // Already editing

    // Save the original data, to be able to cancel changes
    if (!row.originalData || !this._config.restoreOriginalDataOnCancel) {
      row.originalData = row.cloneData();
    }
    row.editing = true;
    return true;
  }

  /**
   * Delete the row with the index specified.
   */
  delete(id: number, options = {emitEvent: true}): boolean {
    const source = this.rowsSubject.getValue();
    const index = this.getIndexFromRowId(id, source);

    source.splice(index, 1);
    this.updateRowIds(index, source);

    if (id === -1) this._newElement = null; // Forget the new element

    this.rowsSubject.next(source);

    if (id !== -1 && (!options || options.emitEvent !== false)) {
      this.updateDatasourceFromRows(source);
    }

    return true;
  }

  /**
   * Restore the original data
   * @param row
   */
  cancel(row: R): boolean {
    if (row.id === -1) throw new Error('Cannot cancel a newly created row. Please use delete() or cancelOrDelete() instead');
    if (!row.editing) throw new Error('Cannot cancel a not editing row. Please use delete() or cancelOrDelete() instead');

    row.currentData = row.originalData;
    row.editing = false;

    // Mark row as pristine (if content was restored from original data)
    if (row.validator && this._config.restoreOriginalDataOnCancel) {
      row.validator.markAsPristine();
    }

    return true;
  }

  /**
   * Move a row up or down
   * @param id Id of the row
   * @param direction Direction: negative value for up, positive value for down
   */
  move(id: number, direction: number): boolean {
    if (!direction) return false;

    const source = this.rowsSubject.getValue();
    const index = this.getIndexFromRowId(id, source);

    moveItemInArray(source, index, index + direction);

    const refreshStartIndex = this._config.prependNewElements
      ? Math.max(index, index + direction)
      : Math.min(index, index + direction);
    this.updateRowIds(refreshStartIndex, source);

    this.rowsSubject.next(source);

    if (id !== -1) {
      this.updateDatasourceFromRows(source);
    }
    return true;
  }

  async confirmAllRows( options = {emitEvent: true}): Promise<boolean> {
    return this.confirmRows(this.rowsSubject.getValue(), options)
  }

  async confirmRows(source: R[], options = {emitEvent: true}): Promise<boolean> {

    // Get editing rows
    const editingRows = this.getEditingRows(source);
    if (editingRows.length === 0) return true; // No row to confirm

    // Try to confirm each rows
    const confirmResults = editingRows
      .map(row => this.confirmEditCreate(row,
        {emitEvent: false /* Avoid calling updateDatasourceFromRows() here, to make sure to call it once, just after */}
      ));

    // Update datasource, if some rows has been confirmed (=changed)
    const confirmedRowCount = confirmResults.filter(ok => ok).length
    if (confirmedRowCount > 0 && (!options || options.emitEvent !== false)) {
      this.updateDatasourceFromRows(this.rowsSubject.getValue())
    }

    // Return if all rows has been confirmed
    return confirmedRowCount === confirmResults.length;
  }

  /**
   * Get row from the table.
   * @param id Id of the row to retrieve, -1 returns the current new line.
   */
  getRow(id: number): R {
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
  updateDatasource(data: T[], options = {emitEvent: true}): void {
    if (this.currentData !== data) {
      this.currentData = data;

      const rows = this.createRowsFromData(data);
      this.rowsSubject.next(rows);

      if (!options || options.emitEvent !== false) {
        this.datasourceSubject.next(data);
      }
    }
  }

  /**
   * Checks the existence of the a new row (not yet saved).
   * @param source
   */
  protected existsNewElement(source: R[]): boolean {
    return source.length > 0 && this.getNewRowIndex(source) > -1;
  }

  /**
   * Get editing rows
   */
  protected getEditingRows(source: R[]): R[] {
    return source.filter(row => row.editing);
  }

  /**
   * Returns the possible index of the new row depending on the insertion type.
   * It doesn't imply that the new row is created, that must be checked.
   * @param source
   */
  protected getNewRowIndex(source: R[]): number {
    return this.getIndexFromRowId(-1, source);
  }

  /**
   * Returns the row id from the index specified. It does
   * not consider if the new row is present or not, assumes
   * that new row is not present.
   * @param index Index of the array.
   * @param count Quantity of elements in the array.
   */
  protected getRowIdFromIndex(index: number, count: number): number {
    if (this._config.prependNewElements) {
      return count - 1 - index;
    } else {
      return index;
    }
  }

  /**
   * Returns the index from the row id specified.
   * It takes into account if the new row exists or not.
   * @param id
   * @param source
   */
  protected getIndexFromRowId(id: number, source: R[]): number {
    return source.findIndex(element => element.id === id);
  }

  /**
   * Update rows ids in the array specified, starting in the specified index
   * until the start/end of the array, depending on config.prependNewElements
   * configuration.
   * @param initialIndex Initial index of source to be updated.
   * @param source Array that contains the rows to be updated.
   */
  protected updateRowIds(initialIndex: number, source: R[]): void {

    const delta = this._config.prependNewElements ? -1 : 1;

    for (let index = initialIndex; index < source.length && index >= 0; index += delta) {
      if (source[index].id !== -1) {
        // DEBUG
        //const newId = this.getRowIdFromIndex(index, source.length);
        //console.debug(`Updating row id ${source[index].id} -> ${newId}`);
        source[index].id = this.getRowIdFromIndex(index, source.length);
      }
    }
  }

  /**
   * Get the data from the rows.
   * @param rows Rows to extract the data.
   */
  protected getDataFromRows(rows: R[]): T[] {
    const mapToDataFn = !this._config.restoreOriginalDataOnCancel
        ? (row => row.originalData || row.currentData)
        : (row => row.currentData) // Always return currentData, if orginalData is NOT update at each edition
    return rows
      .filter(row => row.id !== -1)
      .map<T>(mapToDataFn);
  }

  /**
   * Update the datasource with the data contained in the specified rows.
   * @param rows Rows that contains the datasource's new data.
   */
  protected updateDatasourceFromRows(rows: R[]): void {
    this.currentData = this.getDataFromRows(rows);
    this.datasourceSubject.next(this.currentData);
  }

  /**
   * From an array of data, it returns rows containing the original data.
   * @param arrayData Data from which create the rows.
   * @param options
   */
  protected createRowsFromData(arrayData: T[], options = {editing : false}): R[] {

    // Create many validators (batch mode)
    const validators = this.createRowValidators(arrayData.length);

    const editing  = options.editing === true; // false by default (e.g. when initial data)

    return arrayData.map<R>((data, index) => {
      return TableElementFactory.createTableElement({
        id: this.getRowIdFromIndex(index, arrayData.length),
        editing,
        currentData: data,
        validator: validators[index],
        // Link to datasource
        source: this
      });
    });
  }

  /**
   * Create a new object with identical structure than the table source data.
   * It uses the object's type constructor if available, otherwise it creates
   * an object with the same keys of the first element contained in the original
   * datasource (used in the constructor).
   */
  protected createNewObject(): T {
    if (this.dataConstructor) {
      return new this.dataConstructor();
    } else {
      return this.dataKeys.reduce((obj, key) => {
        obj[key] = undefined;
        return obj;
      }, {});
    }
  }

  protected createRowValidator(options = {editing: true}): UntypedFormGroup {
    if (!this.validatorService) return null;
    const validator = this.validatorService.getRowValidator();

    // Disable if ask
    if (options.editing === false && validator.enabled) {
      validator.disable();
    }
    return validator;
  }

  /**
   * Create many validators (batch mode)
   * @param count
   * @param options
   * @protected
   */
  protected createRowValidators(count: number, options = {editing: false}): UntypedFormGroup[] {
    const validators = new Array<UntypedFormGroup>(count);
    for (let i = 0; i<count; i++) {
      validators[i] = this.createRowValidator(options);
    }
    return validators;
  }

  /** Connect function called by the table to retrieve one stream containing
   *  the data to render. */
  connect(collectionViewer: CollectionViewer): Observable<R[] | ReadonlyArray<R>> {
    // No collection viewer: return all data
    if (!collectionViewer) {
      return this.rowsSubject.asObservable();
    }

    const range: ListRange = {
      start: 0,
      end: -1
    };
    this.connectedViewers.push({
      viewer: collectionViewer,
      range,
      subscription: collectionViewer.viewChange.subscribe(r => {
        range.start = r.start;
        range.end = r.end;
      })
    });
    return this.rowsSubject.asObservable()
      .pipe(
        filter(data => data !== null && data !== undefined),
        map(data => {
          if (range.start > 0) {
            if (range.end > range.start) {
              return data.slice(range.start, range.end);
            }
            return data.slice(range.start);
          }
          if (range.end < data.length) {
            return data.slice(0, range.end);
          }
          return data;
        })
      );


  }

  disconnect(collectionViewer: CollectionViewer) {
    if (collectionViewer) {
      const refIndex = this.connectedViewers.findIndex(r => r.viewer === collectionViewer);
      if (refIndex !== -1) {
        const ref = this.connectedViewers.splice(refIndex, 1)[0];
        ref.subscription.unsubscribe();
      }
    }

    // Destroy observables
    if (this.connectedViewers.length === 0) {
      this.rowsSubject.complete();
      this.datasourceSubject.complete();
    }
  }
}
