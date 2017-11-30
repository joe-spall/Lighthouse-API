import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { CrimeDetailsComponent } from './crimes/crime-details/crime-details.component';
import { CrimeListComponent } from './crimes/crime-list/crime-list.component';

@NgModule({
  declarations: [
    AppComponent,
    CrimeDetailsComponent,
    CrimeListComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
