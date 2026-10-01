export interface Comparator {
    lo: number
    hi: number
    dir?: 'asc' | 'desc'
}

export type Stage = Comparator[]

export interface SortingNetwork {
    size: number;
    stages: Stage[];
    depth: number;
    comparatorCount: number;
    name: string;
}

export interface ExecutionState {
    stageIndex: number;
    microStep: number;
}

export interface SimulationStage {
    network: SortingNetwork;
    inputArray: number[];
    currentStage: Stage;
    arraySnapshots: number[][];
    swapCount: number;
    totalComparisons: number;
    doneComparisons: number;
}

export function widestStage(network: SortingNetwork): number {
    return Math.max(...network.stages.map(s => s.length));
}

export function stageUtilization(network: SortingNetwork, index: number): number {
    return network.stages[index].length / widestStage(network);
}

export function computeStagesSegments(stage: Stage): Comparator[][] {
    const stageSegments: Comparator[][] = [];

    stage.forEach(comp => {
        let placed = false;
        for (const segemnt of stageSegments) {
            const overlaps = segemnt.some(other => Math.max(comp.lo, other.lo) <= Math.min(comp.hi, other.hi));
            if (!overlaps) {
                segemnt.push(comp);
                placed = true;
                break;
            }
        }
        if (!placed) {
            stageSegments.push([comp]);
        }
    });

    return stageSegments;
}

export function stageBounds(comparators: { stageIndex: number, x: number }[]): { stageIndex: number, xMin: number, xMax: number }[] {
    const map = new Map<number, { xMin: number, xMax: number }>();
    comparators.forEach(({ stageIndex, x }) => {
        const existing = map.get(stageIndex);
        if (!existing) {
            map.set(stageIndex, { xMin: x, xMax: x });
        } else {
            map.set(stageIndex, { xMin: Math.min(existing.xMin, x), xMax: Math.max(existing.xMax, x) });
        }
    });

    let result: { stageIndex: number, xMin: number, xMax: number }[] = [];
    map.forEach((bounds, stageIndex) => {
        result.push({
            stageIndex,
            ...bounds
        });
    });
    result.sort((a, b) => a.stageIndex - b.stageIndex);
    return result;
}