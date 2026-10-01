import { Comparator, SortingNetwork } from "../models/network.model";
import { pruneToSize } from "./prune";


function oddEvenMerge(lo: number, cnt: number, step: number): Comparator[][] {
    if (cnt <= 1)
        return [];

    const stages: Comparator[][] = [];

    if (cnt === 2) {
        stages.push([{ lo, hi: lo + step }]);
        return stages;
    }

    const evenStages = oddEvenMerge(lo, cnt >> 1, step << 1);
    const oddStages = oddEvenMerge(lo + step, cnt >> 1, step << 1);

    const maxLen = Math.max(evenStages.length, oddStages.length);
    for (let i = 0; i < maxLen; i++) {
        stages.push([
            ...(evenStages[i] ?? []),
            ...(oddStages[i] ?? [])
        ]);
    }

    const finalPass: Comparator[] = [];
    for (let i = lo + step; i + step < lo + cnt * step; i += step << 1) {
        finalPass.push({ lo: i, hi: i + step });
    }
    if (finalPass.length > 0)
        stages.push(finalPass);

    return stages;
}

function oddEvenSort(lo: number, cnt: number, step: number): Comparator[][] {
    if (cnt <= 1)
        return [];

    const half = cnt >> 1;

    const left = oddEvenSort(lo, half, step);
    const right = oddEvenSort(lo + half, half, step);

    const maxLen = Math.max(left.length, right.length);
    const zipped: Comparator[][] = [];
    for (let i = 0; i < maxLen; i++) {
        zipped.push([
            ...(left[i] ?? []),
            ...(right[i] ?? [])
        ]);
    }

    const merge = oddEvenMerge(lo, cnt, step);

    return [...zipped, ...merge];
}

export function generateOddEvenNetwork(size: number): SortingNetwork {
    if (size < 2) {
        return {
            size,
            stages: [],
            depth: 0,
            comparatorCount: 0,
            name: `Odd-Even Merge sort (N=${size})`,
        };
    }

    let paddedSize = 1;
    while (paddedSize < size)
        paddedSize <<= 1;

    const rawStages = oddEvenSort(0, paddedSize, 1);
    const stripped = pruneToSize(rawStages, size, paddedSize);

    const depth = stripped.length;
    const comparatorCount = stripped.reduce((sum, s) => sum + s.length, 0);

    return {
        size,
        stages: stripped,
        depth,
        comparatorCount,
        name: `Odd-Even Merge Sort (N=${size})`,
    };
}