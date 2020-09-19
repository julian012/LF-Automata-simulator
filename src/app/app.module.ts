import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { FiniteModule } from './modules/finite-automaton/finite.module';
import { AppStateService } from './app-state.service';
import { AppComponent } from './app.component';
import { ToolbarComponent } from './toolbar.component';
import { ProjectComponent } from './project.component';
import { UnsavedChangesGuard } from './unsaved-changes.guard';

@NgModule({
  declarations: [
    AppComponent,
    ToolbarComponent,
    ProjectComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FiniteModule
  ],
  providers: [
    AppStateService,
    UnsavedChangesGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
