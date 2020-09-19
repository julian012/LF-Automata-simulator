import { Component, OnInit, OnDestroy } from '@angular/core';
import { State, Transition, AlphabetSymbol } from '../../entities/automaton';
import { AppStateService } from '../../services/app-state.service';
import { FiniteAutomaton } from '../../entities/finite-automaton';
import { Subscription } from 'rxjs/Subscription';

declare var alertify;

@Component({
  templateUrl: './simulator.component.html',
  styleUrls: ['./simulator.component.css']
})
export class SimulatorComponent implements OnInit, OnDestroy {
  private projectSubscription: Subscription;
  inputWord = '';
  speed = 50;
  simulation: Simulation;
  automaton: FiniteAutomaton;


  get simSpeed(): number {
    return this.speed;
  }

  get startText(): string {
    if (typeof (this.simulation) !== 'undefined' && this.simulation != null && this.simulation.isRunning) {
      return 'Pause';
    } else if (this.simulation !== null && this.simulation.hasRemainingElements()) {
      return 'Resume';
    } else if (this.simulation !== null) {
      return 'Restart';
    }
    return 'Start';
  }

  constructor(public appStateService: AppStateService) { }

  ngOnInit() {
    this.automaton = this.appStateService.project as FiniteAutomaton;
    alertify.logPosition('top right');
    this.projectSubscription = this.appStateService.projectChangedStream.subscribe((newProject) => {
      this.automaton = newProject as FiniteAutomaton;
    });
  }

  ngOnDestroy() {
    this.projectSubscription.unsubscribe();
  }

  toggleState() {
    const error = this.validateAutomaton();
    if (error != null) {
      return this.outputError(error);
    }

    if (typeof (this.simulation) !== 'undefined' && this.simulation != null && this.simulation.isRunning) {
      this.stopSimulation();
    } else if (this.simulation !== null && this.simulation.hasRemainingElements()) {
      this.resumeSimulation();
    } else if (this.simulation !== null) {
      this.reset();
      this.startSimulation();
    } else {
      this.startSimulation();
    }
  }

  startSimulation() {
    const couldCreateSimulation = this.createSimulation();
    if (couldCreateSimulation) {
      this.simulation.startInterval(2000 - this.speed * 20);
    }
  }

  stopSimulation() {
    this.simulation.stopInterval();
  }

  resumeSimulation() {
    this.simulation.startInterval(2000 - this.speed * 20);
  }

  createSimulation(): boolean {
    if (this.validateWord(this.inputWord)) {
      this.simulation = new Simulation(this.automaton);
      this.simulation.initializeSimulation(this.inputWord);
      return true;
    } else {
      alertify.error('La palabra contiene símbolos que no están en el alfabeto.');
      return false;
    }
  }

  step() {
    const error = this.validateAutomaton();
    if (error != null) {
      return this.outputError(error);
    }

    if (typeof (this.simulation) === 'undefined' || this.simulation == null) {
      const couldCreateSimulation = this.createSimulation();
      if (couldCreateSimulation) {
        this.simulation.step();
      }
    } else {
      if (this.simulation.isRunning) {
        this.stopSimulation();
      }
      this.simulation.step();
    }

  }

  outputError(error: ValidationError) {

    alertify.error(error.errorMessage);
    if (error.culprit != null) {
      this.automaton.incorrectElement = error.culprit;
    }
    setTimeout(() => {
      this.automaton.incorrectElement = null;
    }, 5000);
  }

  reset() {
    this.automaton.activeElement = null;
    if (this.simulation != null) {
      this.simulation.stopInterval();
      this.simulation = null;
    }
  }

