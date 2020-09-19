import { Component, OnInit, OnDestroy } from '@angular/core';
import { Project, Metadata } from './modules/finite-automaton/entities/project';
import { AppStateService } from './modules/finite-automaton/services/app-state.service';
import { Subscription } from 'rxjs/Subscription';
import { ToolEvent } from './modules/finite-automaton/components/toolbar/toolbar.component';
import { Router } from '@angular/router';

@Component({
  template: 'You shouldn\'t be seeing this.'
})
export class ProjectComponent implements OnInit, OnDestroy {
  private subscription: Subscription;
  project: Project;

  constructor(public appStateService: AppStateService,
    protected router: Router) { }


  ngOnInit() {
    this.subscription = this.appStateService.toolbarClickedStream.subscribe(($event) => {
      this.onToolClicked($event);
    });
  }

  ngOnDestroy() {
    this.appStateService.closeActiveProject();
    this.subscription.unsubscribe();
  }

  onToolClicked($event: ToolEvent) {
    switch ($event.target) {
      case 'undo':
        this.appStateService.undoAction();
        break;
      case 'redo':
        this.appStateService.redoAction();
        break;
    }
  }

  newProject(project: Project, title: string, redirectUrl?: string) {
    this.project = project;
    this.appStateService.openProject(this.project);
    this.project.metadata = new Metadata(title);

    if (redirectUrl) {
      this.router.navigateByUrl(redirectUrl, { replaceUrl: true });
    }
  }
}
