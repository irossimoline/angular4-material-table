## 0.17.0
- [enh] Support Angular 17

## 0.16.0
- [enh] Support Angular 16

## 0.14.4
- [fix] TableDataSource: when opts.editing is undefined, apply the default value

## 0.14.5

- [fix] Fix row id update, when move/insert prepend rows
- [enh] Add `TableDatasource.addMany(array[], insertAt)` to insert many rows
- [enh] Add `TableDatasource.hasNewElement`: boolean to known if there is a new+editing row
- [enh] Add examples, using nav tabs
- [enh] Add `ScrollableTableDataSource` to use CDK virtual scrolling (experimental - not yet exposed)

## 17.0.0
- [enh] Migrate to Angular 17.1

## 17.2.0
- [enh] Migrate to Angular 17.2 

## 17.2.1
- [enh] Add options argument to `row.delete()`, `row.confirmEditCreate()` and `row.cancelOrDelete()`
- [fix] Scrollable : remove duplicated class AsyncTableElement

Inconsistent version (DO NOT USED)

## 17.2.2
- Fix dependency error 

## 17.3.0
- [enh] Migrate to Angular 17.3 

## 18.0.0
- [enh] Migrate to Angular 18 

## 18.0.2
- [fix] `DataSource.createNew()` should always use the value of `insertAt` when equals to 0 (replace `if (insertAt) { /*...*/ }` with `if (insertAt >= 0) { /*...*/ }`) 

## 18.0.3
- [fix] Fix error when calling `DataSource.addMany()` with `insertAt=null`  
