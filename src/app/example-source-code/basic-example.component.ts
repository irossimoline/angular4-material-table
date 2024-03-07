import { Component, ViewChild } from '@angular/core';
import { generatePersons, Person } from './person.model';
import { PersonListAsyncReactiveFormsComponent } from './person-list-async-reative-forms.component';
import { PersonListTemplateDrivenComponent } from './person-list-template-driven.component';
import { PersonListReactiveFormsComponent } from './person-list-reative-forms.component';

@Component({
  selector: 'app-basic-example',
  templateUrl: './basic-example.component.html',
})
export class BasicExampleComponent {
  personList = generatePersons();

  @ViewChild('reactiveFormsList') reactiveFormsList: PersonListReactiveFormsComponent;
  @ViewChild('reactiveFormsListAsync') reactiveFormsListAsync: PersonListAsyncReactiveFormsComponent;
  @ViewChild('templateDrivenList') templateDrivenList: PersonListTemplateDrivenComponent;

  personListChanged(personList: Person[]) {
    console.info('New person list:', personList);
    this.reactiveFormsList.dataSource.updateDatasource(personList);
    this.templateDrivenList.dataSource.updateDatasource(personList);
  }
}
