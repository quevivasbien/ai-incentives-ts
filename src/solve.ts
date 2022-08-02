import { minimize } from "./nelderMead"
import { Vec, vec } from "./vec"
import { get_total_safety, Problem } from "./problem"

class SolverResult {
    success: boolean;
    xs: Vec;
    xp: Vec;
    s: Vec;
    p: Vec;
    total_safety: number;
    payoffs: Vec;

    constructor(problem: Problem, success: boolean, xs: Vec, xp: Vec) {
        this.success = success;
        this.xs = xs;
        this.xp = xp;
        [this.s, this.p] = problem.prodFunc.f(xs, xp);
        this.total_safety = get_total_safety(this.s);
        this.payoffs = problem.payoffs(xs, xp);
    }
}

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
    solverMaxIters: number,
    solverSimplexSize: number
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
            {
                tolerance: solverTol,
                maxIterations: solverMaxIters,
                initSimplexSize: solverSimplexSize
            }
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
        tol = 1e-6,
        maxIters = 100,
        solverTol = 1e-10,
        solverMaxIters = 100,
        solverSimplexSize = 100
    } = {}
): SolverResult {
    let Xs = sampleLogNormal(problem.n);
    let Xp = sampleLogNormal(problem.n);
    for (let i = 0; i < maxIters; i++) {
        const [newXs, newXp] = solveIter(
            problem, Xs, Xp,
            solverTol, solverMaxIters, solverSimplexSize
        );
        if (approxEqual(newXs, Xs, tol)) {
            return new SolverResult(problem, true, newXs, newXp);
        }
        Xs = newXs;
        Xp = newXp;
    }
    console.log("Warning: maxIterations reached");
    return new SolverResult(problem, false, Xs, Xp);
}
