import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppStateService } from '../../services/app-state.service';
import { FiniteAutomaton } from '../../entities/finite-automaton';
import { Subscription } from 'rxjs/Subscription';
import { AlphabetSymbol } from '../../entities/automaton';



@Component({
  templateUrl: './options.component.html'
})
export class OptionsComponent implements OnInit, OnDestroy {
  private projectSubscription: Subscription;
  public automaton: FiniteAutomaton;

  constructor(public appStateService: AppStateService) { }

  ngOnInit() {
    this.automaton = this.appStateService.project as FiniteAutomaton;
    this.projectSubscription = this.appStateService.projectChangedStream.subscribe((newProject) => {
      this.automaton = newProject as FiniteAutomaton;
    });
  }

  ngOnDestroy() {
    this.projectSubscription.unsubscribe();
  }

  setFiniteAsDeterministic(isDeterministic: boolean) {
    this.automaton.isDeterministic = isDeterministic;
    this.automaton.metadata.isUnsaved = true;
  }

  removeSymbolFromAlphabet(symbolToRemove: AlphabetSymbol) {
    this.automaton.removeSymbol(symbolToRemove);
    this.automaton.metadata.isUnsaved = true;
  }

  addSymbolToAlphabet(editorSymbol: string) {
    if (editorSymbol.trim() !== '') {// Prevent empty symbols
      const symbolArray = editorSymbol.trim().split(',');
      symbolArray.forEach((stringSymbol) => {
        const symbol = new AlphabetSymbol(stringSymbol.trim());
        if (symbol.symbol !== '') {
          this.automaton.alphabet.addSymbol(symbol);
          this.automaton.metadata.isUnsaved = true;
        }
      });
    }
  }
}
