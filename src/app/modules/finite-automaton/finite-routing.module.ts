import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DiagramComponent } from './components/diagram/diagram.component';
import { FiniteComponent } from './finite.component';
import { SimulatorComponent } from './components/simulator/simulator.component';
import { OptionsComponent } from './components/options/options.component';
import { UnsavedChangesGuard } from '../../unsaved-changes.guard';

const routes: Routes = [
  {
    path: 'finite',
    component: FiniteComponent,
    canDeactivate: [UnsavedChangesGuard],
    children: [
      {
        path: '',
        redirectTo: 'diagram',
        pathMatch: 'full'
      },
      {
        path: 'diagram',
        component: DiagramComponent,
        children: [
          {
            path: 'simulator',
            component: SimulatorComponent
          }
        ]
      },
      {
        path: 'options',
        component: OptionsComponent
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FiniteRoutingModule { }
