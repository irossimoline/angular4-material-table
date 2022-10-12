/* tslint:disable:max-line-length */
import {Component, ViewChild} from '@angular/core';
import {Person} from './example-source-code/person-list.validator';
import {PersonListTemplateDrivenComponent} from './example-source-code/person-list-template-driven.component';
import {PersonListReactiveFormsComponent} from './example-source-code/person-list-reative-forms.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {

  @ViewChild('reactiveFormsList') reactiveFormsList: PersonListReactiveFormsComponent;
  @ViewChild('templateDrivenList') templateDrivenList: PersonListTemplateDrivenComponent;

  personList: Person[] = [
    {name: 'Ignacio Rossi', age: 25},
    {name: 'Benoit Lavenier', age: 40},
    {name: 'Ludovic Pecquot', age: 42}
  ];

  personListChanged(personList: Person[]) {
    console.info('New person list:', personList);
    this.reactiveFormsList.dataSource.updateDatasource(personList);
    this.templateDrivenList.dataSource.updateDatasource(personList);
  }
}
