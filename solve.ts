import { minimize } from "./nelderMead"
import { Vec, vec } from "./vec"
import { Problem } from "./problem"

function randn(): number {
    let u = 0, v = 0;
    while (u === 0) {
        u = Math.random();
    }
    while (v === 0) {
        v = Math.random();
    }
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function sampleLogNormal(n: number, mu: number = 0, sigma: number = 1): Vec {
    const out = new Vec();
    for (let i = 0; i < n; i++) {
        out.push(Math.exp(mu + sigma * randn()));
    }
    return out;
}

function solveIter(
    problem: Problem,
    initXs: Vec,
    initXp: Vec,
    solverTol: number,
    solverMaxIters: number
): [Vec, Vec] {
    let Xs = new Vec();
    let Xp = new Vec();
    for (let i = 0; i < problem.n; i++) {
        let xs = vec(initXs);
        let xp = vec(initXp);
        const objective = (x: Array<number>) => {
            xs[i] = Math.exp(x[0]);
            xp[i] = Math.exp(x[1]);
            return -problem.payoff(i, xs, xp);
        }
        const res = minimize(
            objective, [Math.log(initXs[i]), Math.log(initXp[i])],
            { tolerance: solverTol, maxIterations: solverMaxIters, initSimplexSize: 10 }
        );
        Xs.push(Math.exp(res.x[0]));
        Xp.push(Math.exp(res.x[1]));
    }
    return [Xs, Xp];
}

function approxEqual(x: Vec, y: Vec, tol: number, eps: number = 1e-8): boolean {
    if (x.length !== y.length) {
        return false;
    }
    for (let i = 0; i < x.length; i++) {
        if (Math.abs((x[i] - y[i]) / (y[i] + eps)) > tol) {
            return false;
        }
    }
    return true;
}

export function solve(
    problem: Problem,
    {
        maxIterations = 100,
        tol = 1e-6,
        maxIters = 100,
        solverTol = 1e-10,
        solverMaxIters = 100
    } = {}
): [Vec, Vec] {
    let Xs = sampleLogNormal(problem.n);
    let Xp = sampleLogNormal(problem.n);
    for (let i = 0; i < maxIterations; i++) {
        const [newXs, newXp] = solveIter(problem, Xs, Xp, solverTol, solverMaxIters);
        if (approxEqual(newXs, Xs, tol)) {
            // console.log(`Exited on iteration ${i}`);
            return [newXs, newXp];
        }
        Xs = newXs;
        Xp = newXp;
    }
    console.log("Warning: maxIterations reached");
    return [Xs, Xp];
}

function test() {
    const problem = new Problem();
    const [Xs, Xp] = solve(problem);
    return [Xs, Xp];
}
console.log(test());