  // Returns null if the automaton is valid, else the error object
  validateAutomaton(): ValidationError {
    const automaton = this.automaton;
    let initialStates = 0,
      finalStates = 0;
    const alphabetSymbols = automaton.alphabet.symbols.length;
    const isDeterministic = automaton.isDeterministic;

    for (let i = 0; i < automaton.states.length; i++) {
      const state = automaton.states[i];

      if (state.type === 'initial' || state.type === 'ambivalent') {
        if (++initialStates > 1) {
          return new ValidationError('An automaton can only have one initial state', state);
        }
      }

      if (state.type === 'final' || state.type === 'ambivalent') {
        finalStates++;
      }

      if (isDeterministic) {
        let conditions = [];

        for (let j = 0; j < state.transitions.length; j++) {
          if (state.transitions[j].conditions.length === 0) {
            return new ValidationError('A DFA can\'t have Kleene Closures', state);
          }
          conditions = conditions.concat(state.transitions[j].conditions);
        }

        if (conditions.length < alphabetSymbols) {
          return new ValidationError('A DFA state must have a transition for each symbol in the alphabet.', state);
        } else if (this.hasRepeatedConditions(conditions)) {
          return new ValidationError('A DFA can only have one transition for each symbol in the alphabet.', state);
        }
      }
    }

    if (finalStates === 0) {
      return new ValidationError('Debe haber al menos un estado final', null);
    }
    return null;
  }

  hasRepeatedConditions(conditions): boolean {
    // If we have repeated symbols
    const seenSymbols = [];
    for (let i = 0; i < conditions.length; i++) {
      if (seenSymbols.includes(conditions[i].symbol)) {
        return true;
      }
      seenSymbols.push(conditions[i].symbol);
    }
    return false;
  }

  validateWord(word: string) {
    const alphabet = this.automaton.alphabet.symbols;

    if (word.indexOf(',') !== -1) {
      const words = word.split(',');
      for (let i = 0; i < words.length; i++) {
        if (!this.validateWord(words[i])) {
          return false;
        }
      }
      return true;
    } else {
      for (let i = 0; i < word.length; ) {
        let contained = false;
        for (let j = word.length; j > i && !contained; j--) {
          const substr = word.slice(i, j);
          for (let k = 0; k < alphabet.length; k++) {
            if (substr === alphabet[k].symbol) {
              contained = true;
              i += j - i;
              break;
            }
          }
        }
        if (!contained) {
          return false;
        }
      }
      return true;
    }
  }

}

class Simulation {
  inputWord: string;
  initialState: State;
  stepInterval: any;
  automaton: FiniteAutomaton;
  traversalStack: TraversalElement[];
  currentElement: TraversalElement;
  lastDepth: number;
  reachedValidity: boolean;
  inputSymbols: AlphabetSymbol[];


  get isRunning() {
    return this.stepInterval != null;
  }

  constructor(automaton: FiniteAutomaton) {
    this.automaton = automaton;
    this.stepInterval = null;

    for (let i = 0; i < automaton.states.length; i++) {
      if (automaton.states[i].type === 'initial'
        || automaton.states[i].type === 'ambivalent') {
        this.initialState = automaton.states[i];
        break;
      }
    }
  }

  hasRemainingElements(): boolean {
    return this.traversalStack.length > 0;
  }

  initializeSimulation(word: string) {
    this.automaton.activeElement = this.initialState;
    this.inputWord = word;
    this.lastDepth = 0;
    this.reachedValidity = false;
    this.traversalStack = [new TraversalState(0, 'state', this.initialState)];
    this.inputSymbols = this.extractInputSymbols(word);

    this.automaton.selectedState = null;
    this.automaton.selectedTransition = null;
  }

  extractInputSymbols(rawSymbolWord: string): AlphabetSymbol[] {
    const validSymbols = this.automaton.alphabet.symbols;
    let detectedSymbols: AlphabetSymbol[] = [];

    if (rawSymbolWord.indexOf(',') !== -1) { // if it is a comma separated list, iteratively recurse into it
      const words = rawSymbolWord.split(',');
      words.forEach((word) => {
        detectedSymbols = detectedSymbols.concat(this.extractInputSymbols(word));
      });
      return detectedSymbols;
    } else {
      for (let i = 0; i < rawSymbolWord.length; ) {
        let contained = false;
        for (let j = rawSymbolWord.length; j > i && !contained; j--) {
          const substr = rawSymbolWord.slice(i, j);
          for (let k = 0; k < validSymbols.length; k++) {
            if (substr === validSymbols[k].symbol) {
              contained = true;
              detectedSymbols.push(validSymbols[k]);
              i += j - i;
              break;
            }
          }
        }
        if (!contained) {
          alertify.error('The word contains undefined symbols.');
          throw new Error('Simbolos indefinidos en la palabra');
        }
      }
      return detectedSymbols;
    }
  }

