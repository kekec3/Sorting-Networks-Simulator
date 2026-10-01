import { Component, inject, computed, input, ViewChild, ElementRef, afterRenderEffect, viewChild, signal } from '@angular/core';
import { NetworkService } from '../../core/services/network';
import { Comparator, computeStagesSegments, stageBounds } from '../../core/models/network.model';
import { SimulationService } from '../../core/services/simulation';

const PADDING = 40;
const WIRE_SPACING = 60;
const WIRE_THICKNESS = 2;
const STAGE_SPACING = 120;
const SEGMENT_SPACING = 20;
const COMPARATOR_THICKNESS = 8;

@Component({
  selector: 'app-network-canvas',
  standalone: true,
  imports: [],
  templateUrl: './network-canvas.html',
  styleUrl: './network-canvas.scss',
})
export class NetworkCanvas {

  private readonly networkService = inject(NetworkService);
  private readonly simulationService = inject(SimulationService);

  protected readonly network = this.networkService.selectedNetwork;

  readonly currentStage = input<number>(-1);

  protected readonly zoomLevel = signal<number>(1);
  protected readonly zoomProcentage = computed(() => Math.round(this.zoomLevel() * 100));

  protected zoomIn(): void {
    this.zoomLevel.update(z => Math.min(2.5, +(z + 0.15).toFixed(2)));
  }

  protected zoomOut(): void {
    this.zoomLevel.update(z => Math.max(0.4, +(z - 0.15).toFixed(2)));
  }

  protected resetZoom(): void {
    this.zoomLevel.set(1);
  }

  protected onWheel(event: WheelEvent): void {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      if (event.deltaY < 0) {
        this.zoomIn();
      } else {
        this.zoomOut();
      }
    }
  }

  private readonly stageLayout = computed(() => this.network().stages.map(stage => computeStagesSegments(stage)))

  protected readonly comparators = computed(() => {
    const comparators: {
      stageIndex: number;
      comparator: Comparator;
      x: number;
      top: number;
      bottom: number;
    }[] = [];

    let xOffset = 2.5 * PADDING

    this.stageLayout().forEach((stage, stageIndex) => {
      stage.forEach((segment, segmentIndex) => {
        const x = xOffset + segmentIndex * SEGMENT_SPACING;
        segment.forEach((comp) => {
          comparators.push({
            stageIndex,
            comparator: comp,
            x,
            top: PADDING + comp.lo * WIRE_SPACING,
            bottom: PADDING + comp.hi * WIRE_SPACING
          });
        });
      });

      xOffset += STAGE_SPACING + (stage.length - 1) * SEGMENT_SPACING;
    });
    return comparators;
  });

  protected readonly width = computed(() => {
    const list = this.comparators();
    if (list.length === 0) return 4 * PADDING;

    const lastComparator = list[list.length - 1];
    return lastComparator.x + 3 * PADDING;
  });

  protected readonly height = computed(() => 2 * PADDING + (this.network().size - 1) * WIRE_SPACING);

  protected readonly scaledWidth = computed(() => this.width() * this.zoomLevel());
  protected readonly scaledHeight = computed(() => this.height() * this.zoomLevel());

  protected readonly wireSegments = computed(() => {
    const bounds = stageBounds(this.comparators());
    let wires: {
      wireIndex: number,
      y: number,
      segments: { stageIndex: number, start: number, end: number }[]
    }[] = []
    for (let wireIndex = 0; wireIndex < this.network().size; wireIndex++) {
      const segments: { stageIndex: number; start: number; end: number }[] = [];
      bounds.forEach((currentBound, i) => {
        let start = PADDING / 2;
        let end = this.width() - PADDING / 2;
        if (i > 0) {
          const prevBound = bounds[i - 1];
          start = (prevBound.xMax + currentBound.xMin) / 2;
        }
        if (i < bounds.length - 1) {
          const nextBound = bounds[i + 1];
          end = (currentBound.xMax + nextBound.xMin) / 2;
        }

        segments.push({
          stageIndex: currentBound.stageIndex,
          start,
          end,
        });
      });
      wires.push({
        wireIndex,
        y: PADDING + wireIndex * WIRE_SPACING,
        segments,
      });
    }
    return wires;
  });

  protected readonly tokens = computed(() => {
    const exec = this.simulationService.execution();
    const array = this.simulationService.currentArray();
    const comparators = this.comparators();

    let x: number;
    if (exec.stageIndex <= 0 || comparators.length === 0) {
      if (comparators.length > 0) {
        const firstX = comparators[0].x;
        x = firstX - 40;
      } else {
        x = PADDING + 10;
      }
    } else {
      const stageComparators = comparators.filter(c => c.stageIndex === exec.stageIndex - 1);
      if (stageComparators.length > 0) {
        const maxX = Math.max(...stageComparators.map(c => c.x));
        x = maxX + 0.6 * STAGE_SPACING;
      }
      else {
        x = PADDING + 0.6 * STAGE_SPACING;
      }
    }

    return array.map((value, wireIndex) => ({
      value,
      wireIndex,
      x,
      y: PADDING + wireIndex * WIRE_SPACING,
    }));
  });

  protected readonly activeWires = computed(() => {
    const exec = this.simulationService.execution();
    const network = this.network();
    const wires = new Set<number>();
    if (exec.stageIndex < 0 || exec.stageIndex >= network.depth) return wires;
    const stage = network.stages[exec.stageIndex];
    stage.forEach(({ lo, hi }) => {
      wires.add(lo);
      wires.add(hi);
    });
    return wires;
  })

  protected comparatorClass(stageIndex: number): string {
    const curr = this.currentStage();
    if (curr === -1) return "";
    if (stageIndex === curr) return "comparator-active";
    if (stageIndex < curr) return "comparator-done";
    return "comparator-future";
  }

  protected wireSegmentClass(stageIndex: number): string {
    const curr = this.currentStage();
    if (curr === -1) return "";
    if (stageIndex === curr) return "wire-active";
    if (stageIndex < curr) return "wire-done";
    return "wire-future";
  }

  private readonly scrollContainer = viewChild<ElementRef<HTMLDivElement>>('scrollContainer');

  constructor() {
    afterRenderEffect(() => {
      const stage = this.currentStage();
      const comparators = this.comparators();
      const zoom = this.zoomLevel();
      const el = this.scrollContainer()?.nativeElement;
      if (!el)
        return;

      if (stage < 0) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
        return;
      }

      requestAnimationFrame(() => {
        const stageComparators = comparators.filter(c => c.stageIndex === stage);
        if (stageComparators.length === 0) return;

        const targetX = Math.min(...stageComparators.map(c => c.x));
        const scaledTargetX = targetX * zoom;
        const scrollTarget = scaledTargetX - el.clientWidth / 2;
        el.scrollTo({ left: Math.max(0, scrollTarget), behavior: 'smooth' });
      });
    });
  }

  protected readonly COMPARATOR_THICKNESS = COMPARATOR_THICKNESS;
  protected readonly WIRE_THICKNESS = WIRE_THICKNESS
  protected readonly PADDING = PADDING
}
