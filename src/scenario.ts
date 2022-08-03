import { Vec, vec } from "./vec";
import { ProdFunc, Problem } from "./problem";
import { NMOptions } from "./nelderMead";
import { solve, SolverResult } from "./solve";

interface ValueMap<T> {
    [key: string]: T;
}

export class Scenario {
    n: number;
    params: ValueMap<Array<Vec>> = {};
    varying: string;
    nVarying: number;

    set_shape(param: string, value: number[][]): Array<Vec> {
        if (value.length > 1 && param != this.varying) {
            throw Error(`only varying param (${this.varying}) may vary in 2nd dim`);
        }
        if (!value.every((x) => x.length == value[0].length)) {
            throw Error(`values in ${param} must have equal length`);
        }
        if (value[0].length != 1 && value[0].length != this.n) {
            throw Error(`values in ${param} must have length 1 or length n = ${this.n}`);
        }
        if (value[0].length == 1) {
            // all players identical, just broadcast out
            if (param == this.varying) {
                let newValue: Array<Vec> = [];
                for (let x of value) {
                    newValue.push(vec(Array(this.n).fill(x[0])));
                }
                return newValue;
            }
            else {
                return Array(this.nVarying).fill(
                    vec(Array(this.n).fill(value[0][0]))
                );
            }
        }
        else if (value.length == 1) {
            return Array(this.nVarying).fill(vec(value[0]));
        }
        else {
            // must be varying param
            let newValue: Array<Vec> = [];
            for (let x of value) {
                newValue.push(vec(x));
            }
            return newValue;
        }
    }

    constructor(
        n: number,
        {
            a = [[1, 1]],
            alpha = [[1, 1]],
            b = [[1, 1]],
            beta =[[1, 1]],
            theta = [[1, 1]],
            d = [[1, 1]],
            r = [[0.01], [0.02], [0.03], [0.04]],
        }: ValueMap<number[][]> = {},
        varying = "r"
    ) {
        this.n = n;
        let params: ValueMap<number[][]> = {
            a: a,
            alpha: alpha,
            b: b,
            beta: beta,
            theta: theta,
            d: d,
            r: r
        };
        this.varying = varying;
        this.nVarying = params[varying].length;
        for (let param in params) {
            this.params[param] = this.set_shape(param, params[param]);
        }
    }

    solve(solverOptions: NMOptions = new NMOptions()): Array<SolverResult> {
        const results: Array<SolverResult> = [];
        console.log(this);
        for (let i = 0; i < this.nVarying; i++) {
            const prodFunc = new ProdFunc({
                a: <Vec>this.params.a[i],
                alpha: <Vec>this.params.alpha[i],
                b: <Vec>this.params.b[i],
                beta: <Vec>this.params.beta[i],
                theta: <Vec>this.params.theta[i]
            });
            const problem = new Problem({
                d: <Vec>this.params.d[i],
                r: <Vec>this.params.r[i],
                prodFunc: prodFunc
            });
            results.push(solve(problem, { solverOptions: solverOptions }));
        }
        return results;
    }
}

function expandValue(value: number | Array<number>, n: number) {
    if (value instanceof Array<number>) {
        return value;
    }
    else {
        return Array(n).fill(value);
    }
}

export function createScenario(
    n : number,
    varying: string = "r",
    stepsize: number | Array<number> = 0.01,
    steps: number = 10,
    {
        a = 1,
        alpha = 1,
        b = 1,
        beta = 1,
        theta = 1,
        d = 0,
        r = 0.01
    } : ValueMap<number | Array<number>> = {},
): Scenario {
    let params: ValueMap<Array<Array<number>>> = {
        a: [expandValue(a, n)],
        alpha: [expandValue(alpha, n)],
        b: [expandValue(b, n)],
        beta: [expandValue(beta, n)],
        theta: [expandValue(theta, n)],
        d: [expandValue(d, n)],
        r: [expandValue(r, n)]
    };
    let v: Array<Array<number>> = [];
    const stepsize_ = expandValue(stepsize, n);
    const basevals = params[varying][0];
    for (let i = 0; i < steps; i++) {
        let vi: Array<number> = [];
        for (let j = 0; j < n; j++) {
            vi.push(basevals[j] + i * stepsize_[j]);
        }
        v.push(vi);
    }
    params[varying] = v;
    return new Scenario(n, params);
}