  startInterval(interval: number) {
    this.step();
    this.stepInterval = setInterval(() => {
      this.step();
    }, interval + 20); // 20ms minimum -> 50 states per second
  }

  stopInterval() {
    clearInterval(this.stepInterval);
    this.stepInterval = null;
  }

  updateInterval(interval: number) {
    clearInterval(this.stepInterval);
    this.stepInterval = setInterval(() => {
      this.step();
    }, interval);
  }

  getTransitionSymbol(currentDepth): [AlphabetSymbol, number] {
    if (currentDepth >= this.inputWord.length) { return [null, 0]; }
    const alphabet = this.automaton.alphabet.symbols;
    for (let i = this.inputWord.length; i > currentDepth; i--) {
      const substr = this.inputWord.slice(currentDepth, i);
      for (let j = 0; j < alphabet.length; j++) {
        if (substr === alphabet[j].symbol) {
          return [alphabet[j], i - currentDepth];
        }
      }
    }
    throw new Error('Invalid symbol detected in simulation!');
  }

  step() {
    this.currentElement = this.traversalStack.pop();

    if (typeof (this.currentElement) === 'undefined') { // Our traversal stack is empty
      if (this.startInterval != null) { // Pause the simulation
        this.stopInterval();
      }
      if (this.lastDepth + 1 < this.inputWord.length && !this.reachedValidity) {
        // We ran out of states and we still hadn't processed the word or validated it in another branch
        alertify.log('La palabra es incorrecta');
      }
      return; // Stop the step
    }

    if (this.currentElement.type === 'state') {
      const stateTraversalElement = this.currentElement as TraversalState,
        state = stateTraversalElement.state,
        inputSymbol = this.inputSymbols[stateTraversalElement.depth];

      this.automaton.activeElement = state;
      this.lastDepth = stateTraversalElement.depth;

      if (typeof(inputSymbol) === 'undefined') { // We reached the end of the word
        if (state.type === 'final' || state.type === 'ambivalent') {
          alertify.success('La palabra es válida :D');
          this.reachedValidity = true; // If this is a final state, we win!
        } else if (this.traversalStack.length === 0 && !this.reachedValidity) {
          alertify.log('La palabra no es válida D:'); // Else, if there is nothing more in the stack we lose.
        }
      } else { // If we still have a word, get ready to branch
        for (let i = state.transitions.length - 1; i >= 0; i--) {
          const transition = state.transitions[i]; // For every transition that matches our condition, push it to the stack
          if (transition.conditions.length === 0
            || transition.hasCondition(inputSymbol)) {
            if (transition.conditions.length === 0) { // Kleene Closures should not consume the string
              this.traversalStack.push(new TraversalTransition(
                stateTraversalElement.depth, 'transition', transition));
            } else {
              this.traversalStack.push(new TraversalTransition(
                stateTraversalElement.depth + 1, 'transition', transition));
            }
          }
        }
      }
    } else { // If this is a transition, just mark it as active for the front end and push the state to the next stack
      const transitionTraversalElement = this.currentElement as TraversalTransition,
        transition = transitionTraversalElement.transition,
        destinationState = transition.destination;

      this.automaton.activeElement = transition;

      this.traversalStack.push(new TraversalState(
        transitionTraversalElement.depth, 'state', destinationState));
    }
  }


}

class TraversalElement {
  type: string;
  depth: number;

  constructor(depth: number, type: string) {
    this.type = type;
    this.depth = depth;
  }
}

class TraversalState extends TraversalElement {
  state: State;

  constructor(depth: number, type: string, state: State) {
    super(depth, type);
    this.state = state;
  }
}

class TraversalTransition extends TraversalElement {
  transition: Transition;

  constructor(depth: number, type: string, transition: Transition) {
    super(depth, type);
    this.transition = transition;
  }
}

class ValidationError {
  errorMessage: string;
  culprit: State;

  constructor(errorMsg: string, culprit: State) {
    this.errorMessage = errorMsg;
    this.culprit = culprit;
  }
}
