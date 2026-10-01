import { Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { SimulationService } from '../../core/services/simulation';

const SPEED_OPTIONS = [
  { label: '0.5x', ms: 1200 },
  { label: "1x", ms: 600 },
  { label: '1.5x', ms: 400 },
  { label: '2x', ms: 200 }
]

@Component({
  selector: 'app-controls',
  imports: [],
  templateUrl: './controls.html',
  styleUrl: './controls.scss',
})
export class Controls implements OnDestroy {

  private readonly simulation = inject(SimulationService);

  protected readonly isStart = this.simulation.isStart;
  protected readonly isEnd = this.simulation.isEnd;
  protected readonly execution = this.simulation.execution;

  protected readonly isPlaying = signal(false);
  protected readonly speedIndex = signal(1);

  protected readonly speedLabel = computed(() => SPEED_OPTIONS[this.speedIndex()].label);

  private intervalId: ReturnType<typeof setInterval> | null = null;

  protected togglePlay(): void {
    if (this.isPlaying()) {
      this.pause();
    } else {
      this.play();
    }
  }

  protected stepForward(): void {
    this.pause();
    this.simulation.microStepForward();
  }

  protected stepBackward(): void {
    this.pause();
    this.simulation.microStepBackward();
  }

  protected stageForward(): void {
    this.pause();
    this.simulation.stepForward();
  }

  protected stageBackward(): void {
    this.pause();
    this.simulation.stepBackward()
  }

  protected reset(): void {
    this.pause();
    this.simulation.reset();
  }

  protected randomize(): void {
    this.pause();
    this.simulation.randomInput();
  }

  protected setSpeed(index: number): void {
    this.speedIndex.set(index);
    if (this.isPlaying()) {
      this.pause();
      this.play();
    }
  }

  private play(): void {
    if (this.isEnd())
      return;

    this.isPlaying.set(true);

    const ms = SPEED_OPTIONS[this.speedIndex()].ms;
    this.intervalId = setInterval(() => {
      if (this.isEnd()) {
        this.pause();
        return;
      }
      this.simulation.microStepForward();
    }, ms)
  }

  private pause(): void {
    this.isPlaying.set(false);
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  ngOnDestroy(): void {
    this.pause();
  }

  protected readonly SPEED_OPTIONS = SPEED_OPTIONS;
}
