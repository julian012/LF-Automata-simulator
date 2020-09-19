import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { FiniteModule } from './modules/finite-automaton/finite.module';
import { AppStateService } from './modules/finite-automaton/services/app-state.service';
import { AppComponent } from './app.component';
import { ToolbarComponent } from './modules/finite-automaton/components/toolbar/toolbar.component';
import { ProjectComponent } from './project.component';

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
    AppStateService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
