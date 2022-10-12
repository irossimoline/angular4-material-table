/* tslint:disable:max-line-length */
import {Component, ViewChild} from '@angular/core';
import {PersonListTemplateDrivenComponent} from './example-source-code/person-list-template-driven.component';
import {PersonListReactiveFormsComponent} from './example-source-code/person-list-reative-forms.component';
import {Person} from './example-source-code/person.model';
import {PersonListAsyncReactiveFormsComponent} from './example-source-code/async/person-list-async-reative-forms.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {

  @ViewChild('reactiveFormsList') reactiveFormsList: PersonListReactiveFormsComponent;
  @ViewChild('reactiveFormsListAsync') reactiveFormsListAsync: PersonListAsyncReactiveFormsComponent;
  @ViewChild('templateDrivenList') templateDrivenList: PersonListTemplateDrivenComponent;

  personList: Person[] = [
    {name: 'Ignacio Rossi', age: 25},
    {name: 'Benoit Lavenier', age: 40},
    {name: 'Ludovic Pecquot', age: 42}
  ];

  personListChanged(personList: Person[]) {
    console.info('New person list:', personList);
    this.reactiveFormsList.dataSource.updateDatasource(personList);
    this.reactiveFormsListAsync.dataSource.updateDatasource(personList);
    this.templateDrivenList.dataSource.updateDatasource(personList);
  }
}
