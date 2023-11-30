import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxSpinnerModule } from 'ngx-spinner';
import { MaterialModule } from './material/material.module';
import { NgChartsConfiguration, NgChartsModule } from 'ng2-charts';
import { HttpClientModule } from '@angular/common/http';
import { LaHateCrimeComponent } from './components/la-hate-crime/la-hate-crime.component';
import { LaLapdCrimeComponent } from './components/la-lapd-crime/la-lapd-crime.component';
import { LaRaceDistributionComponent } from './components/la-race-distribution/la-race-distribution.component';


@NgModule({
  declarations: [
    AppComponent,
    LaHateCrimeComponent,
    LaLapdCrimeComponent,
    LaRaceDistributionComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NgxSpinnerModule,
    MaterialModule,
    NgChartsModule,
    HttpClientModule
  ],
  providers: [NgChartsConfiguration],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
