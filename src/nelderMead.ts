export class NMOptions {
    maxIterations: number;
    tolerance: number;
    initSimplexSize: number;
    alpha: number;
    gamma: number;
    rho: number;
    sigma: number;
    
    constructor({
        maxIterations = 500,
        tolerance = 1e-10,
        initSimplexSize = 1,
        alpha = 1,
        gamma = 1,
        rho = 0.75,
        sigma = 1
    } = {}) {
        this.maxIterations = maxIterations;
        this.tolerance = tolerance;
        this.initSimplexSize = initSimplexSize;
        this.alpha = alpha;
        this.gamma = gamma;
        this.rho = rho;
        this.sigma = sigma;
    }
}

class Result {
    constructor(
        public x: Array<number>,
        public fx: number,
        public iters: number,
        public success: boolean
    ) {}
}

type Objective = (x: Array<number>) => number;

function createSimplex(x0: Array<number>, nDims: number, size: number): Array<Array<number>> {
    let simplex = new Array<Array<number>>();
    simplex.push(x0);
    for (let i = 0; i < nDims; i++) {
        let x = [...x0];
        x[i] += size;
        simplex.push(x);
    }
    return simplex;
}

function sortAndGetVals(f: Objective, simplex: Array<Array<number>>): [Array<Array<number>>, Array<number>] {
    let values = new Array<number>();
    for (let i = 0; i < simplex.length; i++) {
        values.push(f(simplex[i]));
    }
    let indices = Array.from(simplex.keys());
    indices.sort((a, b) => values[a] - values[b]);
    let sortedSimplex = new Array<Array<number>>();
    let sortedValues = new Array<number>();
    for (let i = 0; i < simplex.length; i++) {
        sortedSimplex.push(simplex[indices[i]]);
        sortedValues.push(values[indices[i]]);
    }
    return [sortedSimplex, sortedValues];
}

function getCentroid(simplex: Array<Array<number>>, nDims: number): Array<number> {
    let centroid = new Array<number>();
    for (let i = 0; i < nDims; i++) {
        let sum = 0;
        // we exclude index j = nDims, because it is the worst point
        for (let j = 0; j < nDims; j++) {
            sum += simplex[j][i];
        }
        centroid.push(sum / nDims);
    }
    return centroid;
}

// function distance(x: Array<number>, y: Array<number>): number {
//     let sum = 0;
//     for (let i = 0; i < x.length; i++) {
//         sum += Math.pow(x[i] - y[i], 2);
//     }
//     return Math.sqrt(sum);
// }

function stdDev(values: Array<number>): number {
    const n = values.length;
    let squaredSum = 0;
    let sum = 0;
    for (let i = 0; i < n; i++) {
        squaredSum += Math.pow(values[i], 2);
        sum += values[i];
    }
    return Math.sqrt(squaredSum / (n - 1) - Math.pow(sum, 2) / (n * (n-1)));
}

function exit(values: Array<number>, tol: number): boolean {
    return stdDev(values) < tol;
}

function getReflected(simplex: Array<Array<number>>, centroid: Array<number>, nDims: number, alpha: number): Array<number> {
    let reflected = new Array<number>();
    for (let i = 0; i < nDims; i++) {
        reflected.push(centroid[i] + alpha * (centroid[i] - simplex[nDims][i]));
    }
    return reflected;
}

function getExpanded(centroid: Array<number>, reflected: Array<number>, nDims: number, gamma: number): Array<number> {
    let expanded = new Array<number>();
    for (let i = 0; i < nDims; i++) {
        expanded.push(centroid[i] + gamma * (reflected[i] - centroid[i]));
    }
    return expanded;
}

function getContracted(centroid: Array<number>, other: Array<number>, nDims: number, rho: number): Array<number> {
    let contracted = new Array<number>();
    for (let i = 0; i < nDims; i++) {
        contracted.push(centroid[i] + rho * (other[i] - centroid[i]));
    }
    return contracted;
}

function shrinkTowardBest(simplex: Array<Array<number>>, nDims: number, sigma: number): Array<Array<number>> {
    const best = simplex[0];
    for (let i = 1; i < nDims + 1; i++) {
        for (let j = 0; j < nDims; j++) {
            simplex[i][j] = best[j] + sigma * (simplex[i][j] - best[j]);
        }
    }
    return simplex;
}

export function minimize(
    f: Objective, x0: Array<number>, options: NMOptions = new NMOptions()
): Result {
    const nDims = x0.length;
    let simplex = createSimplex(x0, nDims, options.initSimplexSize);
    let values: Array<number>;
    for (let iter = 0; iter < options.maxIterations; iter++) {
        // (1) Order and decide whether to quit
        [simplex, values] = sortAndGetVals(f, simplex);
        if (exit(values, options.tolerance)) {
            return new Result(simplex[0], values[0], iter, true);
        }
        // (2) Get centroid
        const centroid = getCentroid(simplex, nDims);
        // (3) Get reflected point
        const reflected = getReflected(simplex, centroid, nDims, options.alpha);
        const f_reflected = f(reflected);
        if (f_reflected >= values[0] && f_reflected < values[nDims - 1]) {
            simplex[nDims] = reflected;
            continue;
        }
        // (4) If reflected point is best so far, get expanded point & continue
        if (f_reflected < values[0]) {
            const expanded = getExpanded(centroid, reflected, nDims, options.gamma);
            if (f(expanded) < f_reflected) {
                simplex[nDims] = expanded;
            }
            else {
                simplex[nDims] = reflected;
            }
            continue;
        }
        // (5) If reflected point is at least as bad as second-worst, get contracted point
        let contracted: Array<number>;
        if (f_reflected < values[nDims]) {
            contracted = getContracted(centroid, reflected, nDims, options.rho);
            if (f(contracted) < f_reflected) {
                simplex[nDims] = contracted;
                continue;
            }
        }
        else {
            contracted = getContracted(centroid, simplex[nDims], nDims, options.rho);
            if (f(contracted) < values[nDims]) {
                simplex[nDims] = contracted;
                continue;
            }
        }
        // (6) If contracted point is worst, shrink the simplex
        simplex = shrinkTowardBest(simplex, nDims, options.sigma);
    }
    console.log("Warning, did not converge in specified number of iterations");
    return new Result(simplex[0], f(simplex[0]), options.maxIterations, false);
}
