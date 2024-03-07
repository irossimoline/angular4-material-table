import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BasicExampleComponent } from './example-source-code/basic-example.component';
import { PersonListScrollableComponent } from './example-source-code/person-list-scrollable.component';
import { PersonListAsyncReactiveFormsComponent } from './example-source-code/person-list-async-reative-forms.component'; // CLI imports router

const routes: Routes = [
  { path: '', component: BasicExampleComponent },
  { path: 'async', component: PersonListAsyncReactiveFormsComponent },
  { path: 'scrollable', component: PersonListScrollableComponent },
];

// configures NgModule imports and exports
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
