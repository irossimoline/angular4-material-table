import {ValidatorService} from '../ngx-material-table/validator.service';
import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import { PersonValidatorService } from './person-list.validator';
import {TableDataSource} from '../ngx-material-table/table-data-source';
import {environment} from '../../environments/environment';
import {generatePersons, Person} from './person.model';

@Component({
  selector: 'app-person-list-reactive-forms',
  templateUrl: './person-list-reactive-forms.component.html',
  providers: [
    {provide: ValidatorService, useClass: PersonValidatorService }
  ]
})
export class PersonListReactiveFormsComponent implements OnInit {

  constructor(private personValidator: ValidatorService) { }

  _displayedColumns = ['id', 'name', 'age', 'actionsColumn'];

  @Input() personList: Person[];
  @Output() personListChange = new EventEmitter<Person[]>();

  dataSource: TableDataSource<Person>;

  get displayedColumns(): string[] {
    if (environment.production) return this._displayedColumns.splice(1); // Remove 'id'
    return this._displayedColumns;
  }

  ngOnInit() {
    this.dataSource = new TableDataSource<Person>(this.personList || [],
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
