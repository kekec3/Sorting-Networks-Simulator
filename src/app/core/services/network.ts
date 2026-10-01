import { Injectable, Signal, computed, signal } from '@angular/core';
import { SortingNetwork } from '../models/network.model';
import networksData from '../../data/networks.json'
import { generateBitonicNetwork } from '../generators/bitonic';
import { generateOddEvenNetwork } from '../generators/odd-even';
import { generatePairwiseNetwork } from '../generators/pairwise';

type GeneratorAlgorithm = 'bitonic' | 'oddEven' | 'pairwise';

@Injectable({
  providedIn: 'root',
})
export class NetworkService {

  private readonly _networks: SortingNetwork[] = networksData.networks as SortingNetwork[];

  private readonly _selectedNetwork = signal<SortingNetwork>(this._networks[4]);

  readonly selectedNetwork = this._selectedNetwork.asReadonly();
  readonly availableNetworks = computed(() => this._networks);
  readonly depth = computed(() => this._selectedNetwork().depth);
  readonly size = computed(() => this._selectedNetwork().size);
  readonly comparatorCount = computed(() => this._selectedNetwork().comparatorCount);

  selectNetwork(network: SortingNetwork): void {
    this._selectedNetwork.set(network);
  }

  selectNetworkBySize(size: number, smallestDepth = false): void {
    const match = this._networks.filter(n => n.size === size);
    if (match.length === 0) {
      return;
    }
    if (match.length === 1) {
      this._selectedNetwork.set(match[0]);
      return;
    }

    const bestMatch = match.find(n => smallestDepth ? n.name.includes("depth") : n.name.includes("size")) ?? match[0];
    this._selectedNetwork.set(bestMatch);

  }

  generateNetwork(size: number, algorithm: GeneratorAlgorithm = 'bitonic'): void {
    switch (algorithm) {
      case 'bitonic':
        this._selectedNetwork.set(generateBitonicNetwork(size));
        break;
      case 'oddEven':
        this._selectedNetwork.set(generateOddEvenNetwork(size));
        break;
      case 'pairwise':
        this._selectedNetwork.set(generatePairwiseNetwork(size));
        break;
      default:
        this._selectedNetwork.set(generateBitonicNetwork(size));
    }
  }
}
