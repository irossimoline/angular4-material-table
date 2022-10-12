import {ValidatorService} from '../ngx-material-table/validator.service';
import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import { PersonValidatorService } from './person-list.validator';
import {TableDataSource} from '../ngx-material-table/table-data-source';
import {environment} from '../../environments/environment';
import {Person} from './person.model';

@Component({
  selector: 'app-person-list-reactive-forms',
  providers: [
    {provide: ValidatorService, useClass: PersonValidatorService }
  ],
  templateUrl: './person-list-reactive-forms.component.html'
})
export class PersonListReactiveFormsComponent implements OnInit {

  constructor(private personValidator: ValidatorService) { }

  displayedColumns = ['name', 'age', 'actionsColumn'];

  @Input() personList: Person[];
  @Output() personListChange = new EventEmitter<Person[]>();

  dataSource: TableDataSource<Person>;

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
}
