import { Vec } from "./vec";

export class ProdFunc {
    n: number;
    a: Vec;
    alpha: Vec;
    b: Vec;
    beta: Vec;
    theta: Vec;

    constructor({
        a = new Vec(1, 1),
        alpha = new Vec(1, 1),
        b = new Vec(1, 1),
        beta = new Vec(1, 1),
        theta = new Vec(1, 1)
    } = {}) {
        this.n = a.length;
        if (alpha.length != this.n || b.length != this.n || beta.length != this.n || theta.length != this.n) {
            throw Error("Parameters to ProdFunc constructor must have equal length (=n)");
        }
        this.a = a;
        this.alpha = alpha;
        this.b = b;
        this.beta = beta;
        this.theta = theta;
    }

    f(xs: Vec, xp: Vec): [Vec, Vec] {
        const p = this.b.times(xp.pow(this.beta));
        const s = this.a.times(xs.pow(this.alpha)).div(p.pow(this.theta));
        return [s, p];
    }
}

function csf(i: number, p: Vec): number {
    return p[i] / p.sum();
}

function csfs(p: Vec): Vec {
    return p.scalarDiv(p.sum());
}

export function get_total_safety(s: Vec): number {
    return s.div(s.scalarPlus(1)).prod();
}

export class Problem {
    n: number;
    d: Vec;
    r: Vec;
    prodFunc: ProdFunc;
    
    constructor({
        d = new Vec(0, 0),
        r = new Vec(0.01, 0.01),
        prodFunc = new ProdFunc()
    } = {}) {
        this.n = prodFunc.n
        if (d.length != this.n || r.length != this.n) {
            throw Error("Parameters to Problem constructor must have equal length (=n)");
        }
        this.d = d;
        this.r = r;
        this.prodFunc = prodFunc;
    }

    payoff(i: number, xs: Vec, xp: Vec): number {
        const [s, p] = this.prodFunc.f(xs, xp);
        const safety = get_total_safety(s);
        return safety * csf(i, p) - (1 - safety) * this.d[i] - this.r[i] * (xs[i] + xp[i]);
    }

    payoffs(xs: Vec, xp: Vec): Vec {
        const [s, p] = this.prodFunc.f(xs, xp);
        const safety = get_total_safety(s);
        // out = (csf(p) + d) * safety - d - r * (xs + xp)
        return csfs(p).plus(this.d).scalarTimes(safety).sub(this.d).sub(
            this.r.times(xs.plus(xp))
        );
    }
}

// function test() {
//     let prodFunc = new ProdFunc();
//     let problem = new Problem({ prodFunc: prodFunc });
//     const xs = new Vec(1, 1);
//     const xp = new Vec(1, 2);
//     const payoffs = problem.payoffs(xs, xp);
//     console.log(payoffs);
// }