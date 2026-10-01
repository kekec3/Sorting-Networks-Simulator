import { Component, computed, inject } from '@angular/core';
import { SimulationService } from '../../core/services/simulation';
import { NetworkService } from '../../core/services/network';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [],
  templateUrl: './statistics.html',
  styleUrl: './statistics.scss',
})
export class Statistics {

  private readonly simulation = inject(SimulationService);
  private readonly networkService = inject(NetworkService);

  protected readonly stats = computed(() => {
    const execution = this.simulation.execution();
    const network = this.networkService.selectedNetwork();
    const stage = execution.stageIndex;

    return {
      size: network.size,
      depth: network.depth,
      comparatorCount: network.comparatorCount,
      currentStage: stage < 0 ? '-' : stage >= network.depth ? 'Done' : `${stage + 1} / ${network.depth}`,
      comparisons: `${this.simulation.doneComparisons()} / ${this.simulation.totalComparisons()}`,
      swaps: this.simulation.swapCount(),
      utilization: stage >= 0 && stage < network.depth ? `${Math.round(this.simulation.stageUtilization() * 100)}%` : '-',
    };
  });

  protected getSimulation() {
    return this.simulation;
  }
}
