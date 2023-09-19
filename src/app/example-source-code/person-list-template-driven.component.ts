import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {TableDataSource} from '../ngx-material-table/table-data-source';
import {environment} from '../../environments/environment';
import {Person, generatePersons} from './person.model';

@Component({
  selector: 'app-person-list-template-driven',
  templateUrl: './person-list-template-driven.component.html',
})
export class PersonListTemplateDrivenComponent implements OnInit {

  private _displayedColumns = ['id', 'name', 'age', 'actionsColumn'];

  dataSource: TableDataSource<Person>;

  @Input() personList: Person[];
  @Output() personListChange = new EventEmitter<Person[]>();

  get displayedColumns(): string[] {
    if (environment.production) return this._displayedColumns.splice(1) // Remove 'id'
    return this._displayedColumns;
  }

  constructor() { }


  ngOnInit() {
    this.dataSource = new TableDataSource<Person>(this.personList || [],
      Person,
      null, // No validator
      {
        prependNewElements: false,
        suppressErrors: !environment.production
      });

    this.dataSource.datasourceSubject.subscribe(personList => this.personListChange.emit(personList));
  }

  generatePersons = generatePersons;

}
