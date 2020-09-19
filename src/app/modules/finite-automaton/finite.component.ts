import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProjectComponent } from '../../project.component';
import { FiniteAutomaton } from './entities/finite-automaton';

@Component({
  templateUrl: './finite.component.html'
})
export class FiniteComponent extends ProjectComponent implements OnInit, OnDestroy {

  ngOnInit() {
    super.ngOnInit();
    this.newProject(new FiniteAutomaton(true), 'File 1', '/finite/options');
  }
}
