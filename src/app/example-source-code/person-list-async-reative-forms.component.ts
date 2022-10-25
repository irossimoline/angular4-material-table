import {ValidatorService} from '../ngx-material-table/validator.service';
import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {environment} from '../../environments/environment';
import {generatePersons, Person} from './person.model';
import {AsyncPersonValidatorService} from './person-list-async.validator';
import {AsyncTableDataSource} from '../ngx-material-table/async/async-table-data-source';

@Component({
  selector: 'app-person-list-async-reactive-forms',
  templateUrl: './person-list-async-reactive-forms.component.html',
  providers: [
    {provide: ValidatorService, useClass: AsyncPersonValidatorService }
  ]
})
export class PersonListAsyncReactiveFormsComponent implements OnInit {

  constructor(private personValidator: ValidatorService) { }

  _displayedColumns = ['id', 'name', 'age', 'actionsColumn'];

  @Input() personList: Person[];
  @Output() personListChange = new EventEmitter<Person[]>();

  dataSource: AsyncTableDataSource<Person>;

  get displayedColumns(): string[] {
    if (environment.production) return this._displayedColumns.splice(1) // Remove 'id'
    return this._displayedColumns;
  }

  ngOnInit() {
    this.dataSource = new AsyncTableDataSource<Person>(this.personList || [],
      Person,
      this.personValidator,
      {
        prependNewElements: false,
        suppressErrors: !environment.production
      });

    this.dataSource.datasourceSubject.subscribe(personList => this.personListChange.emit(personList));
  }

  generatePersons = generatePersons;
}
