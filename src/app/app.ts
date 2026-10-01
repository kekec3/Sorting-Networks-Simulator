import { Component, computed, inject, input, signal } from '@angular/core';
import { NetworkCanvas } from "./features/network-canvas/network-canvas";
import { NetworkService } from './core/services/network';
import { PseudocodePanel } from './features/pseudocode-panel/pseudocode-panel';
import { SimulationService } from './core/services/simulation';
import { Controls } from './features/controls/controls';
import { ConfigPanel } from './features/config-panel/config-panel';
import { Statistics } from './features/statistics/statistics';
import { GpuGrid } from './features/gpu-grid/gpu-grid';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    NetworkCanvas,
    PseudocodePanel,
    GpuGrid,
    Controls,
    Statistics,
    ConfigPanel
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly networkService = inject(NetworkService);
  protected readonly simulationService = inject(SimulationService);

  protected readonly currentExecution = this.simulationService.execution;
  protected readonly currentStage = computed(() => this.currentExecution().stageIndex);
  protected readonly depth = computed(() => this.networkService.selectedNetwork().depth);

  protected isConfigCollapsed = signal<boolean>(false);
}
