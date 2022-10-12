import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {TableDataSource} from '../ngx-material-table/table-data-source';
import {environment} from '../../environments/environment';
import {Person} from './person.model';

@Component({
  selector: 'app-person-list-template-driven',
  templateUrl: './person-list-template-driven.component.html',
})
export class PersonListTemplateDrivenComponent implements OnInit {

  displayedColumns = ['name', 'age', 'actionsColumn'];
  dataSource: TableDataSource<Person>;

  @Input() personList: Person[];
  @Output() personListChange = new EventEmitter<Person[]>();


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
}
