import { Comparator, SortingNetwork } from "../models/network.model";
import { pruneToSize } from "./prune";

function bitonicMerge(lo: number, cnt: number, asc: boolean): Comparator[][] {
    if (cnt <= 1)
        return [];

    const stages: Comparator[][] = [];
    const half = cnt >> 1;

    const levelComparators: Comparator[] = [];
    for (let i = lo; i < lo + half; i++) {
        levelComparators.push({ lo: i, hi: i + half, dir: asc ? 'asc' : 'desc' })
    }
    stages.push(levelComparators);

    const left = bitonicMerge(lo, half, asc);
    const right = bitonicMerge(lo + half, half, asc);

    const maxLen = Math.max(left.length, right.length);
    for (let i = 0; i < maxLen; i++) {
        const merged: Comparator[] = [
            ...(left[i] ?? []),
            ...(right[i] ?? []),
        ];
        stages.push(merged);
    }

    return stages;
}

function bitonicSort(lo: number, cnt: number, asc: boolean): Comparator[][] {
    if (cnt <= 1)
        return [];

    const half = cnt >> 1;

    const left = bitonicSort(lo, half, true);
    const right = bitonicSort(lo + half, half, false);

    const maxLen = Math.max(left.length, right.length);
    const zipped: Comparator[][] = [];
    for (let i = 0; i < maxLen; i++) {
        zipped.push([
            ...(left[i] ?? []),
            ...(right[i] ?? []),
        ]);
    }

    const merge = bitonicMerge(lo, cnt, asc);

    return [...zipped, ...merge]
}

export function generateBitonicNetwork(size: number): SortingNetwork {
    if (size < 2)
        return { size, stages: [], depth: 0, comparatorCount: 0, name: `Bitonic sort (N=${size})` };

    let paddedSize = 1;
    while (paddedSize < size)
        paddedSize <<= 1;
    const rawStages = bitonicSort(0, paddedSize, true);

    const stripped = pruneToSize(rawStages, size, paddedSize);

    const depth = stripped.length;
    const comparatorCount = stripped.reduce((sum, s) => sum + s.length, 0);

    return { size, stages: stripped, depth, comparatorCount, name: `Bitonic sort (N=${size})` };
}