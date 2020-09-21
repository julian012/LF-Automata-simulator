import { Component } from '@angular/core';
import { AppStateService } from '../../services/app-state.service';

@Component({
  templateUrl: './table.component.html'
})
export class TableComponent {
  constructor(public appStateService: AppStateService) { }
}
