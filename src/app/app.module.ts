import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {BrowserModule} from '@angular/platform-browser';
import {MatTableModule} from '@angular/material/table';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {PersonListReactiveFormsComponent} from './example-source-code/person-list-reative-forms.component';
import {PersonListTemplateDrivenComponent} from './example-source-code/person-list-template-driven.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {PersonListAsyncReactiveFormsComponent} from './example-source-code/person-list-async-reative-forms.component';
import {PersonListScrollableComponent} from './example-source-code/person-list-scrollable.component';
import {BasicExampleComponent} from './example-source-code/basic-example.component';
import {AppRoutingModule} from './app-routing.module';
import {MatTabsModule} from '@angular/material/tabs';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {TableVirtualScrollModule} from 'ng-table-virtual-scroll';

@NgModule({
  declarations: [
    AppComponent,

    BasicExampleComponent,
    PersonListReactiveFormsComponent,
    PersonListAsyncReactiveFormsComponent,
    PersonListTemplateDrivenComponent,
    PersonListScrollableComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    ScrollingModule,
    AppRoutingModule,
    TableVirtualScrollModule,

    // Example dependencies
    MatInputModule,
    MatTableModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTabsModule,
  ],
  exports: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
