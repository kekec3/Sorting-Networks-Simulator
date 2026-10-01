import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NetworkService } from '../../core/services/network';
import { SimulationService } from '../../core/services/simulation';

type InputMode = 'random' | 'manual';
type OptimizationGoal = 'depth' | 'size';
type GeneratorAlgorithm = 'bestKnown' | 'bitonic' | 'oddEven' | 'pairwise';
type ValidationError = string | null;

@Component({
  selector: 'app-config-panel',
  imports: [FormsModule],
  templateUrl: './config-panel.html',
  styleUrl: './config-panel.scss',
})
export class ConfigPanel {

  private networkService = inject(NetworkService);
  private simulation = inject(SimulationService);

  protected readonly availableNetworks = this.networkService.availableNetworks;
  protected readonly selectedNetwork = this.networkService.selectedNetwork;

  protected targetSize = signal<number>(this.selectedNetwork()?.size ?? 4);
  protected optimizationGoal = signal<OptimizationGoal>('depth');
  protected selectedSource = signal<GeneratorAlgorithm>('bestKnown');
  protected networkError = signal<string | null>(null);

  protected setOptimizationGoal(goal: OptimizationGoal): void {
    this.optimizationGoal.set(goal);
  }

  protected setTargetSize(size: number): void {
    this.targetSize.set(size);
    this.networkError.set(null);
  }

  protected loadNetwork(): void {
    const size = Number(this.targetSize());

    if (isNaN(size) || size < 2) {
      this.networkError.set('Please enter a valid network size (N >= 2).');
      return;
    }

    const source = this.selectedSource();

    if (source === 'bestKnown') {
      if (size > 16) {
        this.networkError.set('Best known presets are not supported for N > 16.');
        return;
      }
      const smallestDepth = this.optimizationGoal() === 'depth';
      this.networkService.selectNetworkBySize(size, smallestDepth);
    } else {
      this.networkService.generateNetwork(size, source);
    }

    if (this.selectedNetwork().size !== size) {
      this.networkError.set(`Failed to load network for size N = ${size}.`);
      return;
    }

    this.networkError.set(null);

    if (this.mode() === 'random') {
      this.simulation.randomInput();
    } else {
      this.rawInput.set('');
      this.validationError.set(null);
    }
  }

  protected mode = signal<InputMode>('random');

  protected setMode(m: InputMode): void {
    this.mode.set(m);
    this.validationError.set(null);
    if (m === 'random')
      this.simulation.randomInput();
  }

  protected rawInput = signal<string>('');
  protected validationError = signal<ValidationError>(null);

  protected readonly networkSize = computed(() => this.selectedNetwork().size);

  protected readonly inputPlaceholder = computed(() => {
    let placeholder = [];
    for (let i = 1; i <= this.networkSize(); i++) {
      placeholder.push(i);
    }
    return placeholder.join(', ');
  });

  protected onRawInputChange(value: string): void {
    this.rawInput.set(value);
    this.validationError.set(null);
  }

  protected applyManualInput(): void {
    const result = this.parseInput(this.rawInput());
    if (typeof result === 'string') {
      this.validationError.set(result);
      return;
    }
    this.validationError.set(null);
    this.simulation.setInput(result);
  }

  private parseInput(raw: string): number[] | string {
    const size = this.networkSize();

    if (raw.trim() === '') {
      return 'Enter a comma-separated list of numbers.';
    }

    const parts = raw.split(',').map(s => s.trim());

    if (parts.length !== size) {
      return `Expected ${size} values, but ${parts.length} were given.`;
    }

    const nums = parts.map(Number);

    if (nums.some(isNaN)) {
      return 'All values must be numbers.';
    }

    if (nums.some(n => !Number.isFinite(n)))
      return 'Values must be finite numbers.';

    return nums;
  }

  protected randomInput(): void {
    this.simulation.randomInput();
  }

  protected readonly currentArray = this.simulation.input;
}
