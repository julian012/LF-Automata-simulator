import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FiniteRoutingModule } from './finite-routing.module';

import { FiniteComponent } from './finite.component';
import { DiagramComponent } from './components/diagram/diagram.component';
import { TableComponent } from './components/table/table.component';
import { SimulatorComponent } from './components/simulator/simulator.component';
import { OptionsComponent } from './components/options/options.component';



@NgModule({
  declarations: [
    FiniteComponent,
    DiagramComponent,
    TableComponent,
    SimulatorComponent,
    OptionsComponent,
  ],
  imports: [
    BrowserModule,
    FiniteRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [
    FiniteComponent
  ]
})
export class FiniteModule { }
