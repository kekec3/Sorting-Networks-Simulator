import { Component, inject, computed, input, viewChild, ElementRef, ViewChild, afterRenderEffect } from '@angular/core';
import { NetworkService } from '../../core/services/network';
import { ExecutionState } from '../../core/models/network.model';

interface PseudocodeLine {
  type: "header" | "logic" | "blank";
  text: string;
  stageIndex: number;
  microStep: number;
}

@Component({
  selector: 'app-pseudocode-panel',
  standalone: true,
  imports: [],
  templateUrl: './pseudocode-panel.html',
  styleUrl: './pseudocode-panel.scss',
})
export class PseudocodePanel {

  private readonly networkService = inject(NetworkService);
  private readonly network = this.networkService.selectedNetwork;

  readonly currentExecution = input<ExecutionState>({ stageIndex: -1, microStep: -1 });

  protected readonly lines = computed<PseudocodeLine[]>(() => {
    const network = this.network();
    if (!network) return [];

    const lines: PseudocodeLine[] = [];
    lines.push({
      type: "header",
      text: `procedure parallel_sort(a: array[${network.size}]):`,
      stageIndex: -1,
      microStep: -1
    });
    lines.push({ type: "blank", text: "", stageIndex: -1, microStep: -1 });

    network.stages.forEach((stage, stageIndex) => {
      lines.push({
        type: "logic",
        text: `// Stage ${stageIndex + 1} ──────────────────────────────────────`,
        stageIndex,
        microStep: 0,
      });
      lines.push({
        type: "logic",
        text: `  stride = calculate_stage_stride(${stageIndex})`,
        stageIndex,
        microStep: 0,
      });

      lines.push({
        type: 'logic',
        text: `  parallel_for each thread_id in (0 .. ${Math.floor(network.size / 2) - 1}):`,
        stageIndex,
        microStep: 1,
      });
      lines.push({
        type: 'logic',
        text: `    low  = map_thread_to_wire(thread_id, stride)`,
        stageIndex,
        microStep: 1,
      });
      lines.push({
        type: 'logic',
        text: `    high = low + stride`,
        stageIndex,
        microStep: 1,
      });

      lines.push({
        type: 'logic',
        text: `    compare_and_swap(a, low, high)`,
        stageIndex,
        microStep: 2,
      });

      lines.push({ type: 'blank', text: '', stageIndex: -1, microStep: -1 });
    });

    return lines;
  });

  protected lineClass(line: PseudocodeLine): string {
    const exec = this.currentExecution();

    if (line.stageIndex === -1) return "neutral";
    if (line.stageIndex < exec.stageIndex) return "done";
    if (line.stageIndex > exec.stageIndex) return "future";
    if (line.microStep === exec.microStep) return "active";
    return "stage-focused";
  }

  private readonly scrollContainer = viewChild<ElementRef<HTMLDivElement>>('scrollContainer');
  private readonly activeLineEl = viewChild<ElementRef<HTMLElement>>('activeLineEl');

  constructor() {
    afterRenderEffect(() => {
      const execution = this.currentExecution();
      const el = this.scrollContainer()?.nativeElement;
      const line = this.activeLineEl()?.nativeElement;
      if (!el)
        return;

      if (execution.stageIndex < 0) {
        el.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      if (!line)
        return;

      const lineTop = line.offsetTop;
      const panelH = el.clientHeight;

      const scrollTarget = lineTop - panelH;
      el.scrollTo({ top: Math.max(0, scrollTarget), behavior: 'smooth' });
    })
  }

  isActiveLine(line: PseudocodeLine): boolean {
    const execution = this.currentExecution();
    return line.stageIndex === execution.stageIndex && line.microStep === execution.microStep;
  }
}
