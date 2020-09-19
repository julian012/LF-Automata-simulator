import { Component, OnInit } from '@angular/core';
import { AppStateService } from './modules/finite-automaton/services/app-state.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  constructor(public appStateService: AppStateService) { }

  ngOnInit() {
    this.appStateService.registerAppComponent(this);
  }
}
