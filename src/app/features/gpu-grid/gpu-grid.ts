import { Component, computed, inject } from '@angular/core';
import { SimulationService } from '../../core/services/simulation';
import { NetworkService } from '../../core/services/network';
import { widestStage } from '../../core/models/network.model';

interface CoreCell {
  index: number;
  active: boolean;
  comparatorInfo?: string;
}

@Component({
  selector: 'app-gpu-grid',
  standalone: true,
  imports: [],
  templateUrl: './gpu-grid.html',
  styleUrl: './gpu-grid.scss',
})
export class GpuGrid {
  private readonly simulation = inject(SimulationService);
  private readonly networkService = inject(NetworkService);

  protected readonly selectedNetwork = this.networkService.selectedNetwork;
  protected readonly execution = this.simulation.execution;

  protected readonly coreCount = computed(() => {
    const network = this.selectedNetwork();
    return widestStage(network);
  });

  protected readonly activeCount = computed(() => {
    const exec = this.execution();
    const network = this.selectedNetwork();
    if (exec.stageIndex < 0 || exec.stageIndex >= network.depth)
      return 0;
    return network.stages[exec.stageIndex]?.length ?? 0;
  });

  protected readonly cores = computed<CoreCell[]>(() => {
    const total = this.coreCount();
    const exec = this.execution();
    const network = this.selectedNetwork();

    const isExecuting = exec.stageIndex >= 0 && exec.stageIndex < network.depth;
    const currentStage = isExecuting ? network.stages[exec.stageIndex] : null;

    const cores: CoreCell[] = [];
    for (let i = 0; i < total; i++) {
      const active = currentStage ? i < currentStage.length : false;
      let comparatorInfo: string | undefined;

      if (active && currentStage && currentStage[i]) {
        const comp = currentStage[i];
        if (active && currentStage?.[i]) {
          const { lo, hi } = currentStage[i];
          comparatorInfo = `Wires ${lo} ↔ ${hi}`;
        }
      }

      cores.push({ index: i, active, comparatorInfo });
    }
    return cores;
  });

  protected readonly utilizationPercent = computed(() => {
    return Math.round(this.simulation.stageUtilization() * 100);
  });

  protected readonly currentStageLabel = computed(() => {
    const exec = this.execution();
    const network = this.selectedNetwork();
    if (exec.stageIndex < 0) return 'Idle';
    if (exec.stageIndex >= network.depth) return 'Complete';
    return `Stage ${exec.stageIndex + 1} / ${network.depth}`;
  });

  protected readonly isRunning = computed(() => {
    const exec = this.execution();
    const network = this.selectedNetwork();
    return exec.stageIndex >= 0 && exec.stageIndex < network.depth;
  });
}