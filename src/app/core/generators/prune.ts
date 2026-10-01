import { Comparator, Stage } from "../models/network.model";

export function pruneToSize(rawStages: Comparator[][], realSize: number, paddedSize: number): Stage[] {
    const isInf = new Array<boolean>(paddedSize);
    const wireOfChannel = new Array<number>(paddedSize).fill(-1);

    for (let i = 0; i < paddedSize; i++) {
        isInf[i] = i >= realSize;
        if (i < realSize) {
            wireOfChannel[i] = i;
        }
    }

    const prunedComparators: Comparator[] = [];

    for (const stage of rawStages) {
        for (const c of stage) {
            const dir = c.dir ?? 'asc';
            const u = c.lo;
            const v = c.hi;

            const uInf = isInf[u];
            const vInf = isInf[v];

            if (!uInf && !vInf) {
                const wU = wireOfChannel[u];
                const wV = wireOfChannel[v];

                const lo = Math.min(wU, wV);
                const hi = Math.max(wU, wV);

                let effDir: 'asc' | 'desc' = dir;
                if (wU > wV) {
                    effDir = dir === 'asc' ? 'desc' : 'asc';
                }

                prunedComparators.push({ lo, hi, dir: effDir });
            } else if (uInf && vInf) {
                continue;
            } else {
                const targetFiniteChannel = dir === 'asc' ? u : v;
                const currentFiniteChannel = !uInf ? u : v;

                if (currentFiniteChannel !== targetFiniteChannel) {
                    wireOfChannel[targetFiniteChannel] = wireOfChannel[currentFiniteChannel];
                    wireOfChannel[currentFiniteChannel] = -1;
                    isInf[targetFiniteChannel] = false;
                    isInf[currentFiniteChannel] = true;
                }
            }
        }
    }

    const wireReady = new Array<number>(realSize).fill(0);
    const stages: Stage[] = [];

    for (const c of prunedComparators) {
        const stageIdx = Math.max(wireReady[c.lo], wireReady[c.hi]);

        while (stages.length <= stageIdx) {
            stages.push([]);
        }

        stages[stageIdx].push(c);

        wireReady[c.lo] = stageIdx + 1;
        wireReady[c.hi] = stageIdx + 1;
    }

    return stages;
}