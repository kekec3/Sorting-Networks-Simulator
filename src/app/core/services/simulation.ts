import { computed, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { NetworkService } from './network';
import { ExecutionState } from '../models/network.model';
import { Comparator, stageUtilization } from '../models/network.model';

const MICRO_STEPS = 3;

@Injectable({
  providedIn: 'root',
})
export class SimulationService {

  private readonly networkService = inject(NetworkService);
  private readonly network = this.networkService.selectedNetwork;

  private readonly _execution = signal<ExecutionState>({ stageIndex: -1, microStep: -1 });
  private readonly _input = signal<number[]>([]);
  private readonly _snapshots = signal<number[][]>([]);
  private readonly _swapCount = signal<number>(0);

  readonly execution = this._execution.asReadonly();
  readonly input = this._input.asReadonly();
  readonly swapCount = this._swapCount.asReadonly();

  constructor() {
    effect(() => {
      const network = this.network();
      untracked(() => {
        this.randomInput();
      });
    });
  }

  readonly currentArray = computed(() => {
    const snapshots = this._snapshots();
    const stage = this._execution().stageIndex;
    if (snapshots.length === 0) return this._input();
    const snapshotIndex = Math.max(0, stage);
    return snapshots[snapshotIndex] ?? this._input();
  });

  readonly isStart = computed(() => {
    const exec = this._execution();
    return exec.stageIndex === -1;
  });

  readonly isEnd = computed(() => {
    const exec = this._execution();
    const depth = this.network().depth;
    return exec.stageIndex >= depth;
  });

  readonly totalComparisons = computed(() => this.network().comparatorCount);

  readonly doneComparisons = computed(() => {
    const exec = this._execution();
    const network = this.network();
    if (exec.stageIndex <= 0) return 0;

    let sum = 0;
    for (let i = 0; i < exec.stageIndex; i++) {
      sum += network.stages[i].length;
    }
    return sum
  });

  readonly stageUtilization = computed(() => {
    const exec = this._execution();
    const network = this.network();
    if (exec.stageIndex < 0 || exec.stageIndex >= network.depth) return 0;
    return stageUtilization(network, exec.stageIndex);
  });

  setInput(array: number[]): void {
    const network = this.network();
    if (array.length !== network.size) {
      console.warn(`Input length ${array.length} missmatch, network size ${network.size}`);
      return;
    }
    this._input.set([...array]);
    this.reset();
  }

  randomInput(): void {
    const size = this.network().size;
    if (size < 1)
      return;
    if (size === 1) {
      this.setInput([1]);
      return;
    }
    const array = [];
    for (let i = 1; i <= size; i++) {
      array.push(i);
    }
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    this.setInput(array);
  }

  reset(): void {
    this._execution.set({ stageIndex: -1, microStep: -1 });
    this._snapshots.set([]);
    this._swapCount.set(0);
  }

  microStepForward(): void {
    if (this.isEnd()) return;

    const exec = this._execution();
    const network = this.network();

    if (exec.stageIndex === -1) {
      this._snapshots.set([[...this._input()]]);
      this._execution.set({ stageIndex: 0, microStep: 0 });
      return;
    }

    if (exec.microStep + 1 < MICRO_STEPS) {
      this._execution.set({ stageIndex: exec.stageIndex, microStep: exec.microStep + 1 });
      return;
    }

    this.stepForward();
  }

  stepForward(): void {
    if (this.isEnd()) return;

    const exec = this._execution();
    const network = this.network();

    if (exec.stageIndex === -1) {
      this._snapshots.set([[...this._input()]]);

      if (0 >= network.depth) {
        this._execution.set({ stageIndex: 0, microStep: -1 });
      }
      else {
        this._execution.set({ stageIndex: 0, microStep: 0 });
      }
      return;
    }

    this.applyStage(exec.stageIndex);

    if (exec.stageIndex + 1 >= network.depth) {
      this._execution.set({ stageIndex: exec.stageIndex + 1, microStep: -1 });
    }
    else {
      this._execution.set({ stageIndex: exec.stageIndex + 1, microStep: 0 });
    }
  }

  private applyStage(stageIndex: number): void {
    const network = this.network();
    const stage = network.stages[stageIndex];
    const snapshot = this._snapshots();
    const current = [...snapshot[stageIndex]];

    const swaps = this.applyStageArray(stage, current);

    this._snapshots.update(snapshots => [...snapshots, current]);
    this._swapCount.update(count => count + swaps);
  }

  private applyStageArray(stage: Comparator[], array: number[]): number {
    let swaps = 0;
    stage.forEach(({ lo, hi, dir }) => {
      const isDesc = dir === 'desc';
      const doSwap = isDesc ? array[lo] < array[hi] : array[lo] > array[hi];

      if (doSwap) {
        [array[lo], array[hi]] = [array[hi], array[lo]];
        swaps++;
      }
    });
    return swaps;
  }

  microStepBackward(): void {
    if (this.isStart()) return;

    const exec = this._execution();

    if (exec.stageIndex >= this.network().depth) {
      const lastStageIndex = this.network().depth - 1;
      const swapsToSub = this.countSwapsInStage(lastStageIndex);

      this._snapshots.update(snapshots => snapshots.slice(0, -1));
      this._swapCount.update(count => count - swapsToSub);
      this._execution.set({ stageIndex: lastStageIndex, microStep: MICRO_STEPS - 1 });
      return;
    }

    if (exec.microStep > 0) {
      this._execution.set({ stageIndex: exec.stageIndex, microStep: exec.microStep - 1 });
      return;
    }

    this.stepBackward();
  }

  stepBackward(): void {
    if (this.isStart()) return;

    const exec = this._execution();

    if (exec.stageIndex === 0) {
      this._snapshots.set([]);
      this._swapCount.set(0);
      this._execution.set({ stageIndex: -1, microStep: -1 });
      return;
    }

    const swapsToSub = this.countSwapsInStage(exec.stageIndex - 1);

    this._snapshots.update(snapsots => snapsots.slice(0, -1));
    this._swapCount.update(count => count - swapsToSub);
    this._execution.set({ stageIndex: exec.stageIndex - 1, microStep: MICRO_STEPS - 1 });
  }

  private countSwapsInStage(stageIndex: number): number {
    const snapshots = this._snapshots();
    if (snapshots.length < stageIndex + 2) return 0;

    const before = snapshots[stageIndex];
    const after = snapshots[stageIndex + 1];
    let swaps = 0;
    this.network().stages[stageIndex].forEach(({ lo, hi }) => {
      if (before[lo] !== after[lo]) swaps++;
    });
    return swaps;
  }

  jumpToStage(stageIndex: number): void {
    const network = this.network();
    if (stageIndex < 0 || stageIndex >= network.depth) return;

    const snapshots: number[][] = [[...this._input()]];
    let swaps = 0;

    for (let i = 0; i < stageIndex; i++) {
      const prev = [...snapshots[i]];
      swaps += this.applyStageArray(network.stages[i], prev);
      snapshots.push(prev);
    }

    this._snapshots.set(snapshots);
    this._swapCount.set(swaps);
    this._execution.set({ stageIndex: stageIndex, microStep: 0 });
  }

}
