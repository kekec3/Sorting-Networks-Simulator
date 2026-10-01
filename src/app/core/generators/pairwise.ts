import { Comparator, SortingNetwork, Stage } from "../models/network.model";

export function generatePairwiseNetwork(size: number): SortingNetwork {
    if (size < 2) {
        return {
            size,
            stages: [],
            depth: 0,
            comparatorCount: 0,
            name: `Pairwise sort (N=${size})`,
        };
    }

    let paddedSize = 1;
    while (paddedSize < size) {
        paddedSize <<= 1;
    }

    const comparators: Comparator[] = [];

    for (let p = paddedSize >> 1; p >= 1; p >>= 1) {
        for (let a = 0; a < size; a += p << 1) {
            for (let b = 0; b < p; b++) {
                const lo = a + b;
                const hi = a + b + p;
                if (hi < size) {
                    comparators.push({ lo, hi });
                }
            }
        }

        for (let q = paddedSize >> 1; q >= p << 1; q >>= 1) {
            for (let c = 0; c < size; c += p << 1) {
                for (let d = 0; d < p; d++) {
                    const lo = c + d + p;
                    const hi = c + d + q;
                    if (hi < size) {
                        comparators.push({ lo, hi });
                    }
                }
            }
        }
    }

    const wireReady = new Array<number>(size).fill(0);
    const stages: Stage[] = [];

    for (const c of comparators) {
        const stageIdx = Math.max(wireReady[c.lo], wireReady[c.hi]);

        while (stages.length <= stageIdx) {
            stages.push([]);
        }

        stages[stageIdx].push(c);

        wireReady[c.lo] = stageIdx + 1;
        wireReady[c.hi] = stageIdx + 1;
    }

    return {
        size,
        stages,
        depth: stages.length,
        comparatorCount: comparators.length,
        name: `Pairwise sort (N=${size})`,
    };
}