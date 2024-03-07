import { ValidatorService } from '../ngx-material-table/validator.service';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PersonValidatorService } from './person-list.validator';
import { environment } from '../../environments/environment';
import { generatePersons, Person } from './person.model';
import { ScrollableTableDataSource } from '../ngx-material-table/scrollable/scrollable-table-data-source';
import { AsyncTableElement } from '../ngx-material-table/scrollable/async-table-element';

@Component({
  selector: 'app-person-list-scrollable',
  templateUrl: './person-list-scrollable.component.html',
  styleUrls: ['./person-list-scrollable.component.scss'],
  providers: [{ provide: ValidatorService, useClass: PersonValidatorService }],
})
export class PersonListScrollableComponent implements OnInit {
  private _displayedColumns = ['id', 'name', 'age', 'actionsColumn'];

  get displayedColumns(): string[] {
    if (environment.production) return this._displayedColumns.splice(1); // Remove 'id'
    return this._displayedColumns;
  }

  @Input() personList: Person[];
  @Output() personListChange = new EventEmitter<Person[]>();

  dataSource: ScrollableTableDataSource<Person>;

  constructor(private personValidator: ValidatorService) {
    this.personList = generatePersons(10000);
  }

  ngOnInit() {
    this.dataSource = new ScrollableTableDataSource<Person>(this.personList || [], Person, this.personValidator, {
      prependNewElements: false,
      suppressErrors: !environment.production,
    });

    this.dataSource.datasourceSubject.subscribe((personList) => this.personListChange.emit(personList));
  }

  trackByFn(index: number, row: AsyncTableElement<Person>) {
    return row.id;
  }

  generatePersons = generatePersons;

  async addRow() {
    return await this.dataSource.createNew();
  }
}
